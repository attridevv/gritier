export function calcEpley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function paceToSeconds(pace: number): number {
  return pace * 60;
}

export function secondsToPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

export function riegelPredict(knownTime: number, knownDist: number, targetDist: number): number {
  return knownTime * Math.pow(targetDist / knownDist, 1.06);
}

export function estimateVO2Max(distanceKm: number, timeSeconds: number): number {
  const velocity = (distanceKm * 1000) / timeSeconds;
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
  const pctMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeSeconds / 60) + 0.2989558 * Math.exp(-0.1932605 * timeSeconds / 60);
  return vo2 / pctMax;
}

export function formatDistance(km: number): string {
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${(km * 1000).toFixed(0)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getWeekNumber(date: Date, startDate: Date): number {
  const diff = date.getTime() - startDate.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}
