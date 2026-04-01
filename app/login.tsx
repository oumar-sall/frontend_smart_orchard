import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../shared/logger';
import { storage } from '../utils/storage';

import { API_URL } from '../constants/Api';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone valide');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            if (response.ok) {
                setStep('otp');
                logger.info(`OTP envoyé pour ${phone}`);
                Alert.alert("Code envoyé", "Le code de test est 123456 (Voir aussi votre terminal backend)");
            } else {
                const data = await response.json();
                console.error("Réponse backend erronée:", data);
                Alert.alert('Erreur', data.error || 'Impossible d\'envoyer le code');
            }
        } catch (err: any) {
            console.error('ERREUR FETCH send-otp:', err);
            logger.error('Erreur send-otp:', err);
            Alert.alert('Erreur de connexion', 
                `Impossible de contacter le serveur à ${API_URL}. \n\nErreur: ${err.message}\n\nVérifiez que le serveur tourne et que l'IP dans front/constants/Api.ts est correcte.`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Sauvegarder le token et les infos utilisateur
                await storage.setItem('userToken', data.token);
                await storage.setItem('userData', JSON.stringify(data.user));
                
                logger.info(`Connexion réussie pour ${phone}`);

                if (data.isNewUser) {
                    router.replace('/register');
                } else {
                    router.replace('/controllers' as any);
                }
            } else {
                Alert.alert('Erreur', data.error || 'Code incorrect');
            }
        } catch (err) {
            logger.error('Erreur verify-otp:', err);
            Alert.alert('Erreur', 'Impossible de contacter le serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={60} color="#4CAF50" />
                    </View>
                    <Text style={styles.title}>Smart Orchard</Text>
                    <Text style={styles.subtitle}>Gestion intelligente de vos vergers</Text>
                </View>

                <View style={styles.card}>
                    {step === 'phone' ? (
                        <>
                            <Text style={styles.label}>Numéro de téléphone</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="+33612345678"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    autoFocus
                                />
                            </View>
                            <Text style={styles.hint}>Utilisez le format international avec le +</Text>
                            
                            <TouchableOpacity 
                                style={[styles.button, loading && styles.buttonDisabled]} 
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Envoi en cours...' : 'Recevoir le code'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Code de vérification</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="123456"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>
                            <Text style={styles.hint}>Saisissez le code reçu (voir console backend)</Text>
                            
                            <TouchableOpacity 
                                style={[styles.button, loading && styles.buttonDisabled]} 
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Vérification...' : 'Se connecter'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={() => setStep('phone')}
                            >
                                <Text style={styles.secondaryButtonText}>Changer de numéro</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Bouton de secours pour vider le cache */}
                <TouchableOpacity 
                    style={styles.resetCacheBtn} 
                    onPress={async () => {
                        await storage.clearAll();
                        Alert.alert('Succès', 'Cache vidé. L\'application va redémarrer.');
                        // On pourrait utiliser Updates.reloadAsync() mais clearAll() suffit souvent
                        // à débloquer le RootLayout.
                        router.replace('/login');
                    }}
                >
                    <Ionicons name="refresh-circle-outline" size={20} color="#999" />
                    <Text style={styles.resetCacheText}>Réinitialiser l&apos;application</Text>
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: 'white',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        backgroundColor: '#fafafa',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: '#333',
    },
    hint: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    resetCacheBtn: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.6,
    },
    resetCacheText: {
        color: '#999',
        fontSize: 13,
        fontWeight: '600',
    }
});
