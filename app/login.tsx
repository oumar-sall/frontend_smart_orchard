import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../shared/logger';
import { storage } from '../utils/storage';
import { countries, defaultCountry, Country } from '../constants/Countries';

import { API_URL } from '../constants/Api';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.callingCode.includes(searchQuery)
    );

    const handleLogin = async () => {
        // Nettoyage du numéro : on ne garde que les chiffres
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (!cleanPhone || cleanPhone.length < 8) {
            Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone valide');
            return;
        }

        const fullPhone = `${selectedCountry.callingCode}${cleanPhone}`;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone }),
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.token) {
                    await storage.setItem('userToken', data.token);
                    await storage.setItem('userData', JSON.stringify(data.user));
                    logger.info(`Connexion réussie pour ${fullPhone}`);
                    
                    if (!data.user.first_name || data.user.first_name === 'Nouveau') {
                        router.replace('/register' as any);
                    } else {
                        router.replace('/controllers' as any);
                    }
                }
            } else {
                const data = await response.json();
                Alert.alert('Erreur', data.error || 'Impossible de se connecter');
            }
        } catch (err: any) {
            logger.error('Erreur login:', err);
            Alert.alert('Erreur', 'Impossible de contacter le serveur.');
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
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={60} color="#4CAF50" />
                    </View>
                    <Text style={styles.title}>Smart Orchard</Text>
                    <Text style={styles.subtitle}>Gestion intelligente de vos vergers</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Numero de telephone</Text>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity 
                            style={styles.countryPickerBtn}
                            onPress={() => setIsPickerVisible(true)}
                        >
                            <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                            <Text style={styles.callingCodeText}>{selectedCountry.callingCode}</Text>
                            <Ionicons name="chevron-down" size={12} color="#666" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TextInput
                            style={styles.phoneInput}
                            placeholder="60000000"
                            value={phone}
                            onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
                            keyboardType="phone-pad"
                            autoFocus
                        />
                    </View>
                    <Text style={styles.hint}>Votre numero sera converti au format : {selectedCountry.callingCode}{phone || '...'}</Text>

                    <TouchableOpacity 
                        style={[styles.button, (loading || phone.length < 8) && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={loading || phone.length < 8}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </Text>
                    </TouchableOpacity>
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
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Modal de sélection de pays */}
            <Modal
                visible={isPickerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choisir un pays</Text>
                            <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher un pays ou code..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                        </View>

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.countryItem}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        setIsPickerVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <Text style={styles.itemFlag}>{item.flag}</Text>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemCode}>{item.callingCode}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                            <View style={styles.emptySearch}>
                                <Text style={styles.emptyText}>Aucun pays trouvé</Text>
                            </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
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
        borderRadius: 25,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#444',
        marginBottom: 15,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#eee',
        borderRadius: 15,
        paddingHorizontal: 12,
        height: 60,
        backgroundColor: '#f9f9f9',
    },
    countryPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingRight: 10,
    },
    flagText: {
        fontSize: 22,
    },
    callingCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#ddd',
        marginHorizontal: 10,
    },
    phoneInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    otpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    backBtn: {
        marginRight: 10,
        padding: 5,
    },
    otpSublabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    debugBox: {
        backgroundColor: '#FFF9C4',
        padding: 10,
        borderRadius: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#FBC02D',
    },
    debugText: {
        color: '#F57F17',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    hint: {
        fontSize: 13,
        color: '#66bb6a',
        marginTop: 10,
        marginBottom: 20,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#4CAF50',
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonDisabled: {
        backgroundColor: '#B2DFDB',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetCacheBtn: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.5,
    },
    resetCacheText: {
        color: '#999',
        fontSize: 13,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginHorizontal: 25,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: 15,
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    itemCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    emptySearch: {
        padding: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
