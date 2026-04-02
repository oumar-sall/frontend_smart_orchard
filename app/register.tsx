import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { logger } from '../shared/logger';
import { storage } from '../utils/storage';
import { API_URL } from '../constants/Api';

export default function RegisterScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [agreedToCGU, setAgreedToCGU] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!firstName || !lastName) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (!agreedToCGU) {
            Alert.alert('Erreur', 'Vous devez accepter les conditions générales d\'utilisation');
            return;
        }

        setLoading(true);
        try {
            const token = await storage.getItem('userToken');
            
            // Appeler l'API pour mettre à jour le nom/prénom
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName }),
            });

            if (response.ok) {
                const data = await response.json();
                // Mettre à jour le cache local
                await storage.setItem('userData', JSON.stringify(data.user));
                
                Alert.alert('Succès', 'Profil complété avec succès !', [
                    { text: 'Continuer', onPress: () => router.replace('/controllers' as any) }
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Erreur', errorData.error || 'Impossible de mettre à jour le profil');
            }
        } catch (err) {
            logger.error('Erreur inscription:', err);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Bienvenue !</Text>
                    <Text style={styles.subtitle}>Complétez votre profil pour continuer</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Jean"
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Dupont"
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    <View style={styles.cguRow}>
                        <Switch
                            value={agreedToCGU}
                            onValueChange={setAgreedToCGU}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={agreedToCGU ? '#2196F3' : '#f4f3f4'}
                        />
                        <View style={styles.cguTextContainer}>
                            <Text style={styles.cguText}>
                                J&apos;accepte les{' '}
                                <Text 
                                    style={styles.cguLink} 
                                    onPress={() => router.push('/cgu')}
                                >
                                    conditions générales d&apos;utilisation
                                </Text>
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Enregistrement...' : 'Commencer'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </TouchableWithoutFeedback>
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
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
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
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 10,
    },
    cguRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    cguTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    cguText: {
        fontSize: 14,
        color: '#333',
    },
    cguLink: {
        color: '#2196F3',
        textDecorationLine: 'underline',
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
});
