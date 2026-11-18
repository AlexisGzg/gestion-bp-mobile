import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, Animated, Easing } from 'react-native';
import { FaceShapeService } from '../../services/face-shape.service';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Scan } from 'lucide-react-native';

interface FaceMeshScannerProps {
  imageUri: string;
  isScanning: boolean;
  statusText?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = Math.min(SCREEN_WIDTH - 48, 320);

interface FaceMeshOverlayProps {
  imageUri: string;
  width: number;
  height: number;
  animationStyle: 'radialPulse';
  dotColor: string;
  dotSize: number;
  lineColor: string;
  showLines: boolean;
}

function OptionalFaceMeshOverlay(props: FaceMeshOverlayProps) {
  const Overlay = FaceShapeService.getFaceMeshOverlayComponent();
  return Overlay ? React.createElement(Overlay, props) : null;
}

export const FaceMeshScanner: React.FC<FaceMeshScannerProps> = ({
  imageUri,
  isScanning,
  statusText = 'Mapeando proporciones faciales...',
}) => {
  // Animación del rayo láser con Animated nativo estándar de React Native (cero dependencias externas)
  const [translateY] = useState(() => new Animated.Value(0));
  const [laserOpacity] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;

    if (isScanning) {
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCANNER_SIZE - 4,
              duration: 1800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(laserOpacity, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(laserOpacity, {
              toValue: 0.6,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      translateY.setValue(0);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isScanning, translateY, laserOpacity]);

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {/* Imagen del cliente (100% original, jamás alterada) */}
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Malla de puntos nativa de face-map-expo si estuviera en development build */}
        <View style={StyleSheet.absoluteFill}>
          <OptionalFaceMeshOverlay
            imageUri={imageUri}
            width={SCANNER_SIZE}
            height={SCANNER_SIZE}
            animationStyle="radialPulse"
            dotColor={colors.primary[500]}
            dotSize={2.5}
            lineColor={colors.primary[300]}
            showLines
          />
        </View>

        {/* Haz láser animado */}
        {isScanning ? (
          <Animated.View
            style={[
              styles.laserBeam,
              {
                transform: [{ translateY }],
                opacity: laserOpacity,
              },
            ]}
          />
        ) : null}

        {/* Esquinas del visor táctico */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Insignia de estado */}
        {isScanning ? (
          <View style={styles.scanningBadge}>
            <Scan size={14} color={colors.primary[50]} />
            <Text style={styles.scanningBadgeText}>{statusText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  viewfinder: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  laserBeam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.primary[500],
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  scanningBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanningBadgeText: {
    fontSize: 12,
    fontFamily: typography.family.semiBold,
    color: colors.primary[50],
  },
});
