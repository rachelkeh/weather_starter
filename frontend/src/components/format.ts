export function formatTemperature(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}°` : '--°';
}

export function formatTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatLocationName(
  area: string | null | undefined,
  latitude: number,
  longitude: number,
): string {
  return area || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

export function formatMapPinLabel(
  condition: string | null | undefined,
  temperatureC: number | null | undefined,
): string {
  const temperature = formatTemperature(temperatureC);
  return condition ? `${condition} ${temperature}` : temperature;
}
