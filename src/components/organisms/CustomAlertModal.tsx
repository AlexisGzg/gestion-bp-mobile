import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Scissors,
} from 'lucide-react-native';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface CustomAlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface CustomAlertModalProps {
  visible: boolean;
  options: CustomAlertOptions | null;
  onDismiss: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  options,
  onDismiss,
}) => {
  if (!options) return null;

  const { title, message, type = 'info', buttons } = options;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={36} color={colors.status.completed} />;
      case 'error':
        return <XCircle size={36} color={colors.status.cancelled} />;
      case 'warning':
        return <AlertTriangle size={36} color={colors.status.pending} />;
      case 'confirm':
        return <Scissors size={34} color={colors.primary[500]} />;
      case 'info':
      default:
        return <Info size={34} color={colors.primary[500]} />;
    }
  };

  const defaultButtons: AlertButton[] = [
    {
      text: 'Entendido',
      style: 'default',
      onPress: onDismiss,
    },
  ];

  const actionButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.goldHeaderAccent} />

          <View style={styles.iconContainer}>{renderIcon()}</View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View
            style={[
              styles.buttonsRow,
              actionButtons.length > 2 && styles.buttonsCol,
            ]}
          >
            {actionButtons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              return (
                <TouchableOpacity
                  key={`${btn.text}-${index}`}
                  activeOpacity={0.85}
                  style={[
                    styles.buttonBase,
                    isCancel && styles.buttonCancel,
                    isDestructive && styles.buttonDestructive,
                    !isCancel && !isDestructive && styles.buttonPrimary,
                    actionButtons.length === 2 && styles.buttonHalf,
                  ]}
                  onPress={() => {
                    onDismiss();
                    if (btn.onPress) {
                      btn.onPress();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextCancel,
                      isDestructive && styles.buttonTextDestructive,
                      !isCancel && !isDestructive && styles.buttonTextPrimary,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(55, 27, 17, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 48, 380),
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  goldHeaderAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary[500],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.text.heading,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: typography.family.bold,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'center',
  },
  buttonsCol: {
    flexDirection: 'column',
  },
  buttonBase: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary[500],
    borderWidth: 1,
    borderColor: colors.primary[600],
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonCancel: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDestructive: {
    backgroundColor: colors.statusBg.cancelled,
    borderWidth: 1,
    borderColor: colors.status.cancelled,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: typography.family.semiBold,
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: colors.primary[50],
    fontFamily: typography.family.bold,
  },
  buttonTextCancel: {
    color: colors.text.secondary,
  },
  buttonTextDestructive: {
    color: colors.status.cancelled,
  },
});
