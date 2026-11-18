import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react-native';
import { FaceShape, Haircut } from '../src/types';
import { FaceShapeService } from '../src/services/face-shape.service';
import { HaircutsService } from '../src/services/haircuts.service';
import { FACE_SHAPES_INFO } from '../src/data/haircuts';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { useAlert } from '../src/context/AlertContext';
import { FaceMeshScanner } from '../src/components/organisms/FaceMeshScanner';
import { FaceShapeSelector } from '../src/components/molecules/FaceShapeSelector';
import { HaircutCard } from '../src/components/molecules/HaircutCard';
import { FaceTipsCard } from '../src/components/molecules/FaceTipsCard';

type ScanState =
  | 'idle'
  | 'scanning'
  | 'success'
  | 'no_face'
  | 'native_unavailable'
  | 'permission_denied'
  | 'error';

export default function FaceScanScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [state, setState] = useState<ScanState>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<FaceShape>('ovalada');
  const [recommendedHaircuts, setRecommendedHaircuts] = useState<Haircut[]>([]);
  const [loadingHaircuts, setLoadingHaircuts] = useState(false);
  const [scanMessage, setScanMessage] = useState('Analizando estructura...');

  const loadHaircuts = async (shape: FaceShape) => {
    try {
      setLoadingHaircuts(true);
      const haircuts = await HaircutsService.getRecommendedHaircuts(shape);
      setRecommendedHaircuts(haircuts);
    } catch {
      showAlert({
        title: 'Catálogo de cortes',
        message: 'No se pudieron cargar los cortes para esta forma de rostro.',
        type: 'error',
      });
    } finally {
      setLoadingHaircuts(false);
    }
  };

  const handleShapeChange = (shape: FaceShape) => {
    setSelectedShape(shape);
    loadHaircuts(shape);
  };

  const processImage = async (uri: string) => {
    setPhotoUri(uri);
    setState('scanning');
    setScanMessage('Detectando puntos faciales...');

    try {
      const nativeSupported = FaceShapeService.isNativeSupported();
      const result = await FaceShapeService.detectFaceShape(uri);

      if (result && result.detected) {
        setSelectedShape(result.faceShape);
        await loadHaircuts(result.faceShape);
        setState('success');
      } else {
        setState(nativeSupported ? 'no_face' : 'native_unavailable');
      }
    } catch {
      setState('error');
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setState('permission_denied');
        showAlert({
          title: 'Permiso necesario',
          message: 'Se requiere acceso a tu cámara para poder analizar tu rostro.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // LA FOTO NUNCA SE MODIFICA
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processImage(result.assets[0].uri);
      }
    } catch {
      setState('error');
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setState('permission_denied');
        showAlert({
          title: 'Permiso de fotos',
          message: 'Se requiere acceso a tu galería para seleccionar tu fotografía.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // LA FOTO NUNCA SE MODIFICA
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processImage(result.assets[0].uri);
      }
    } catch {
      setState('error');
    }
  };

  const handleManualSelection = () => {
    setPhotoUri(null);
    setSelectedShape('ovalada');
    loadHaircuts('ovalada');
    setState('success');
  };

  const handleBookHaircut = (haircut: Haircut) => {
    showAlert({
      title: '¡Excelente elección!',
      message: `Has seleccionado "${haircut.name}". Te llevaremos a agendar tu cita con tu barbero favorito.`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar a Agendar',
          style: 'default',
          onPress: () => {
            router.push('/(tabs)/booking');
          },
        },
      ],
    });
  };

  const handleCopyPhrase = (phrase: string) => {
    showAlert({
      title: 'Frase lista para tu cita',
      message: `"${phrase}"\n\nPreséntasela a tu barbero al momento de tu corte.`,
      type: 'success',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior con navegación */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={colors.text.heading} />
        </TouchableOpacity>
        <View style={styles.topBarTitles}>
          <Text style={styles.topBarTitle}>Asesor de Imagen</Text>
          <Text style={styles.topBarSubtitle}>Cortes según tu forma de rostro</Text>
        </View>
        <View style={styles.topBarBadge}>
          <Sparkles size={16} color={colors.primary[50]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ESTADO 1: INICIO / IDLE */}
        {state === 'idle' && (
          <View>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <Sparkles size={12} color={colors.primary[50]} />
                <Text style={styles.heroBadgeText}>100% Privado en tu dispositivo</Text>
              </View>
              <Text style={styles.heroTitle}>Descubre tu corte ideal</Text>
              <Text style={styles.heroDescription}>
                Analiza tu rostro para identificar proporciones de frente, pómulos y mandíbula, y recibe
                los estilos que mejor armonizan tus rasgos.
              </Text>
            </View>

            {/* Opciones de captura */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionButton, styles.actionButtonCamera]}
                onPress={handleLaunchCamera}
              >
                <View style={styles.actionIconBoxCamera}>
                  <Camera size={22} color={colors.primary[50]} />
                </View>
                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitleCamera}>Tomar foto con la cámara</Text>
                  <Text style={styles.actionSubtitleCamera}>Captura tu rostro de frente</Text>
                </View>
                <ChevronRight size={18} color={colors.primary[50]} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionButton, styles.actionButtonGallery]}
                onPress={handleLaunchGallery}
              >
                <View style={styles.actionIconBoxGallery}>
                  <ImageIcon size={22} color={colors.primary[500]} />
                </View>
                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitleGallery}>Elegir desde tu galería</Text>
                  <Text style={styles.actionSubtitleGallery}>Selecciona una foto frontal nítida</Text>
                </View>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Enlace al respaldo manual */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.manualLinkButton}
              onPress={handleManualSelection}
            >
              <Text style={styles.manualLinkText}>
                ¿Prefieres elegir tu tipo de cara manualmente? Haz clic aquí
              </Text>
            </TouchableOpacity>

            {/* Consejos fotográficos */}
            <FaceTipsCard />
          </View>
        )}

        {/* ESTADO 2: ESCANEANDO */}
        {state === 'scanning' && photoUri && (
          <View style={styles.scanningContainer}>
            <Text style={styles.scanningTitle}>Analizando tu fisionomía</Text>
            <Text style={styles.scanningSubtitle}>
              Midiendo proporciones de frente, pómulos y mandíbula...
            </Text>

            <FaceMeshScanner
              imageUri={photoUri}
              isScanning={true}
              statusText={scanMessage}
            />

            <View style={styles.scanningProgressBox}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={styles.scanningProgressText}>{scanMessage}</Text>
            </View>
          </View>
        )}

        {/* ESTADO 3: ÉXITO Y RESULTADOS */}
        {state === 'success' && (
          <View>
            {photoUri ? (
              <View style={styles.photoSummaryRow}>
                <FaceMeshScanner
                  imageUri={photoUri}
                  isScanning={false}
                />
              </View>
            ) : null}

            {/* Resultado aproximado */}
            <View style={styles.resultBanner}>
              <View style={styles.resultBadge}>
                <Sparkles size={12} color={colors.primary[50]} />
                <Text style={styles.resultBadgeText}>Aproximación Estética</Text>
              </View>
              <Text style={styles.resultTitle}>
                  Tu forma de cara aproximada es: <Text style={styles.resultHighlight}>{FACE_SHAPES_INFO[selectedShape]?.name}</Text>
              </Text>
              <Text style={styles.resultDescription}>
                  {FACE_SHAPES_INFO[selectedShape]?.description}
              </Text>
              <Text style={styles.disclaimerText}>
                  Nota: Esta es una sugerencia estética basada en proporciones para guiar tu estilo, no un diagnóstico definitivo. Si sientes que otra forma te describe mejor, cámbiala abajo:
              </Text>
            </View>

            {/* Selector de corrección manual */}
            <FaceShapeSelector
              selectedShape={selectedShape}
              onSelectShape={handleShapeChange}
              label="Ajustar o corregir forma de rostro:"
            />

            {/* Cortes Recomendados */}
            <View style={styles.haircutsHeader}>
              <Text style={styles.haircutsSectionTitle}>
                Cortes recomendados para cara {FACE_SHAPES_INFO[selectedShape]?.name}
              </Text>
              <Text style={styles.haircutsSectionSubtitle}>
                Estilos que equilibran tus facciones y destacan tu perfil
              </Text>
            </View>

            {loadingHaircuts ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
              </View>
            ) : (
              recommendedHaircuts.map((haircut) => (
                <HaircutCard
                  key={haircut.id}
                  haircut={haircut}
                  clientPhotoUri={photoUri}
                  onBookHaircut={handleBookHaircut}
                  onCopyPhrase={handleCopyPhrase}
                />
              ))
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retryButton}
              onPress={() => {
                setState('idle');
                setPhotoUri(null);
              }}
            >
              <RefreshCw size={16} color={colors.text.secondary} />
              <Text style={styles.retryButtonText}>Probar con otra fotografía</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ESTADO 4: NO SE DETECTÓ ROSTRO O ERROR */}
        {(state === 'no_face' ||
          state === 'native_unavailable' ||
          state === 'error' ||
          state === 'permission_denied') && (
          <View style={styles.fallbackCard}>
            <View style={styles.fallbackIconBox}>
              <AlertCircle size={38} color={colors.primary[500]} />
            </View>

            <Text style={styles.fallbackTitle}>
              {state === 'permission_denied'
                ? 'Permisos requeridos'
                : state === 'native_unavailable'
                  ? 'Análisis automático no disponible'
                  : 'No se detectó un rostro claro'}
            </Text>

            <Text style={styles.fallbackDesc}>
              {state === 'permission_denied'
                ? 'Para analizar tu rostro se requiere permiso para la cámara o galería. También puedes elegir tu forma manualmente sin necesidad de foto.'
                : state === 'native_unavailable'
                  ? 'La foto se capturó correctamente, pero el análisis automático requiere una build de desarrollo con el módulo facial. Puedes continuar eligiendo tu forma de cara manualmente.'
                  : 'La imagen seleccionada no permitió mapear los rasgos faciales. Asegúrate de tener buena luz, mirar de frente y no cubrir la cara.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.fallbackManualButton}
              onPress={handleManualSelection}
            >
              <Sparkles size={16} color={colors.primary[50]} />
              <Text style={styles.fallbackManualButtonText}>
                Elegir mi forma de cara manualmente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fallbackRetryButton}
              onPress={() => setState('idle')}
            >
              <RefreshCw size={16} color={colors.text.secondary} />
              <Text style={styles.fallbackRetryButtonText}>Intentar con otra foto</Text>
            </TouchableOpacity>

            <FaceTipsCard />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  topBarTitles: {
    flex: 1,
  },
  topBarTitle: {
    ...typography.h3,
    color: colors.text.heading,
  },
  topBarSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  topBarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text.heading,
    fontSize: 22,
    marginBottom: 8,
  },
  heroDescription: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
  },
  actionButtonCamera: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconBoxCamera: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitleCamera: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  actionSubtitleCamera: {
    fontSize: 12,
    color: colors.primary[100],
    marginTop: 2,
  },
  actionButtonGallery: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  actionIconBoxGallery: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTitleGallery: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  actionSubtitleGallery: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  manualLinkButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  manualLinkText: {
    ...typography.caption,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    fontFamily: typography.family.semiBold,
    textAlign: 'center',
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scanningTitle: {
    ...typography.h2,
    color: colors.text.heading,
    textAlign: 'center',
  },
  scanningSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  scanningProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanningProgressText: {
    ...typography.caption,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  photoSummaryRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resultBanner: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    marginBottom: 16,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultBadgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
    textTransform: 'uppercase',
  },
  resultTitle: {
    ...typography.h2,
    color: colors.text.heading,
    fontSize: 18,
    marginBottom: 6,
  },
  resultHighlight: {
    color: colors.primary[500],
    fontFamily: typography.family.bold,
  },
  resultDescription: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  haircutsHeader: {
    marginTop: 14,
    marginBottom: 14,
  },
  haircutsSectionTitle: {
    ...typography.h2,
    color: colors.text.heading,
    fontSize: 17,
  },
  haircutsSectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  retryButtonText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: typography.family.semiBold,
  },
  fallbackCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  fallbackIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    ...typography.h2,
    color: colors.text.heading,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  fallbackManualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  fallbackManualButtonText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  fallbackRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  fallbackRetryButtonText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: typography.family.semiBold,
  },
});
