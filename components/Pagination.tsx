import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/Theme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? COLORS.textSecondary : COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.pageText}>Page {currentPage} / {totalPages}</Text>

      <TouchableOpacity
        style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? COLORS.textSecondary : COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0EAE4',
  },
  pageButtonDisabled: {
    backgroundColor: "#F0EAE4",
    borderColor: "#F0EAE4",
    shadowOpacity: 0,
    elevation: 0,
  },
  pageText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
});
