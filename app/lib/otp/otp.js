// lib/otp/otp.js
export const generateOTP = (length = 6) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
        let randomNumber = Math.floor(Math.random() * 10);
        otp += String(randomNumber);
    }
    return otp;
}

// Store OTPs in memory (use Redis or database in production)

export const storeOTP = (email, otp, expiryMinutes = 5) => {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    
    localStorage.set(email,{
        otp,
        expiryTime,
    });

    // Auto cleanup after expiry
    setTimeout(() => {
        otpStore.delete(email);
    }, expiryMinutes * 60 * 1000);
}

export const verifyOTP = (email, otp) => {
    const storedData = otpStore.get(email);
    
    // Fixed: typo was "storeOTP" instead of "storedData"
    console.log("Stored OTP data:", storedData);
    
    if (!storedData) {
        return { valid: false, message: "OTP not found or expired" };
    }
    
    if (Date.now() > storedData.expiryTime) {
        otpStore.delete(email);
        return { valid: false, message: "OTP has expired" };
    }
    
    if (storedData.otp !== otp) {
        return { valid: false, message: "Invalid OTP. Please try again" };
    }
    
    // Delete OTP after successful verification
    otpStore.delete(email);
    
    // Fixed: was returning valid: false instead of valid: true
    return { valid: true, message: "OTP verified successfully" };
}

