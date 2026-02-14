import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    SESSIONS: 'pa_sessions',
    OTP_DATA: 'pa_otp_data',
    EVENTS: 'pa_events',
};

export const storageService = {
    logEvent: async (eventName, details = {}) => {
        const timestamp = new Date().toISOString();
        const event = { eventName, details, timestamp };
        
        console.log(`Event: ${eventName}`, details);

        try {
            const existingHistory = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
            const history = existingHistory ? JSON.parse(existingHistory) : [];
            history.push(event);
            await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to log event', error);
        }
    },

    saveSession: async (email) => {
        const session = {
            email,
            startTime: Date.now(),
            isActive: true,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(session));
        
        await storageService.logEvent('SESSION_START', { email });
        return session;
    },

    getSession: async () => {
        try {
            const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
            if (!sessionJson) return null;

            const session = JSON.parse(sessionJson);
            return session && session.isActive ? session : null;
        } catch {
            return null;
        }
    },

    clearSession: async () => {
        const session = await storageService.getSession();
        if (session) {
            await storageService.logEvent('SESSION_END', { email: session.email, durationSec: (Date.now() - session.startTime) / 1000 });
        }
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
    },

    saveOtpData: async (email, otpData) => {
        try {
            const allDataJson = await AsyncStorage.getItem(STORAGE_KEYS.OTP_DATA);
            const allData = allDataJson ? JSON.parse(allDataJson) : {};
            
            allData[email] = otpData;
            
            await AsyncStorage.setItem(STORAGE_KEYS.OTP_DATA, JSON.stringify(allData));
        } catch (error) {
            console.error('Failed to save OTP data', error);
        }
    },

    getOtpData: async (email) => {
        try {
            const allDataJson = await AsyncStorage.getItem(STORAGE_KEYS.OTP_DATA);
            const allData = allDataJson ? JSON.parse(allDataJson) : {};
            return allData[email] || null;
        } catch {
            return null;
        }
    },
    
    clearOtpData: async (email) => {
        try {
            const allDataJson = await AsyncStorage.getItem(STORAGE_KEYS.OTP_DATA);
            const allData = allDataJson ? JSON.parse(allDataJson) : {};
            
            if (allData[email]) {
                delete allData[email];
                await AsyncStorage.setItem(STORAGE_KEYS.OTP_DATA, JSON.stringify(allData));
            }
        } catch (error) {
            console.error('Failed to clear OTP data', error);
        }
    }
};
