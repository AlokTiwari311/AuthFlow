import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * [ROLE: The Security Check]
 * This component is where the user enters the secret code.
 * It handles the input, the countdown timer, and the "Locked" state.
 */
const Otp = ({ email, otpExpiry, initialAttempts = 0, onVerifyOtp, onResendOtp }) => {
    // --- STATE: The Form Data ---
    // otp: The 6 numbers the user is typing
    const [otp, setOtp] = useState('');

    // error: If they type the wrong code
    const [error, setError] = useState('');

    // timeLeft: The countdown on the wall (in seconds)
    const [timeLeft, setTimeLeft] = useState(() => {
        // Calculate initial time left based on the expiry date
        if (otpExpiry) {
            const seconds = Math.floor((otpExpiry - Date.now()) / 1000);
            return seconds > 0 ? seconds : 0;
        }
        return 60; // Default to 60s
    });

    // attempts: Counting wrong guesses locally (to transform the UI)
    const [attempts, setAttempts] = useState(initialAttempts);

    // --- EFFECT: Sync Timer with Expiry ---
    // If the Boss (App.js) updates the expiry time (e.g., Resend clicked), update our timer.
    useEffect(() => {
        if (otpExpiry) {
            const seconds = Math.floor((otpExpiry - Date.now()) / 1000);
            setTimeLeft(seconds > 0 ? seconds : 0);
        }
    }, [otpExpiry]);

    // --- EFFECT: The Ticking Clock ---
    // This runs every time `timeLeft` changes (which is every second!)
    useEffect(() => {
        // Only tick if there is time remaining
        if (timeLeft > 0) {
            // Wait 1 second (1000ms), then reduce time by 1
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);

            // CLEANUP: If the component disappears before 1s, cancel the timer
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    // --- ACTION: User submits code ---
    const handleSubmit = () => {
        // 1. Basic Validation: Is it 6 digits?
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            setError('OTP must be 6 digits.');
            return;
        }

        // 2. Ask the Boss (App.js) to verify
        // Note: verify function in App.js is likely async now, so we handle promise if needed,
        // but here we expect it to return a result object or promise.
        // Let's assume it returns a promise or object.
        Promise.resolve(onVerifyOtp(email, otp)).then(result => {
             // 3. Handle Failure
            if (!result.success) {
                setError(result.message); // Show "Wrong Code"
                setAttempts(prev => prev + 1); // Add a strike
            }
            // If success, the App component will unmount us and show the Session screen.
        });
    };

    // --- ACTION: User requests new code ---
    const handleResend = () => {
        onResendOtp(email); // Tell App to make new code
        setTimeLeft(60);    // Reset local timer visual
        setOtp('');         // Clear input box
        setError('');       // Clear old errors
        setAttempts(0);     // Reset strikes
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.subtitle}>
                    We sent a code to <Text style={styles.emailText}>{email}</Text>
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter 6-digit OTP</Text>
                    <TextInput
                        style={styles.otpInput}
                        maxLength={6}
                        placeholder="123456"
                        placeholderTextColor="#cbd5e1"
                        value={otp}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                            // Only let them type numbers
                            if (/^\d*$/.test(text)) setOtp(text);
                        }}
                        autoFocus={true}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.button, attempts >= 3 && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={attempts >= 3}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {attempts >= 3 ? 'Locked' : 'Verify & Login'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    {/* Show Timer OR "Resend" button if time is up */}
                    {timeLeft > 0 ? (
                        <Text style={styles.timerText}>
                            Resend code in <Text style={styles.timerBold}>{timeLeft}s</Text>
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendLink}>Resend Code</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#e0e7ff',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    emailText: {
        fontWeight: '600',
        color: '#334155',
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    otpInput: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 28, // Large text for OTP
        fontWeight: 'bold',
        letterSpacing: 4, // Spacing between numbers
        color: '#1e293b',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#f43f5e',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#4f46e5', // Indigo-600
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8', // Gray
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    footer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 14,
        color: '#64748b',
    },
    timerBold: {
        fontWeight: '600',
        color: '#1e293b',
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
        textDecorationLine: 'underline',
    },
});

export default Otp;
