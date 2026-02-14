import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * [ROLE: The Librarian / Memory]
 * This file handles saving data so it doesn't disappear when you close the app.
 * It uses "AsyncStorage" which is like a permanent notebook on the phone.
 * 
 * It also pretends to be an "Analytics" tool, logging what you do.
 */

const STORAGE_KEYS = {
    SESSIONS: 'pa_sessions', // Where we keep the "Logged In" status
    OTP_DATA: 'pa_otp_data', // Where we keep the secret codes
    EVENTS: 'pa_events',     // Where we write down history (Analytics)
};

export const storageService = {
    // --- ANALYTICS: Writing down history ---
    logEvent: async (eventName, details = {}) => {
        const timestamp = new Date().toISOString();
        const event = { eventName, details, timestamp };
        
        // 1. Show in the DevTools Console (for us developers)
        console.log(`Event: ${eventName}`, details);

        try {
            // 2. Save to history (Simulation)
            const existingHistory = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
            const history = existingHistory ? JSON.parse(existingHistory) : [];
            history.push(event);
            await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to log event', error);
        }
    },

    // --- SESSION: Remembering who is logged in ---
    saveSession: async (email) => {
        // Create a "Wristband" (Session Object)
        const session = {
            email,
            startTime: Date.now(),
            isActive: true,
        };
        // Save the wristband in the notebook
        await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(session));
        
        // Log it
        await storageService.logEvent('SESSION_START', { email });
        return session;
    },

    // check if someone is already logged in
    getSession: async () => {
        try {
            // Read from notebook
            const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
            if (!sessionJson) return null;

            const session = JSON.parse(sessionJson);
            // Only return it if it says "isActive: true"
            return session && session.isActive ? session : null;
        } catch {
            return null; // If notebook is messy/corrupted, assume nobody is logged in
        }
    },

    // Log the user out
    clearSession: async () => {
        const session = await storageService.getSession();
        if (session) {
            // Log how long they stayed
            await storageService.logEvent('SESSION_END', { email: session.email, durationSec: (Date.now() - session.startTime) / 1000 });
        }
        // Tear up the page in the notebook
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
    },

    // --- OTP DATA: The "Safe" ---
    // Save the secret code
    saveOtpData: async (email, otpData) => {
        try {
            // 1. Get all codes (because maybe other users exist too!)
            const allDataJson = await AsyncStorage.getItem(STORAGE_KEYS.OTP_DATA);
            const allData = allDataJson ? JSON.parse(allDataJson) : {};
            
            // 2. Add our code to the list
            allData[email] = otpData;
            
            // 3. Save the list back
            await AsyncStorage.setItem(STORAGE_KEYS.OTP_DATA, JSON.stringify(allData));
        } catch (error) {
            console.error('Failed to save OTP data', error);
        }
    },

    // Retrieve the secret code
    getOtpData: async (email) => {
        try {
            const allDataJson = await AsyncStorage.getItem(STORAGE_KEYS.OTP_DATA);
            const allData = allDataJson ? JSON.parse(allDataJson) : {};
            // Return only the one for THIS email
            return allData[email] || null;
        } catch {
            return null;
        }
    },
    
    // Delete the secret code (after use)
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
