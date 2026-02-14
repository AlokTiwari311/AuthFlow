import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';

/**
 * [ROLE: The Gatekeeper]
 * This component is the front door. It asks for your "Ticket" (Email).
 * It checks if the ticket looks real before bothering the Boss (App.jsx).
 */
const Login = ({ onSendOtp }) => {
    // --- STATE: Small Notebook ---
    // email: What the user is typing right now
    const [email, setEmail] = useState('');
    // error: If we need to shout an error message (like "Invalid Email!")
    const [error, setError] = useState('');

    // --- ACTION: User hits "Enter" or "Send OTP" ---
    const handleSubmit = () => {
        // 1. CHECK: Is the email blank? Does it look like an email?
        // /\S+@\S+\.\S+/ is a "Regex" pattern looking for "text@text.text"
        // Stricter email validation:
        // - Local part: letters, digits, dots, hyphens, underscores, plus signs
        // - @ symbol
        // - Domain: letters, digits, dots, hyphens (at least one dot)
        // - TLD: at least 2 letters
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email.trim())) {
            // If bad, show error and STOP here.
            setError('Please enter a valid email address.');
            return;
        }

        // 2. PASS: Clear any old errors.
        setError('');

        // 3. CALL BOSS: "Hey App! This email is good, let them in!"
        onSendOtp(email);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter your email to sign in to your account</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        placeholder="you@example.com"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus={true}
                    />
                    {/* Only show this red text if there is an error message */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Send OTP</Text>
                    </View>
                </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    inputError: {
        borderColor: '#f43f5e',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#f43f5e',
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#4f46e5', // Indigo-600
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
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default Login;
