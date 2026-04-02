import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Universal storage utility that handles cross-platform differences
 * between Native (Expo SecureStore) and Web (localStorage).
 */
export const storage = {
  /**
   * Sets a value in storage.
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('LocalStorage is unavailable:', e);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  /**
   * Gets a value from storage.
   */
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('LocalStorage is unavailable:', e);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  /**
   * Deletes a value from storage.
   */
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('LocalStorage is unavailable:', e);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },

  /**
   * Clears all known keys from storage (full reset).
   */
  async clearAll(): Promise<void> {
    const keys = ["userToken", "userData", "selectedControllerId", "selectedControllerName"];
    for (const key of keys) {
      await this.deleteItem(key);
    }
  },

  /**
   * Clears only controller-related selection data.
   */
  async clearControllerSelection(): Promise<void> {
    const keys = ["selectedControllerId", "selectedControllerName"];
    for (const key of keys) {
      await this.deleteItem(key);
    }
  }
};
