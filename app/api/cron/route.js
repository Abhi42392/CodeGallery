import { NextResponse } from "next/server";
import connectRedis from "@/app/config/redis";
import ProjectModel from "@/app/models/ProjectModel";
import connectDB from "@/app/config/mongodb";

// Add a lock mechanism to prevent concurrent syncs
let isSyncing = false;

export async function GET() {
  // Prevent concurrent syncs
  if (isSyncing) {
    return NextResponse.json({
      message: "⏳ Sync already in progress",
    }, { status: 409 });
  }

  try {
    isSyncing = true;
    
    // Run updates in parallel for better performance
    const [likesResult, viewsResult] = await Promise.all([
      updateLikes(),
      updateViews()
    ]);

    return NextResponse.json({
      message: "✅ Data successfully synced from Redis to MongoDB",
      details: {
        likesUpdated: likesResult.updatedCount,
        viewsUpdated: viewsResult.updatedCount,
        keysCleared: likesResult.clearedKeys + viewsResult.clearedKeys
      }
    }, { status: 200 });
  } catch (err) {
    console.error("❌ Sync error:", err);
    return NextResponse.json({ 
      error: "Sync failed",
      details: err.message 
    }, { status: 500 });
  } finally {
    isSyncing = false;
  }
}

const updateLikes = async () => {
  const stats = { updatedCount: 0, clearedKeys: 0 };
  
  try {
    await connectDB();
    const redisClient = await connectRedis();
    
    // Get all post keys
    const keys = await redisClient.keys("post:*:likes");
    
    if (keys.length === 0) {
      console.log("No likes to sync");
      return stats;
    }

    // Batch process likes using pipeline for atomic operations
    const multi = redisClient.multi();
    const updates = [];

    for (const key of keys) {
      // Use GETDEL for atomic get and delete (Redis 6.2+)
      // If using older Redis, use GET followed by DEL in transaction
      multi.get(key);
    }

    const values = await multi.exec();

    // Prepare bulk updates for MongoDB
    const bulkOps = [];
    
    keys.forEach((key, index) => {
      const postId = key.split(":")[1];
      const likesCount = parseInt(values[index] || "0");

      if (likesCount !== 0) { // Handle both positive and negative
        bulkOps.push({
          updateOne: {
            filter: { _id: postId },
            update: { $inc: { likes: likesCount } },
            upsert: false
          }
        });
        stats.updatedCount++;
      }
    });

    // Perform bulk update if there are operations
    if (bulkOps.length > 0) {
      const result = await ProjectModel.bulkWrite(bulkOps, { ordered: false });
      console.log(`✅ Bulk updated ${result.modifiedCount} documents for likes`);
    }

    // Clear processed keys from Redis in a single transaction
    if (keys.length > 0) {
      const deleteMulti = redisClient.multi();
      keys.forEach(key => deleteMulti.del(key));
      await deleteMulti.exec();
      stats.clearedKeys = keys.length;
      console.log(`🧹 Cleared ${keys.length} like keys from Redis`);
    }

    return stats;
  } catch (err) {
    console.error("Error in updateLikes:", err);
    throw err;
  }
}

const updateViews = async () => {
  const stats = { updatedCount: 0, clearedKeys: 0 };
  
  try {
    await connectDB();
    const redisClient = await connectRedis();
    
    // Get all view tracking keys
    const viewKeys = await redisClient.sMembers("view-keys");
    
    if (viewKeys.length === 0) {
      console.log("No views to sync");
      return stats;
    }

    // Process views in batches to avoid memory issues
    const BATCH_SIZE = 100;
    const batches = [];
    
    for (let i = 0; i < viewKeys.length; i += BATCH_SIZE) {
      batches.push(viewKeys.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const bulkOps = [];
      const keysToDelete = [];

      // Use pipeline for efficient Redis operations
      const multi = redisClient.multi();
      batch.forEach(key => multi.sCard(key));
      const viewCounts = await multi.exec();

      batch.forEach((key, index) => {
        const postId = key.split(":")[1];
        const viewCount = viewCounts[index] || 0;

        if (viewCount > 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: postId },
              update: { $set: { views: viewCount } }, // Use $set for views (absolute value)
              upsert: false
            }
          });
          stats.updatedCount++;
        }
        
        keysToDelete.push(key);
      });

      // Perform bulk update for this batch
      if (bulkOps.length > 0) {
        const result = await ProjectModel.bulkWrite(bulkOps, { ordered: false });
        console.log(`✅ Bulk updated ${result.modifiedCount} documents for views`);
      }

      // Clear processed keys from Redis
      if (keysToDelete.length > 0) {
        const deleteMulti = redisClient.multi();
        
        // Remove from tracking set
        keysToDelete.forEach(key => {
          deleteMulti.sRem('view-keys', key);
          deleteMulti.del(key); // Also delete the actual view set
        });
        
        await deleteMulti.exec();
        stats.clearedKeys += keysToDelete.length;
        console.log(`🧹 Cleared ${keysToDelete.length} view keys from Redis`);
      }
    }

    return stats;
  } catch (err) {
    console.error("Error in updateViews:", err);
    throw err;
  }
}

// Optional: Add a scheduled cleanup function for orphaned keys
export async function cleanupOrphanedKeys() {
  try {
    const redisClient = await connectRedis();
    
    // Find and remove orphaned keys older than 7 days
    const allKeys = await redisClient.keys("post:*");
    const multi = redisClient.multi();
    let cleanedCount = 0;

    for (const key of allKeys) {
      multi.ttl(key);
    }

    const ttls = await multi.exec();
    
    const deleteMulti = redisClient.multi();
    allKeys.forEach((key, index) => {
      // If key has no TTL and is old, set expiration
      if (ttls[index] === -1) {
        deleteMulti.expire(key, 604800); // 7 days
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      await deleteMulti.exec();
      console.log(`🧹 Set expiration for ${cleanedCount} orphaned keys`);
    }

    return cleanedCount;
  } catch (err) {
    console.error("Error in cleanup:", err);
    throw err;
  }
}