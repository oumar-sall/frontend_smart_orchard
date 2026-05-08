import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/Theme';
import { useRegister } from '../hooks/useRegister';

export default function RegisterScreen() {
  const router = useRouter();
  const {
    firstName, setFirstName,
    lastName, setLastName,
    agreedToCGU, setAgreedToCGU,
    loading, handleRegister
  } = useRegister();

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
                placeholder="Ex: Jean"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Dupont"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={COLORS.textSecondary}
              />

              <View style={styles.cguRow}>
                <Switch
                  value={agreedToCGU}
                  onValueChange={setAgreedToCGU}
                  trackColor={{ false: '#767577', true: COLORS.green + '80' }}
                  thumbColor={agreedToCGU ? COLORS.green : '#f4f3f4'}
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
                style={[styles.button, (loading || !agreedToCGU) && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading || !agreedToCGU}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.green },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 25, padding: 25,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20,
  },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginTop: 10 },
  input: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 15,
    paddingHorizontal: 15, height: 55, fontSize: 16,
    backgroundColor: '#fafafa', marginBottom: 10, color: COLORS.textPrimary,
  },
  cguRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  cguTextContainer: { marginLeft: 10, flex: 1 },
  cguText: { fontSize: 14, color: COLORS.textPrimary },
  cguLink: { color: '#2196F3', textDecorationLine: 'underline', fontWeight: '600' },
  button: {
    backgroundColor: COLORS.green, height: 60, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: COLORS.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#B2DFDB' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
