import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CGUScreen() {
    const router = useRouter();

    const sections = [
        {
            title: "1. Présentation de l'Application",
            content: "Smart Orchard est une plateforme de gestion connectée pour vergers, permettant le contrôle à distance de l'irrigation et la surveillance des capteurs via les boîtiers GalileoSky."
        },
        {
            title: "2. Données Personnelles",
            content: "Nous collectons uniquement votre numéro de téléphone pour l'authentification et votre nom/prénom pour la personnalisation de votre espace. Aucune donnée n'est revendue à des tiers."
        },
        {
            title: "3. Utilisation des Boîtiers",
            content: "L'accès aux boîtiers est protégé par un PIN de sécurité défini lors du premier appairage. Vous êtes responsable de la confidentialité de ce PIN."
        },
        {
            title: "4. Responsabilité",
            content: "Smart Orchard décline toute responsabilité en cas de dommages causés par une mauvaise configuration des seuils d'arrosage ou une défaillance de la connectivité réseau du boîtier."
        },
        {
            title: "5. Modification des Conditions",
            content: "Nous nous réservons le droit de modifier ces conditions à tout moment. Vous serez informé de tout changement majeur via l'application."
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Conditions Générales</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.intro}>
                    Dernière mise à jour : 1er Avril 2026. Veuillez lire attentivement les conditions d&apos;utilisation de Smart Orchard.
                </Text>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionText}>{section.content}</Text>
                    </View>
                ))}

                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => router.back()}
                >
                    <Text style={styles.closeButtonText}>J&apos;ai compris</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    intro: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 25,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
