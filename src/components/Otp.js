import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const Otp = ({ email, otpExpiry, initialAttempts = 0, onVerifyOtp, onResendOtp }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const [timeLeft, setTimeLeft] = useState(() => {
        if (otpExpiry) {
            const seconds = Math.floor((otpExpiry - Date.now()) / 1000);
            return seconds > 0 ? seconds : 0;
        }
        return 60;
    });

    const [attempts, setAttempts] = useState(initialAttempts);

    useEffect(() => {
        if (otpExpiry) {
            const seconds = Math.floor((otpExpiry - Date.now()) / 1000);
            setTimeLeft(seconds > 0 ? seconds : 0);
        }
    }, [otpExpiry]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleSubmit = () => {
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            setError('OTP must be 6 digits.');
            return;
        }

        Promise.resolve(onVerifyOtp(email, otp)).then(result => {
            if (!result.success) {
                setError(result.message);
                setAttempts(prev => prev + 1);
            }
        });
    };

    const handleResend = () => {
        onResendOtp(email);
        setTimeLeft(60);
        setOtp('');
        setError('');
        setAttempts(0);
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
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px -5px rgba(224, 231, 255, 0.5)',
            },
            default: {
                shadowColor: '#e0e7ff',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
            },
        }),
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
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 4,
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
        backgroundColor: '#4f46e5',
        ...Platform.select({
             web: {
                 boxShadow: '0 4px 8px -2px rgba(99, 102, 241, 0.3)',
             },
             default: {
                 shadowColor: '#6366f1',
                 shadowOffset: { width: 0, height: 4 },
                 shadowOpacity: 0.3,
                 shadowRadius: 8,
                 elevation: 5,
            }
        }),
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
        ...Platform.select({
            web: { boxShadow: 'none' },
            default: {
                shadowOpacity: 0,
                elevation: 0,
            }
        }),
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
