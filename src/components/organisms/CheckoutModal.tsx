import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, CreditCard, Lock, Minus, Plus, ShieldCheck, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CartItem } from '../../types';
import { AuthService } from '../../services/auth.service';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { typography } from '../../theme/typography';

interface CheckoutModalProps {
  visible: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onSuccess: (ticketNumber: string, total: number) => void;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

const getCardBrand = (digits: string) => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6/.test(digits)) return 'Discover';
  return 'Tarjeta';
};

const isValidExpiry = (value: string) => {
  const match = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month, 0, 23, 59, 59, 999);
  return expiry >= now;
};

const luhnValid = (digits: string) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const generateTicketNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GBP-${stamp}-${rand}`;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [formError, setFormError] = useState('');
  const [cardError, setCardError] = useState('');
  const [completedTicket, setCompletedTicket] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    let active = true;

    const loadCustomer = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user?.email) {
          throw new Error('Inicia sesión con un correo válido para realizar tu compra.');
        }
        const profile = await AuthService.getCurrentUserProfile(user.id);
        if (!active) return;
        const fullName = profile?.full_name || user.email.split('@')[0] || '';
        setName(fullName);
        setCardName(fullName);
        setEmail(user.email);
        setPhone(profile?.phone || '');
      } catch (error) {
        if (active) {
          setFormError(error instanceof Error ? error.message : 'No se pudieron cargar tus datos.');
        }
      }
    };

    loadCustomer();
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      /* eslint-disable react-hooks/set-state-in-effect */
      setSubmitting(false);
      setPaymentStatus('idle');
      setFormError('');
      setCardError('');
      setCompletedTicket('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setPostalCode('');
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [visible]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0),
    [cart]
  );
  const quantity = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cardDigits = onlyDigits(cardNumber);
  const cardBrand = getCardBrand(cardDigits);

  const validatePaymentForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Completa tu nombre, correo y teléfono antes de pagar.');
      return false;
    }
    if (cart.length === 0) {
      setFormError('Tu carrito está vacío.');
      return false;
    }
    if (!cardName.trim()) {
      setCardError('Ingresa el nombre del titular de la tarjeta.');
      return false;
    }
    if (cardDigits.length < 13 || cardDigits.length > 19 || !luhnValid(cardDigits)) {
      setCardError('El número de tarjeta no es válido.');
      return false;
    }
    if (!isValidExpiry(expiry)) {
      setCardError('La fecha de vencimiento no es válida.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setCardError('El código de seguridad (CVC) no es válido.');
      return false;
    }
    if (postalCode.trim().length < 3) {
      setCardError('Ingresa un código postal válido.');
      return false;
    }
    return true;
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handlePay = () => {
    setFormError('');
    setCardError('');
    if (!validatePaymentForm()) return;

    setSubmitting(true);
    setPaymentStatus('processing');

    timerRef.current = setTimeout(() => {
      const declined = cardDigits === '4000000000000002' || cardDigits === '4000000000009995';
      const insufficient = cardDigits === '4000000000009995';

      if (declined) {
        setSubmitting(false);
        setPaymentStatus('failed');
        setCardError(
          insufficient
            ? 'Tu tarjeta no tiene fondos suficientes. Intenta con otra tarjeta.'
            : 'Tu tarjeta fue rechazada. Verifica los datos o usa otra tarjeta.'
        );
        return;
      }

      const ticketNumber = generateTicketNumber();
      setCompletedTicket(ticketNumber);
      setPaymentStatus('success');
      setSubmitting(false);

      timerRef.current = setTimeout(() => {
        onSuccess(ticketNumber, total);
      }, 900);
    }, 1800);
  };

  const paymentLocked = submitting || paymentStatus === 'success';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <ShieldCheck size={20} color={colors.primary[500]} />
                <View>
                  <Text style={[styles.eyebrow, { color: colors.primary[500] }]}>PAGO SEGURO</Text>
                  <Text style={[styles.title, { color: colors.text.heading }]}>Tu carrito</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={submitting}
                style={[styles.closeButton, { borderColor: colors.border }]}
                accessibilityLabel="Cerrar carrito"
              >
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              {cart.map((item) => (
                <View
                  key={item.product.id}
                  style={[styles.cartItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                >
                  <View style={styles.itemText}>
                    <Text style={[styles.itemName, { color: colors.text.heading }]} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.primary[500] }]}>
                      ${item.product.sale_price.toFixed(2)} MXN
                    </Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.product.id, -1)}
                      disabled={paymentLocked}
                      accessibilityLabel={`Quitar una unidad de ${item.product.name}`}
                    >
                      <Minus size={17} color={colors.text.heading} />
                    </TouchableOpacity>
                    <Text style={[styles.quantity, { color: colors.text.heading }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.product.id, 1)}
                      disabled={paymentLocked}
                      accessibilityLabel={`Agregar una unidad de ${item.product.name}`}
                    >
                      <Plus size={17} color={colors.text.heading} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onRemoveItem(item.product.id)}
                      disabled={paymentLocked}
                      accessibilityLabel={`Quitar ${item.product.name} del carrito`}
                    >
                      <Trash2 size={16} color={colors.status.cancelled} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <Input label="Nombre completo" value={name} onChangeText={setName} editable={!paymentLocked} />
              <Input label="Correo" value={email} editable={false} />
              <Input
                label="Teléfono"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!paymentLocked}
              />

              <View style={[styles.paymentCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentHeaderLeft}>
                    <CreditCard size={18} color={colors.primary[500]} />
                    <Text style={[styles.paymentTitle, { color: colors.text.heading }]}>Tarjeta</Text>
                  </View>
                  <View style={[styles.brandPill, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Text style={[styles.brandText, { color: colors.text.secondary }]}>{cardBrand}</Text>
                  </View>
                </View>

                <Input
                  label="Nombre del titular"
                  value={cardName}
                  onChangeText={setCardName}
                  editable={!paymentLocked}
                  autoCapitalize="words"
                />

                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Número de tarjeta</Text>
                <View style={[styles.fieldBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <TextInput
                    value={cardNumber}
                    onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                    placeholder="1234 1234 1234 1234"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                    editable={!paymentLocked}
                    style={[styles.fieldInput, { color: colors.text.primary }]}
                    maxLength={23}
                  />
                  <Lock size={14} color={colors.text.muted} />
                </View>

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Vencimiento</Text>
                    <View style={[styles.fieldBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                      <TextInput
                        value={expiry}
                        onChangeText={(v) => setExpiry(formatExpiry(v))}
                        placeholder="MM / AA"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="number-pad"
                        editable={!paymentLocked}
                        style={[styles.fieldInput, { color: colors.text.primary }]}
                        maxLength={7}
                      />
                    </View>
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>CVC</Text>
                    <View style={[styles.fieldBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                      <TextInput
                        value={cvc}
                        onChangeText={(v) => setCvc(onlyDigits(v).slice(0, 4))}
                        placeholder="CVC"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="number-pad"
                        editable={!paymentLocked}
                        secureTextEntry
                        style={[styles.fieldInput, { color: colors.text.primary }]}
                        maxLength={4}
                      />
                    </View>
                  </View>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Código postal</Text>
                <View style={[styles.fieldBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <TextInput
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="Código postal"
                    placeholderTextColor={colors.text.muted}
                    keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                    editable={!paymentLocked}
                    style={[styles.fieldInput, { color: colors.text.primary }]}
                    maxLength={10}
                  />
                </View>

                {cardError ? (
                  <Text style={[styles.error, { color: colors.status.cancelled }]}>{cardError}</Text>
                ) : null}

                <View style={styles.secureNotice}>
                  <Lock size={13} color={colors.primary[500]} />
                  <Text style={[styles.secureText, { color: colors.text.secondary }]}>
                    Tus datos se procesan de forma cifrada y segura.
                  </Text>
                </View>
                <Text style={[styles.testCardHint, { color: colors.text.secondary }]}>
                  Tarjeta de prueba: 4242 4242 4242 4242 · fecha futura · CVC cualquiera · CP cualquiera
                </Text>
              </View>

              {formError ? (
                <Text style={[styles.error, { color: colors.status.cancelled }]}>{formError}</Text>
              ) : null}

              <View style={[styles.totalCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>
                    {quantity} {quantity === 1 ? 'artículo' : 'artículos'}
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.text.heading }]}>
                    ${total.toFixed(2)} MXN
                  </Text>
                </View>
              </View>

              {paymentStatus === 'processing' && (
                <View style={[styles.statusRow, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                  <Text style={[styles.statusText, { color: colors.text.secondary }]}>Procesando pago...</Text>
                </View>
              )}

              {paymentStatus === 'success' && (
                <View style={[styles.statusRow, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                  <CheckCircle2 size={18} color={colors.status.completed} />
                  <Text style={[styles.statusText, { color: colors.text.heading }]}>
                    Pago aprobado · Pedido {completedTicket}
                  </Text>
                </View>
              )}

              <Button
                title={
                  paymentStatus === 'success'
                    ? 'Pago completado'
                    : submitting
                      ? 'Procesando pago...'
                      : `Pagar $${total.toFixed(2)} MXN`
                }
                onPress={handlePay}
                loading={submitting}
                disabled={cart.length === 0 || !email || paymentStatus === 'success'}
                icon={
                  paymentStatus === 'success' ? (
                    <CheckCircle2 size={18} color={colors.primary[50]} />
                  ) : (
                    <CreditCard size={18} color={colors.primary[50]} />
                  )
                }
                style={styles.payButton}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    maxHeight: '94%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
  },
  closeButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemText: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontFamily: typography.family.semiBold,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: typography.family.medium,
    marginTop: 3,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantity: {
    fontSize: 13,
    fontFamily: typography.family.bold,
  },
  paymentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentTitle: {
    fontSize: 15,
    fontFamily: typography.family.semiBold,
  },
  brandPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  brandText: {
    fontSize: 11,
    fontFamily: typography.family.semiBold,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: typography.family.medium,
    marginBottom: 6,
  },
  fieldBox: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.family.medium,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  secureText: {
    fontSize: 11,
    flex: 1,
  },
  testCardHint: {
    fontSize: 10,
    marginTop: 8,
    lineHeight: 14,
  },
  error: {
    fontSize: 12,
    fontFamily: typography.family.medium,
    marginVertical: 6,
  },
  totalCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: typography.family.medium,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: typography.family.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontFamily: typography.family.medium,
    flex: 1,
  },
  payButton: {
    minHeight: 50,
    borderRadius: 14,
  },
});
