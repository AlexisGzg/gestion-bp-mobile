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
    // Simula una breve resolución asíncrona idéntica a una consulta a Supabase
    return new Promise((resolve) => {
      setTimeout(() => {
        const matches = HAIRCUTS_CATALOG.filter((haircut) =>
          haircut.faceShapes.includes(faceShape)
        );
        // Si no hubiera coincidencia directa, devolver cortes versátiles
        if (matches.length === 0) {
          resolve(HAIRCUTS_CATALOG.slice(0, 3));
        } else {
          resolve(matches);
        }
      }, 150);
    });
  },

  /**
   * Obtiene un corte específico por su identificador.
   */
  async getHaircutById(id: string): Promise<Haircut | null> {
    const item = HAIRCUTS_CATALOG.find((h) => h.id === id) || null;
    return Promise.resolve(item);
  },

  /**
   * Obtiene todo el catálogo de cortes disponibles.
   */
  async getAllHaircuts(): Promise<Haircut[]> {
    return Promise.resolve(HAIRCUTS_CATALOG);
  },
};
