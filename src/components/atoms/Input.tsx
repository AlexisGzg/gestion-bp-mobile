import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...rest }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text.heading }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={isDark ? colors.text.muted : colors.primary[400]}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? colors.cardAlt : colors.white,
            borderColor: colors.border,
            color: colors.text.primary,
          },
          error && styles.inputError,
          style,
        ]}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    ...typography.body,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#B91C1C',
  },
  errorText: {
    ...typography.caption,
    color: '#B91C1C',
    marginTop: 4,
  },
});
