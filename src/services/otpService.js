import { storageService } from './storageService';

const OTP_VALIDITY_MS = 60 * 1000;
const MAX_ATTEMPTS = 3;

export const otpService = {
  generateOtp: async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = Date.now() + OTP_VALIDITY_MS;

    const otpData = {
      email,
      otp,
      expiresAt,
      attempts: 0,
      isUsed: false,
    };

    await storageService.saveOtpData(email, otpData);

    await storageService.logEvent('OTP_GENERATED', { email });

    const logOtp = otp;
    console.log(`%c[OTP SERVICE] Generated OTP for ${email}: ${logOtp}`, 'color: green; font-weight: bold; font-size: 14px;');
    return otpData;
  },

  validateOtp: async (email, inputOtp) => {
    const data = await storageService.getOtpData(email);

    if (!data) {
      await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'NO_DATA' });
      return { success: false, message: 'OTP expired or not requested.' };
    }

    if (Date.now() > data.expiresAt) {
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'EXPIRED' });
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (data.attempts >= MAX_ATTEMPTS) {
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'MAX_ATTEMPTS_EXCEEDED' });
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (data.otp !== inputOtp) {
        data.attempts += 1;
        await storageService.saveOtpData(email, data);
        
        await storageService.logEvent('OTP_VALIDATION_FAILED', { email, reason: 'INCORRECT_VALUE', attempts: data.attempts });
        return { success: false, message: `Incorrect OTP. ${MAX_ATTEMPTS - data.attempts} attempts remaining.` };
    }

    await storageService.logEvent('OTP_VALIDATED', { email });
    
    await storageService.clearOtpData(email);
    
    return { success: true };
  }
};
