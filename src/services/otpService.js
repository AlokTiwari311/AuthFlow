/**
 * [ROLE: The Security Team]
 * This file handles the "Business Logic" of the OTP.
 * It's like a referee that enforces the rules of the game.
 * 
 * Rules:
 * 1. Code lasts 60 seconds.
 * 2. You only get 3 tries.
 * 3. Code must be a 6-digit number.
 */
import { storageService } from './storageService';

const OTP_VALIDITY_MS = 60 * 1000; // 60 seconds (1000 ms = 1 second)
const MAX_ATTEMPTS = 3; // Three strikes and you're out!

export const otpService = {
  // --- ACTION: Create a new code ---
  generateOtp: async (email) => {
    // 1. GENERATE: Create a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. EXPIRY: Calculate when this code dies (Now + 60s)
    const expiresAt = Date.now() + OTP_VALIDITY_MS;

    const otpData = {
      email,
      otp,
      expiresAt,
      attempts: 0, // Starts with 0 bad guesses
      isUsed: false,
    };

    // 3. SAVE: Put it in the "Safe" (Storage)
    await storageService.saveOtpData(email, otpData);

    // 4. LOG: Record that we did this
    await storageService.logEvent('OTP_GENERATED', { email });

    // 5. RETURN: Give back the full data so the App can update the UI
    const logOtp = otp;
    console.log(`%c[OTP SERVICE] Generated OTP for ${email}: ${logOtp}`, 'color: green; font-weight: bold; font-size: 14px;');
    return otpData;
  },

  // --- ACTION: Check if a code is valid ---
  validateOtp: async (email, inputOtp) => {
    // 1. RETRIEVE: Get the real code from the "Safe"
    const data = await storageService.getOtpData(email);

    // Case 1: No code found (maybe they never asked for one?)
    if (!data) {
      await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'NO_DATA' });
      return { success: false, message: 'OTP expired or not requested.' };
    }

    // Case 2: Time ran out
    if (Date.now() > data.expiresAt) {
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'EXPIRED' });
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Case 3: Too many wrong guesses
    if (data.attempts >= MAX_ATTEMPTS) {
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'MAX_ATTEMPTS_EXCEEDED' });
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Case 4: Wrong Code
    if (data.otp !== inputOtp) {
        // Increment their "Bad Guess" count
        data.attempts += 1;
        await storageService.saveOtpData(email, data); // Save the new count
        
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'INCORRECT_VALUE', attempts: data.attempts });
        return { success: false, message: `Incorrect OTP. ${MAX_ATTEMPTS - data.attempts} attempts remaining.` };
    }

    // Case 5: SUCCESS!
    await storageService.logEvent('OTP_VALIDATED', { email });
    
    // BURN THE CODE: Remove it so it can't be used twice
    await storageService.clearOtpData(email);
    
    return { success: true };
  }
};
