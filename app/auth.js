import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import userModel from "./models/userModel";
import connectDB from "./config/mongodb";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Called when user signs in
    async signIn({ user, account }) {
      await connectDB();

      const existingUser = await userModel.findOne({
        email: user.email,
        password: account.provider,
      });

      if (!existingUser) {
        const newUser = await userModel.create({
          name: user.name,
          email: user.email,
          avatarUrl: user.image,
          password: account.provider,
          providerAccountId: account.providerAccountId,
          resume:null,
          skills:[],
          portfolio:[]
        });

        user.id = newUser._id.toString();; // attach _id manually
      } else {
        user._id = existingUser._id.toString(); // attach _id manually
      }

      
      return true;
    },

    // Called after signIn to customize token
    async jwt({ token, user }) {
      if (user) {
        token.userId = user._id;
      }
      
      return token;
    },

    // Called to shape session sent to client
    async session({ session, token }) {
      session.user.id = token.userId;
      
      return session;
    },
  },
});
