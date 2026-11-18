import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthService } from '../../src/services/auth.service';
import { AppointmentsService } from '../../src/services/appointments.service';
import { CatalogService } from '../../src/services/catalog.service';
import { AppointmentItem, ServiceItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { QRModal } from '../../src/components/organisms/QRModal';
import {
  Scissors,
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  Crown,
  Bell,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

export default function WelcomeDashboardScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Alejandro');
  const [activeAppointment, setActiveAppointment] = useState<AppointmentItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQRAppointment, setSelectedQRAppointment] = useState<AppointmentItem | null>(null);

  const loadDashboardData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile();

      if (user) {
        const name = profile?.first_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Alejandro';
        setUserName(name.toUpperCase());

        const [activeApt, servList] = await Promise.all([
          AppointmentsService.hasActiveAppointment(user.id),
          CatalogService.getServices(),
        ]);

        setActiveAppointment(activeApt);
        setServices(servList.filter((s) => s.is_active));
      }
    } catch {
      // Ignorar fallo de red silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getServiceImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517832606589-7629c33971a6?w=600&auto=format&fit=crop&q=80',
    ];
    return images[index % images.length];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de cabecera con Marca y Notificación */}
      <View style={styles.topBar}>
        <View style={styles.brandBox}>
          <View style={styles.brandIconBox}>
            <Scissors size={20} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.brandTitle}>CORTESÍA BARBERÍA</Text>
            <Text style={styles.brandSubtitle}>GESTIÓN BARBER PRO</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.bellButton}>
          <Bell size={20} color={colors.primary[500]} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
      >
        {/* Saludo Personalizado de Bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSub}>Bienvenido de nuevo,</Text>
          <Text style={styles.welcomeName}>{userName}!</Text>
        </View>

        {/* TARJETA VIP: RECOMENDADOR DE CORTES CON IA (MÓDULO NUEVO DESTACADO) */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.recommenderCard}
          onPress={() => router.push('/face-scan')}
        >
          <View style={styles.recommenderHeader}>
            <View style={styles.recommenderBadge}>
              <Sparkles size={12} color={colors.primary[50]} />
              <Text style={styles.recommenderBadgeText}>NUEVO • ASESOR FACIAL IA</Text>
            </View>
            <View style={styles.recommenderPrivacy}>
              <Text style={styles.recommenderPrivacyText}>100% Local y Privado</Text>
            </View>
          </View>

          <Text style={styles.recommenderTitle}>¿Qué corte le queda a tu rostro?</Text>
          <Text style={styles.recommenderDesc}>
            Escanea tu rostro para medir proporciones de pómulos y mandíbula, y descubre los cortes
            profesionales que mejor equilibran tus rasgos.
          </Text>

          <View style={styles.recommenderCtaRow}>
            <View style={styles.recommenderCtaBtn}>
              <Text style={styles.recommenderCtaText}>Escanear mi rostro</Text>
              <ArrowRight size={16} color={colors.primary[50]} />
            </View>
          </View>
        </TouchableOpacity>

        {/* SECCIÓN: PRÓXIMA CITA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRÓXIMA CITA</Text>
        </View>

        {activeAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDateRow}>
              <View style={styles.appointmentDateLeft}>
                <Calendar size={18} color={colors.primary[500]} />
                <Text style={styles.appointmentDateText}>
                  {activeAppointment.date}, {activeAppointment.start_time} hrs
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>CONFIRMADA</Text>
              </View>
            </View>

            <View style={styles.appointmentDivider} />

            <View style={styles.appointmentBottomRow}>
              <View style={styles.appointmentBarberBox}>
                <View style={styles.barberAvatar}>
                  <User size={20} color={colors.primary[500]} />
                </View>
                <View>
                  <Text style={styles.barberRole}>Barbero Oficial</Text>
                  <Text style={styles.barberNameText}>
                    {activeAppointment.barber_name || 'Roberto C.'}
                  </Text>
                  <Text style={styles.appointmentServiceName}>
                    {activeAppointment.service_name || 'Corte de Cabello'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.detailsBtn}
                onPress={() => setSelectedQRAppointment(activeAppointment)}
              >
                <Text style={styles.detailsBtnText}>DETALLES</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noAppointmentCard}>
            <View style={styles.noAppointmentIcon}>
              <Clock size={26} color={colors.primary[500]} />
            </View>
            <View style={styles.noAppointmentTexts}>
              <Text style={styles.noAppointmentTitle}>Sin cita programada</Text>
              <Text style={styles.noAppointmentSub}>
                Reserva tu horario con anticipación y disfruta de tu experiencia.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.bookNowSmallBtn}
              onPress={() => router.push('/(tabs)/booking')}
            >
              <Text style={styles.bookNowSmallBtnText}>Agendar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECCIÓN: SERVICIOS (Carrusel de tarjetas como en el diseño) */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>SERVICIOS</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesRow}
        >
          {services.map((srv, index) => (
            <View key={srv.id} style={styles.serviceItemCard}>
              <View style={styles.serviceImageBox}>
                <Image
                  source={{ uri: getServiceImage(index) }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                <View style={styles.serviceDurationBadge}>
                  <Text style={styles.serviceDurationText}>{srv.duration} min</Text>
                </View>
              </View>

              <View style={styles.serviceInfoBox}>
                <Text style={styles.serviceName} numberOfLines={2}>
                  {srv.name.toUpperCase()}
                </Text>
                <Text style={styles.servicePrice}>${srv.price} MXN</Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.serviceBookBtn}
                  onPress={() => router.push('/(tabs)/booking')}
                >
                  <Text style={styles.serviceBookBtnText}>Reservar Ahora</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* BANNER INFORMATIVO / FIDELIZACIÓN */}
        <View style={styles.loyaltyBanner}>
          <View style={styles.loyaltyIconBox}>
            <Crown size={22} color={colors.primary[50]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.loyaltyTitle}>Club de Lealtad VIP</Text>
            <Text style={styles.loyaltyDesc}>
              Acumula visitas en cada cita y canjea cortes y productos gratis.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <ChevronRight size={22} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal QR si el cliente presiona DETALLES en su cita */}
      <QRModal
        visible={!!selectedQRAppointment}
        appointment={selectedQRAppointment}
        onClose={() => setSelectedQRAppointment(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 9,
    fontFamily: typography.family.medium,
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary[500],
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeSub: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 13,
  },
  welcomeName: {
    ...typography.h1,
    color: colors.text.heading,
    fontSize: 26,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  recommenderCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  recommenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommenderBadgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  recommenderPrivacy: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommenderPrivacyText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontFamily: typography.family.medium,
  },
  recommenderTitle: {
    ...typography.h2,
    color: colors.text.heading,
    fontSize: 19,
    marginBottom: 6,
  },
  recommenderDesc: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommenderCtaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  recommenderCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recommenderCtaText: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 1.2,
  },
  seeAllText: {
    fontSize: 12,
    color: colors.primary[500],
    fontFamily: typography.family.semiBold,
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  appointmentDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentDateText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  statusPill: {
    backgroundColor: colors.statusBg.confirmed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.status.confirmed,
    letterSpacing: 0.5,
  },
  appointmentDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 14,
  },
  appointmentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentBarberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  barberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberRole: {
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontFamily: typography.family.semiBold,
  },
  barberNameText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  appointmentServiceName: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  detailsBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailsBtnText: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
    letterSpacing: 0.5,
  },
  noAppointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  noAppointmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppointmentTexts: {
    flex: 1,
  },
  noAppointmentTitle: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  noAppointmentSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bookNowSmallBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookNowSmallBtnText: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  servicesRow: {
    gap: 14,
    paddingVertical: 4,
  },
  serviceItemCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  serviceImageBox: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: colors.cardAlt,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceDurationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(55, 27, 17, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  serviceDurationText: {
    fontSize: 10,
    fontFamily: typography.family.semiBold,
    color: colors.primary[50],
  },
  serviceInfoBox: {
    padding: 12,
  },
  serviceName: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    minHeight: 32,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
    marginTop: 4,
    marginBottom: 10,
  },
  serviceBookBtn: {
    backgroundColor: colors.primary[500],
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  serviceBookBtnText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  loyaltyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
    gap: 12,
  },
  loyaltyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  loyaltyDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
