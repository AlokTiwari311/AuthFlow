import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import Login from './src/components/Login';
import Otp from './src/components/Otp';
import Session from './src/components/Session';
import { otpService } from './src/services/otpService';
import { storageService } from './src/services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * [ROLE: The Boss / Controller]
 * This file is the "Brain" of the UI. It decides which screen to show (Login -> Otp -> Session).
 * It also handles the "Memory" (State Persistence) so the user doesn't lose their place on refresh.
 */

export default function App() {
    // --- STATE: The "Clipboard" ---
    // step: Keeps track of which screen the user is on ('loading', 'email', 'otp', 'session')
    const [step, setStep] = useState('loading');
    // email: Remembering the user's email address
    const [email, setEmail] = useState('');
    // session: Storing logged-in user data
    const [session, setSession] = useState(null);
    // otpExpiry: Remembering when the OTP expires (so we can show the timer)
    const [otpExpiry, setOtpExpiry] = useState(null);
    // otpAttempts: Counting how many times they guessed wrong
    const [otpAttempts, setOtpAttempts] = useState(0);

    // --- EFFECT: The "Wake Up" Routine ---
    // This runs ONCE when the app first loads (like when you hit refresh)
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Check if the user was already logged in (Party is ongoing!)
                const existingSession = await storageService.getSession();
                if (existingSession) {
                    setSession(existingSession);
                    setEmail(existingSession.email);
                    setStep('session'); // Jump straight to the party
                    return;
                }

                // 2. Check if the user was in the middle of logging in (Waiting in line)
                const pendingEmail = await AsyncStorage.getItem('pa_pending_email');
                if (pendingEmail) {
                    setEmail(pendingEmail);

                    // Check if their "ticket" (OTP) is still valid
                    const otpData = await storageService.getOtpData(pendingEmail);
                    if (otpData && otpData.expiresAt > Date.now()) {
                        // Ticket is good! Restore their spot in line.
                        setOtpExpiry(otpData.expiresAt);
                        setOtpAttempts(otpData.attempts || 0);
                        console.log(`[OTP SERVICE] Restored OTP for ${pendingEmail}: ${otpData.otp}`);
                        setStep('otp');
                    } else {
                        // Ticket expired while they were gone. Send them back to start.
                        await AsyncStorage.removeItem('pa_pending_email');
                        setStep('email');
                    }
                } else {
                    // No history found. Start fresh.
                    setStep('email');
                }
            } catch (error) {
                console.error('Failed to initialize app', error);
                setStep('email');
            }
        };

        init();
    }, []);

    // --- ACTION: User Submitted Email ---
    const handleSendOtp = async (inputEmail) => {
        setEmail(inputEmail);
        await AsyncStorage.setItem('pa_pending_email', inputEmail); // Write in "Permanent Notebook" for refresh safety

        // Ask Security (otpService) to generate a code
        const otpData = await otpService.generateOtp(inputEmail);

        // Save the expiry time so we can show the countdown
        setOtpExpiry(otpData.expiresAt);
        setOtpAttempts(0); // Reset "Bad Guesses" to 0

        setStep('otp'); // Move to the next screen
    };

    // --- ACTION: User Submitted Code ---
    // NOTE: validationResult is returned directly or as promise
    const handleVerifyOtp = async (inputEmail, otp) => {
        // Ask Security if the code is correct
        const result = await otpService.validateOtp(inputEmail, otp);

        if (result.success) {
            // Success! Create a session (Wristband)
            const newSession = await storageService.saveSession(inputEmail);
            await AsyncStorage.removeItem('pa_pending_email'); // Only needed pending email while verifying

            setSession(newSession);
            setStep('session'); // Open the door!
        }
        // If failed, we return the error so the Otp component can show it (e.g., "Wrong Code")
        return result;
    };

    // --- ACTION: User Requested New Code ---
    const handleResendOtp = async (inputEmail) => {
        // Generate a fresh code
        const otpData = await otpService.generateOtp(inputEmail);
        setOtpExpiry(otpData.expiresAt);
        setOtpAttempts(0); // Reset strikes
    };

    // --- ACTION: User Clicked Logout ---
    const handleLogout = async () => {
        await storageService.clearSession(); // Tear up the wristband
        await AsyncStorage.removeItem('pa_pending_email'); // Clear any pending data
        setSession(null);
        setEmail('');
        setStep('email'); // Kick them out to the street (Login screen)
    };

    // Show a loading spinner while we check the "Wake Up" routine
    if (step === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Render the actual screens based on `step`
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <View style={styles.contentContainer}>
                
                {/* Header (Logo) */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>
                        Auth<Text style={styles.logoHighlight}>Flow</Text>
                    </Text>
                    <Text style={styles.logoSubtext}>Secure. Simple. Passwordless.</Text>
                </View>

                {/* SCREEN 1: Login Form */}
                {step === 'email' && <Login onSendOtp={handleSendOtp} />}

                {/* SCREEN 2: Enter OTP Code */}
                {step === 'otp' && (
                    <Otp
                        email={email}
                        otpExpiry={otpExpiry}
                        initialAttempts={otpAttempts}
                        onVerifyOtp={handleVerifyOtp}
                        onResendOtp={handleResendOtp}
                    />
                )}

                {/* SCREEN 3: Logged In (The Party) */}
                {step === 'session' && (
                    <Session
                        session={session}
                        onLogout={handleLogout}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // slate-50
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800', // extra-bold
        color: '#0f172a', // slate-900
    },
    logoHighlight: {
        color: '#4f46e5', // indigo-600
    },
    logoSubtext: {
        fontSize: 16,
        color: '#64748b', // slate-500
        marginTop: 4,
    },
});
