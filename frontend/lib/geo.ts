/**
 * Minimal Web-Mercator helpers and a simplified Los Angeles County basemap.
 *
 * The demo ships without a Mapbox token (spec §15 — real keys are supplied by
 * the owner, never invented), so `MapView` draws this vector basemap itself and
 * stays fully interactive offline. The component's props are the seam: swapping
 * in Mapbox GL JS for Phase 1 means replacing one component, not the pages.
 */

export type LatLng = { lat: number; lng: number };

/** Mercator y, expressed in degrees so x and y share a scale. */
export function mercatorY(lat: number): number {
  const clamped = Math.max(-85, Math.min(85, lat));
  return (Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360)) * 180) / Math.PI;
}

export function project({ lat, lng }: LatLng): { x: number; y: number } {
  return { x: lng, y: -mercatorY(lat) };
}

/** Coastline from Point Mugu to Seal Beach, closed well inland to form land. */
const COAST: [number, number][] = [
  [34.1, -119.06], [34.05, -118.95], [34.01, -118.81], [34.04, -118.72], [34.03, -118.68],
  [34.04, -118.61], [34.04, -118.56], [34.02, -118.52], [34.01, -118.5], [33.99, -118.48],
  [33.96, -118.45], [33.94, -118.44], [33.92, -118.42], [33.89, -118.41], [33.85, -118.4],
  [33.8, -118.4], [33.76, -118.42], [33.74, -118.39], [33.71, -118.32], [33.72, -118.27],
  [33.75, -118.2], [33.74, -118.12], [33.68, -118.02], [33.6, -117.88],
];

const INLAND: [number, number][] = [
  [33.5, -117.5], [34.6, -117.3], [34.75, -119.3],
];

export const LAND_POLYGON: LatLng[] = [...COAST, ...INLAND].map(([lat, lng]) => ({ lat, lng }));

export const HIGHWAYS: { name: string; points: LatLng[] }[] = [
  {
    name: "I-405",
    points: [
      [34.28, -118.47], [34.17, -118.47], [34.09, -118.46], [34.05, -118.44], [33.98, -118.4],
      [33.92, -118.37], [33.85, -118.32], [33.79, -118.24], [33.76, -118.13],
    ].map(([lat, lng]) => ({ lat, lng })),
  },
  {
    name: "I-10",
    points: [[34.02, -118.49], [34.03, -118.4], [34.04, -118.33], [34.04, -118.24], [34.03, -118.12]]
      .map(([lat, lng]) => ({ lat, lng })),
  },
  {
    name: "US-101",
    points: [
      [34.17, -118.86], [34.16, -118.72], [34.15, -118.58], [34.14, -118.44], [34.11, -118.34],
      [34.06, -118.24],
    ].map(([lat, lng]) => ({ lat, lng })),
  },
  {
    name: "PCH",
    points: [[34.03, -118.68], [34.02, -118.52], [33.99, -118.48], [33.92, -118.42], [33.85, -118.4]]
      .map(([lat, lng]) => ({ lat, lng })),
  },
];

export const PLACE_LABELS: { name: string; at: LatLng; size?: number }[] = [
  { name: "Malibu", at: { lat: 34.035, lng: -118.7 } },
  { name: "Santa Monica", at: { lat: 34.024, lng: -118.47 } },
  { name: "Beverly Hills", at: { lat: 34.081, lng: -118.4 } },
  { name: "Los Angeles", at: { lat: 34.05, lng: -118.25 }, size: 1.15 },
  { name: "Calabasas", at: { lat: 34.145, lng: -118.66 } },
  { name: "Pasadena", at: { lat: 34.147, lng: -118.14 } },
  { name: "Long Beach", at: { lat: 33.79, lng: -118.16 } },
  { name: "Pacific Ocean", at: { lat: 33.86, lng: -118.72 }, size: 1.1 },
];

export function boundsOf(points: LatLng[], padding = 0.12) {
  const xs = points.map((p) => project(p).x);
  const ys = points.map((p) => project(p).y);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 0.04);
  const h = Math.max(maxY - minY, 0.04);
  minX -= w * padding;
  maxX += w * padding;
  minY -= h * padding;
  maxY += h * padding;
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}
