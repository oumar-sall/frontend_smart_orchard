import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CountryPicker from '../components/CountryPicker';
import { useLogin } from '../hooks/useLogin';
import { COLORS } from '../constants/Theme';

export default function LoginScreen() {
  const {
    phone, setPhone,
    loading, handleLogin,
    selectedCountry, setSelectedCountry,
    isPickerVisible, setIsPickerVisible,
    resetApp
  } = useLogin();

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
                <Ionicons name="leaf" size={60} color={COLORS.green} />
              </View>
              <Text style={styles.title}>Smart Orchard</Text>
              <Text style={styles.subtitle}>Gestion intelligente de vos vergers</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <TouchableOpacity
                  style={styles.countryPickerBtn}
                  onPress={() => setIsPickerVisible(true)}
                >
                  <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                  <Text style={styles.callingCodeText}>{selectedCountry.callingCode}</Text>
                  <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TextInput
                  style={styles.phoneInput}
                  placeholder="60000000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoFocus
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <Text style={styles.hint}>Format : {selectedCountry.callingCode}{phone || '...'}</Text>

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

            <TouchableOpacity style={styles.resetCacheBtn} onPress={resetApp}>
              <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.resetCacheText}>Vider le cache de l&apos;application</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CountryPicker
        isVisible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelect={(country) => {
          setSelectedCountry(country);
          setIsPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 100, height: 100, backgroundColor: 'white', borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.green },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  card: {
    backgroundColor: 'white', borderRadius: 25, padding: 25,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20,
  },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 15 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#eee', borderRadius: 15, paddingHorizontal: 12,
    height: 60, backgroundColor: '#f9f9f9',
  },
  countryPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 10 },
  flagText: { fontSize: 22 },
  callingCodeText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  divider: { width: 1, height: 30, backgroundColor: '#ddd', marginHorizontal: 10 },
  phoneInput: { flex: 1, fontSize: 18, fontWeight: '500', color: COLORS.textPrimary },
  hint: { fontSize: 13, color: COLORS.green, marginTop: 10, marginBottom: 20, fontWeight: '500' },
  button: {
    backgroundColor: COLORS.green, height: 60, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: COLORS.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#B2DFDB' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resetCacheBtn: { marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.5 },
  resetCacheText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
});
