import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSessionTimer } from '../hooks/useSessionTimer';

/**
 * [ROLE: The VIP Room / Party]
 * This component is where the user lands after logging in.
 * It shows their "Wristband" (Session info) and how long they've been here.
 */
const Session = ({ session, onLogout }) => {
    // --- HOOK: The Stopwatch ---
    // We use our custom tool (useSessionTimer) to count the seconds since they arrived.
    const { formattedDuration } = useSessionTimer(session?.startTime);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* 1. Nice Green Checkmark Icon (Simulated with Text/View here) */}
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>✓</Text>
                </View>

                {/* 2. Welcome Message */}
                <Text style={styles.greeting}>Welcome!</Text>
                <Text style={styles.message}>
                    You are securely logged in as{'\n'}
                    <Text style={styles.emailText}>{session?.email}</Text>
                </Text>

                {/* 3. The Timer Box */}
                <View style={styles.timerBox}>
                    <Text style={styles.timerLabel}>Session Duration</Text>
                    {/* The ticking clock from our hook */}
                    <Text style={styles.timerValue}>{formattedDuration}</Text>
                    <Text style={styles.timerSubtext}>
                        Started at: {new Date(session?.startTime).toLocaleTimeString()}
                    </Text>
                </View>

                {/* 4. The Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout} // Calls the "Bouncer" (App.js) to kick us out
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutText}>Sign Out</Text>
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
                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)', // Emerald shadow
            },
            default: {
                shadowColor: '#10b981', // Emerald shadow
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
            },
        }),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#d1fae5', // Emerald-100
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 32,
        color: '#059669', // Emerald-600
        fontWeight: 'bold',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    emailText: {
        fontWeight: '700',
        color: '#1e293b',
    },
    timerBox: {
        width: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    timerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    timerValue: {
        fontSize: 40,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#4f46e5', // Indigo-600
        letterSpacing: 2,
    },
    timerSubtext: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 8,
    },
    logoutButton: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#fff1f2', // Rose-50
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffe4e6', // Rose-100
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e11d48', // Rose-600
    },
});

export default Session;
