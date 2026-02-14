import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import Login from './src/components/Login';
import Otp from './src/components/Otp';
import Session from './src/components/Session';
import { otpService } from './src/services/otpService';
import { storageService } from './src/services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const [step, setStep] = useState('loading');
    const [email, setEmail] = useState('');
    const [session, setSession] = useState(null);
    const [otpExpiry, setOtpExpiry] = useState(null);
    const [otpAttempts, setOtpAttempts] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                const existingSession = await storageService.getSession();
                if (existingSession) {
                    setSession(existingSession);
                    setEmail(existingSession.email);
                    setStep('session');
                    return;
                }

                const pendingEmail = await AsyncStorage.getItem('pa_pending_email');
                if (pendingEmail) {
                    setEmail(pendingEmail);

                    const otpData = await storageService.getOtpData(pendingEmail);
                    if (otpData && otpData.expiresAt > Date.now()) {
                        setOtpExpiry(otpData.expiresAt);
                        setOtpAttempts(otpData.attempts || 0);
                        setStep('otp');
                    } else {
                        await AsyncStorage.removeItem('pa_pending_email');
                        setStep('email');
                    }
                } else {
                    setStep('email');
                }
            } catch (error) {
                console.error('Failed to initialize app', error);
                setStep('email');
            }
        };

        init();
    }, []);

    const handleSendOtp = async (inputEmail) => {
        setEmail(inputEmail);
        await AsyncStorage.setItem('pa_pending_email', inputEmail);

        const otpData = await otpService.generateOtp(inputEmail);

        setOtpExpiry(otpData.expiresAt);
        setOtpAttempts(0);

        setStep('otp');
    };

    const handleVerifyOtp = async (inputEmail, otp) => {
        const result = await otpService.validateOtp(inputEmail, otp);

        if (result.success) {
            const newSession = await storageService.saveSession(inputEmail);
            await AsyncStorage.removeItem('pa_pending_email');

            setSession(newSession);
            setStep('session');
        }
        return result;
    };

    const handleResendOtp = async (inputEmail) => {
        const otpData = await otpService.generateOtp(inputEmail);
        setOtpExpiry(otpData.expiresAt);
        setOtpAttempts(0);
    };

    const handleLogout = async () => {
        await storageService.clearSession();
        await AsyncStorage.removeItem('pa_pending_email');
        setSession(null);
        setEmail('');
        setStep('email');
    };

    if (step === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <View style={styles.contentContainer}>
                
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>
                        Auth<Text style={styles.logoHighlight}>Flow</Text>
                    </Text>
                    <Text style={styles.logoSubtext}>Secure. Simple. Passwordless.</Text>
                </View>

                {step === 'email' && <Login onSendOtp={handleSendOtp} />}

                {step === 'otp' && (
                    <Otp
                        email={email}
                        otpExpiry={otpExpiry}
                        initialAttempts={otpAttempts}
                        onVerifyOtp={handleVerifyOtp}
                        onResendOtp={handleResendOtp}
                    />
                )}

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
        backgroundColor: '#f8fafc',
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
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
    },
    logoHighlight: {
        color: '#4f46e5',
    },
    logoSubtext: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
});
