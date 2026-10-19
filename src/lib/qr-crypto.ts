/**
 * QR Crypto Utilities (port desde la web: src/shared/lib/qr-crypto.ts)
 * Genera y valida tokens dinámicos TOTP-like para códigos QR.
 * El escáner web valida este mismo formato: {8 chars del UUID}:{hash de 12 hex}.
 */

const SLOT_DURATION = 30; // seconds

function getTimeSlot(offsetSlots = 0): number {
  return Math.floor(Date.now() / 1000 / SLOT_DURATION) + offsetSlots;
}

function simpleHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(12, '0').slice(0, 12);
}

/**
 * Token dinámico para el QR. Cambia cada SLOT_DURATION segundos.
 * Formato: {primeros 8 chars del appointmentId}:{hash hex de 12 chars}
 */
export function generateDynamicToken(appointmentId: string, qrSeed: string): string {
  const slot = getTimeSlot();
  const idPrefix = appointmentId.replace(/-/g, '').slice(0, 8);
  const hash = simpleHash(`${qrSeed}:${slot}`);
  return `${idPrefix}:${hash}`;
}

/**
 * Valida un token contra la semilla de la cita (tolerancia ±1 slot).
 */
export function validateDynamicToken(
  token: string,
  appointmentId: string,
  qrSeed: string
): boolean {
  const [tokenPrefix, tokenHash] = token.split(':');
  if (!tokenPrefix || !tokenHash) return false;

  const idPrefix = appointmentId.replace(/-/g, '').slice(0, 8);
  if (tokenPrefix.toLowerCase() !== idPrefix.toLowerCase()) return false;

  for (let offset = -1; offset <= 1; offset++) {
    const slot = getTimeSlot(offset);
    const expectedHash = simpleHash(`${qrSeed}:${slot}`);
    if (tokenHash.toLowerCase() === expectedHash.toLowerCase()) return true;
  }
  return false;
}

/**
 * Segundos restantes en el slot actual.
 */
export function getSlotCountdown(): number {
  return SLOT_DURATION - (Math.floor(Date.now() / 1000) % SLOT_DURATION);
}

export const QR_SLOT_DURATION = SLOT_DURATION;
