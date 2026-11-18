import Constants from 'expo-constants';
import { requireOptionalNativeModule } from 'expo';
import { FaceDetectionResult, FaceRatios, FaceShape } from '../types';

// Tipo de los landmarks devueltos por @data_is_null/face-map-expo
interface NativeFacePoint {
  x: number;
  y: number;
}

interface NativeFaceMeshResult {
  points: NativeFacePoint[];
  regions: Record<string, NativeFacePoint[]>;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageWidth: number;
  imageHeight: number;
}

/**
 * Carga segura diferida del módulo nativo face-map-expo.
 * En Expo Go o entornos sin build nativo no romperá la aplicación.
 */
let faceMapModule: any = null;
let nativeModuleChecked = false;

function getFaceMapModule() {
  if (nativeModuleChecked) return faceMapModule;
  nativeModuleChecked = true;

  if (Constants.executionEnvironment === 'storeClient') {
    return null;
  }

  if (!requireOptionalNativeModule('FaceMapExpo')) {
    return null;
  }

  try {
    // Intentar requerir el módulo nativo
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@data_is_null/face-map-expo');
    faceMapModule = mod;
    return mod;
  } catch {
    // Módulo nativo no disponible en el runtime actual (ej. Expo Go)
    faceMapModule = null;
    return null;
  }
}

/**
 * Servicio de detección y análisis facial.
 * Utiliza landmarks para calcular proporciones geométricas y determinar la forma aproximada del rostro.
 */
export const FaceShapeService = {
  /**
   * Verifica si el módulo nativo está disponible en el entorno actual.
   */
  isNativeSupported(): boolean {
    const mod = getFaceMapModule();
    return mod !== null && typeof mod.detectFaceLandmarks === 'function';
  },

  /**
   * Obtiene el componente de overlay si está disponible nativamente.
   */
  getFaceMeshOverlayComponent(): any | null {
    const mod = getFaceMapModule();
    return mod?.FaceMeshOverlay || null;
  },

  /**
   * Analiza una imagen facial y devuelve la forma estimada del rostro o null si falla.
   */
  async detectFaceShape(imageUri: string): Promise<FaceDetectionResult | null> {
    try {
      const mod = getFaceMapModule();
      if (!mod || typeof mod.detectFaceLandmarks !== 'function') {
        // En Expo Go o sin compilación nativa se retorna null para activar el respaldo manual
        return null;
      }

      // Llamada al motor nativo (Apple Vision en iOS, ML Kit en Android)
      const rawResult: NativeFaceMeshResult = await mod.detectFaceLandmarks(imageUri);

      if (!rawResult || !rawResult.points || rawResult.points.length < 10) {
        return null;
      }

      return FaceShapeService.classifyFromMesh(rawResult);
    } catch {
      // Captura segura de errores (ej. ERR_NO_FACE, ERR_INVALID_IMAGE, etc.)
      return null;
    }
  },

  /**
   * Clasifica la forma de rostro a partir de los puntos y regiones de la malla facial.
   */
  classifyFromMesh(mesh: NativeFaceMeshResult): FaceDetectionResult {
    const { points, regions, bounds } = mesh;

    // 1. Longitud del rostro (Largo aproximado mentón a frente)
    let minY = bounds?.y ?? 1;
    let maxY = (bounds?.y ?? 0) + (bounds?.height ?? 0);

    for (const p of points) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const faceLength = Math.max(0.1, maxY - minY);

    // 2. Ancho de pómulos (Cheekbone width: máxima distancia horizontal en tercio medio)
    const midYStart = minY + faceLength * 0.35;
    const midYEnd = minY + faceLength * 0.65;
    const midPoints = points.filter((p) => p.y >= midYStart && p.y <= midYEnd);
    let minXMid = 1;
    let maxXMid = 0;
    for (const p of midPoints) {
      if (p.x < minXMid) minXMid = p.x;
      if (p.x > maxXMid) maxXMid = p.x;
    }
    const cheekboneWidth = Math.max(0.08, maxXMid > minXMid ? maxXMid - minXMid : (bounds?.width ?? 0.4));

    // 3. Ancho de frente (Forehead width: a nivel de cejas/sienes)
    const eyeBrows = [
      ...(regions?.leftEyebrow || []),
      ...(regions?.rightEyebrow || []),
    ];
    let minXForehead = 1;
    let maxXForehead = 0;
    if (eyeBrows.length > 0) {
      for (const p of eyeBrows) {
        if (p.x < minXForehead) minXForehead = p.x;
        if (p.x > maxXForehead) maxXForehead = p.x;
      }
    } else {
      minXForehead = (bounds?.x ?? 0.2) + (bounds?.width ?? 0.4) * 0.15;
      maxXForehead = (bounds?.x ?? 0.2) + (bounds?.width ?? 0.4) * 0.85;
    }
    const foreheadWidth = Math.max(0.08, maxXForehead - minXForehead);

    // 4. Ancho de mandíbula (Jaw width: a nivel del 75% al 85% de la altura)
    const jawYStart = minY + faceLength * 0.70;
    const jawYEnd = minY + faceLength * 0.90;
    const jawPoints = points.filter((p) => p.y >= jawYStart && p.y <= jawYEnd);
    let minXJaw = 1;
    let maxXJaw = 0;
    if (jawPoints.length > 0) {
      for (const p of jawPoints) {
        if (p.x < minXJaw) minXJaw = p.x;
        if (p.x > maxXJaw) maxXJaw = p.x;
      }
    } else {
      minXJaw = minXMid + cheekboneWidth * 0.2;
      maxXJaw = maxXMid - cheekboneWidth * 0.2;
    }
    const jawWidth = Math.max(0.06, maxXJaw > minXJaw ? maxXJaw - minXJaw : cheekboneWidth * 0.75);

    const lengthToCheekRatio = faceLength / cheekboneWidth;
    const foreheadToJawRatio = foreheadWidth / jawWidth;
    const cheekToJawRatio = cheekboneWidth / jawWidth;

    const ratios: FaceRatios = {
      faceLength,
      foreheadWidth,
      cheekboneWidth,
      jawWidth,
      lengthToCheekRatio,
      foreheadToJawRatio,
      cheekToJawRatio,
    };

    let faceShape: FaceShape = 'ovalada';
    let explanation = '';
    let confidence = 0.82;

    if (lengthToCheekRatio >= 1.48) {
      faceShape = 'alargada';
      explanation = 'La longitud de tu rostro es significativamente mayor que el ancho de tus pómulos.';
      confidence = 0.88;
    } else if (cheekToJawRatio >= 1.35 && foreheadToJawRatio >= 1.25) {
      if (cheekboneWidth > foreheadWidth * 1.1) {
        faceShape = 'diamante';
        explanation = 'Tus pómulos destacan como el punto más ancho de tu rostro con frente y barbilla estrechas.';
        confidence = 0.84;
      } else {
        faceShape = 'corazon';
        explanation = 'Tu frente y pómulos son amplios y se afinan gradualmente hacia un mentón definido.';
        confidence = 0.85;
      }
    } else if (
      lengthToCheekRatio <= 1.38 &&
      jawWidth >= cheekboneWidth * 0.82 &&
      foreheadToJawRatio >= 0.85 &&
      foreheadToJawRatio <= 1.25
    ) {
      faceShape = 'cuadrada';
      explanation = 'La frente y la mandíbula tienen anchos similares, con proporciones compatibles con un rostro cuadrado.';
      confidence = 0.74;
    } else if (lengthToCheekRatio <= 1.22) {
      faceShape = 'redonda';
      explanation = 'Tus proporciones de largo y ancho son muy equilibradas, con curvas suaves en mandíbula y pómulos.';
      confidence = 0.78;
    } else {
      if (foreheadToJawRatio >= 1.28) {
        faceShape = 'corazon';
        explanation = 'Frente amplia y barbilla más estrecha con pómulos suaves.';
        confidence = 0.81;
      } else {
        faceShape = 'ovalada';
        explanation = 'Proporción equilibrada y versátil, ligeramente más largo que ancho con ángulos suaves.';
        confidence = 0.89;
      }
    }

    return {
      faceShape,
      confidence,
      detected: true,
      ratios,
      pointsCount: points.length,
      bounds,
      explanation,
    };
  },
};
