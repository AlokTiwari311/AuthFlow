import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSessionTimer } from '../hooks/useSessionTimer';

const Session = ({ session, onLogout }) => {
    const { formattedDuration } = useSessionTimer(session?.startTime);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>✓</Text>
                </View>

                <Text style={styles.greeting}>Welcome!</Text>
                <Text style={styles.message}>
                    You are securely logged in as{'\n'}
                    <Text style={styles.emailText}>{session?.email}</Text>
                </Text>

                <View style={styles.timerBox}>
                    <Text style={styles.timerLabel}>Session Duration</Text>
                    <Text style={styles.timerValue}>{formattedDuration}</Text>
                    <Text style={styles.timerSubtext}>
                        Started at: {new Date(session?.startTime).toLocaleTimeString()}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
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
                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)', 
            },
            default: {
                shadowColor: '#10b981', 
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
        backgroundColor: '#d1fae5', 
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 32,
        color: '#059669',
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
        color: '#4f46e5',
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
        backgroundColor: '#fff1f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffe4e6',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e11d48',
    },
});

export default Session;
