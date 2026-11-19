import { Haircut, FaceShape } from '../types';
import { HAIRCUTS_CATALOG } from '../data/haircuts';

/**
 * Servicio desacoplado para obtener recomendaciones de cortes de cabello.
 * Actualmente lee del catálogo local estático.
 * En el futuro se puede conectar directamente a Supabase (tabla `haircuts`)
 * sin necesidad de modificar los componentes o pantallas consumidoras.
 */
export const HaircutsService = {
  /**
   * Obtiene los cortes recomendados para una forma de rostro específica.
   */
  async getRecommendedHaircuts(faceShape: FaceShape): Promise<Haircut[]> {
    const matches = HAIRCUTS_CATALOG.filter((haircut) =>
      haircut.faceShapes.includes(faceShape)
    );
    // Si no hubiera coincidencia directa, devolver cortes versátiles
    return matches.length === 0 ? HAIRCUTS_CATALOG.slice(0, 3) : matches;
  },
};
