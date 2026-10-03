// ─── Readiness Engine ─────────────────────────────
export function calcReadiness(checkIn: any, prevLoad?: number, baselineRHR?: number): {
  overall: number;
  sleepScore: number;
  hrRecoveryScore: number;
  energyScore: number;
  sorenessScore: number;
  painPenalty: number;
  trainingRecovery: number;
  zone: string;
  insights: string[];
} {
  const insights: string[] = [];

  // Sleep Score (25%)
  const durationScore = Math.min((checkIn.sleepHours || 7) / 8 * 100, 100);
  const qualityScore = (checkIn.sleepQuality || 5) * 10;
  const sleepScore = Math.round((durationScore + qualityScore) / 2);
  if (sleepScore < 70) insights.push("Sleep quality below optimal — prioritize rest tonight");
  if (checkIn.sleepHours < 7) insights.push("Sleep duration under 7 hours");

  // HR Recovery (25%)
  let hrRecoveryScore = 80;
  if (checkIn.restingHeartRate && baselineRHR) {
    const deviation = ((checkIn.restingHeartRate - baselineRHR) / baselineRHR) * 100;
    if (deviation <= 3) hrRecoveryScore = 90;
    else if (deviation <= 8) hrRecoveryScore = 70;
    else if (deviation <= 15) hrRecoveryScore = 45;
    else hrRecoveryScore = 20;
    if (deviation > 8) insights.push("Elevated RHR detected — possible fatigue or illness");
  }

  // Energy Score (15%)
  const energyScore = Math.round((checkIn.energyLevel || 5) * 10);
  if (energyScore < 50) insights.push("Low energy — consider lighter session");

  // Soreness Score (15%)
  const sorenessScore = Math.round(100 - ((checkIn.soreness || 3) * 10));

  // Pain Penalty (10%)
  const pains = [
    checkIn.groinPain || 0, checkIn.lowerBackPain || 0,
    checkIn.shoulderPain || 0, checkIn.kneePain || 0,
    checkIn.hamstringTightness || 0,
  ];
  const avgPain = pains.reduce((a, b) => a + b, 0) / pains.length;
  const painPenalty = Math.round(Math.max(0, 100 - avgPain * 15));
  const maxPain = Math.max(...pains);
  if (maxPain >= 5) insights.push("Significant pain detected — consider modifying training");

  // Training Recovery (10%)
  let trainingRecovery = 85;
  if (prevLoad) {
    if (prevLoad > 500) trainingRecovery = 70;
    if (prevLoad > 1000) trainingRecovery = 55;
    if (prevLoad > 1000) insights.push("Very high recent training load — recovery recommended");
  }

  // Mood multiplier
  const moodMult = checkIn.mood === "good" ? 1.05 :
    checkIn.mood === "neutral" ? 1.0 :
    checkIn.mood === "bad" ? 0.9 : 0.85;

  const overall = Math.round(
    (sleepScore * 0.25 + hrRecoveryScore * 0.25 + energyScore * 0.15 +
     sorenessScore * 0.15 + painPenalty * 0.10 + trainingRecovery * 0.10) * moodMult
  );

  const zone = overall >= 80 ? "green" : overall >= 60 ? "yellow" : "red";

  return {
    overall: Math.min(100, Math.max(0, overall)),
    sleepScore, hrRecoveryScore, energyScore,
    sorenessScore, painPenalty, trainingRecovery,
    zone, insights,
  };
}

// ─── Training Load Engine ─────────────────────────────
export function calcTrainingLoad(loads: { date: Date; load: number }[], todayLoad?: number): {
  acuteLoad: number;
  chronicLoad: number;
  acwr: number;
  fatigueIndex: number;
  status: string;
} {
  const allLoads = [...loads.map(l => l.load)];
  if (todayLoad) allLoads.push(todayLoad);

  const last7 = allLoads.slice(-7);
  const last28 = allLoads.slice(-28);

  const acuteLoad = last7.length ? last7.reduce((a, b) => a + b, 0) / 7 : 0;
  const chronicLoad = last28.length ? last28.reduce((a, b) => a + b, 0) / 28 : 0;
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 1;

  // Fatigue Index
  const avgLoad = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
  const maxLoad = last7.length ? Math.max(...last7) : 0;
  const fatigueIndex = maxLoad > 0 ? Math.round((avgLoad / maxLoad) * 100) : 100;

  let status = "optimal";
  if (acwr > 1.5) status = "overload-risk";
  else if (acwr > 1.3) status = "high";
  else if (acwr < 0.7) status = "detraining";
  else if (acwr < 0.8) status = "underload";

  return {
    acuteLoad: Math.round(acuteLoad * 10) / 10,
    chronicLoad: Math.round(chronicLoad * 10) / 10,
    acwr: Math.round(acwr * 100) / 100,
    fatigueIndex,
    status,
  };
}

// ─── Injury Risk Engine ─────────────────────────────
export function calcInjuryRisk(painAverages: Record<string, number>, mobilityCompliance: number,
  runningRPE: number, acwr: number, prevInjuries: string[]): {
  overall: number;
  byLocation: Record<string, number>;
  level: string;
} {
  const locations = ["groin", "lowerBack", "shoulder", "knee", "hamstring"];
  const byLocation: Record<string, number> = {};

  for (const loc of locations) {
    let risk = (painAverages[loc] || 0) * 10;
    // Mobility penalty
    if (mobilityCompliance < 50) {
      const penalty = loc === "knee" ? 1.4 : loc === "groin" ? 1.3 :
        loc === "hamstring" ? 1.3 : loc === "lowerBack" ? 1.2 : 1.0;
      risk *= penalty;
    }
    // High intensity
    if (runningRPE > 8) risk *= 1.2;
    // High ACWR
    if (acwr > 1.5) risk *= 1.3;
    // Previous injury bonus
    if (prevInjuries.includes(loc)) risk *= 1.2;
    byLocation[loc] = Math.min(100, Math.round(risk));
  }

  const overall = Math.round(Object.values(byLocation).reduce((a, b) => a + b, 0) / locations.length);
  const level = overall <= 20 ? "low" : overall <= 45 ? "moderate" : overall <= 70 ? "high" : "critical";

  return { overall, byLocation, level };
}

// ─── Race Prediction Engine ─────────────────────────────
export function calcRacePredictions(runs: { distance: number; duration: number }[]): {
  predictions: Record<string, number>;
  vo2Max: number | null;
  confidence: "low" | "medium" | "high";
} {
  if (runs.length === 0) return { predictions: {}, vo2Max: null, confidence: "low" };

  // Find longest run >= 3km for predictions
  const qualifyingRuns = runs.filter(r => r.distance >= 3).sort((a, b) => b.distance - a.distance);
  const predictions: Record<string, number> = {};
  let vo2Max: number | null = null;

  if (qualifyingRuns.length > 0) {
    const best = qualifyingRuns[0];
    const distances = [5, 10, 21.0975, 42.195];
    for (const d of distances) {
      if (d !== best.distance) {
        predictions[`${d}k`] = riegelPredict(best.duration, best.distance, d);
      }
    }
    // VO2 Max from best run
    vo2Max = Math.round(estimateVO2Max(best.distance, best.duration) * 10) / 10;
  }

  const confidence = qualifyingRuns.length >= 5 ? "high" : qualifyingRuns.length >= 2 ? "medium" : "low";

  return { predictions, vo2Max, confidence };
}

function riegelPredict(knownTime: number, knownDist: number, targetDist: number): number {
  return Math.round(knownTime * Math.pow(targetDist / knownDist, 1.06));
}

function estimateVO2Max(distanceKm: number, timeSeconds: number): number {
  const velocity = (distanceKm * 1000) / timeSeconds;
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
  const pctMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeSeconds / 60) +
    0.2989558 * Math.exp(-0.1932605 * timeSeconds / 60);
  return vo2 / pctMax;
}

// ─── Adaptive Plan Engine ─────────────────────────────
export function adaptPlan(plan: any, readiness: number, acwr: number,
  completionRate: number, phase: string): { volumeMultiplier: number; intensityMultiplier: number; notes: string[] } {
  const notes: string[] = [];

  // Base multipliers from readiness
  let volumeMultiplier = 1.0;
  let intensityMultiplier = 1.0;

  if (readiness >= 80) {
    volumeMultiplier = 1.05;
    intensityMultiplier = 1.10;
  } else if (readiness >= 60) {
    volumeMultiplier = 1.0;
    intensityMultiplier = 0.9;
  } else {
    volumeMultiplier = 0.7;
    intensityMultiplier = 0.7;
    notes.push("Low readiness — reduced volume and intensity");
  }

  // ACWR adjustments
  if (acwr > 1.5) {
    volumeMultiplier *= 0.8;
    intensityMultiplier *= 0.85;
    notes.push("High training load — deload recommended");
  } else if (acwr < 0.8) {
    volumeMultiplier *= 1.1;
    notes.push("Low training load — safe to increase volume");
  }

  // Phase multipliers
  if (phase === "peak") {
    volumeMultiplier *= 1.0;
    intensityMultiplier *= 1.1;
  } else if (phase === "taper") {
    volumeMultiplier *= 0.6;
    intensityMultiplier *= 1.0;
    notes.push("Taper week — maintaining intensity, reducing volume");
  } else if (phase === "base") {
    volumeMultiplier *= 0.9;
    intensityMultiplier *= 0.95;
  }

  // Poor completion rate
  if (completionRate < 60) {
    volumeMultiplier *= 0.9;
    notes.push("Low plan adherence — reducing load to improve compliance");
  }

  return {
    volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
    intensityMultiplier: Math.round(intensityMultiplier * 100) / 100,
    notes,
  };
}

// ─── Nutrition Coaching Engine ─────────────────────────────
export function calcNutritionCoaching(
  weightLogs: { date: Date; weight: number }[],
  nutritionLogs: { date: Date; calories: number }[],
  goal: string,
  rateOfChange: number,
  currentTargets: { calories: number; protein: number; carbs: number; fat: number }
): {
  estimatedTDEE: number;
  newTargets: { calories: number; protein: number; carbs: number; fat: number };
  trend: string;
  adjustment: string;
} {
  if (weightLogs.length < 7 || nutritionLogs.length < 7) {
    return {
      estimatedTDEE: currentTargets.calories,
      newTargets: { ...currentTargets },
      trend: "calibrating",
      adjustment: "Need more data (7+ days) for accurate TDEE estimation",
    };
  }

  const recentWeights = weightLogs.slice(-14).map(w => w.weight);
  const recentCalories = nutritionLogs.slice(-14).map(n => n.calories);

  const avgWeight = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
  const avgCalories = recentCalories.reduce((a, b) => a + b, 0) / recentCalories.length;

  // Weight trend (kg/week)
  const firstHalf = recentWeights.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const secondHalf = recentWeights.slice(7).reduce((a, b) => a + b, 0) / 7;
  const weeklyChange = (secondHalf - firstHalf) * 2;

  // Estimate TDEE
  const surplusDeficit = weeklyChange * 7700; // ~7700 kcal per kg
  const estimatedTDEE = Math.round(avgCalories - surplusDeficit / 7);

  let trend: string;
  if (Math.abs(weeklyChange) < 0.1) trend = "stable";
  else if (weeklyChange > 0) trend = "gaining";
  else trend = "losing";

  // Calculate new targets based on goal
  let targetCalories = estimatedTDEE;
  if (goal === "cut") targetCalories = estimatedTDEE - 500;
  else if (goal === "bulk") targetCalories = estimatedTDEE + 300;

  // Protein: 1.6-2.2 g/kg based on goal
  const proteinPerKg = goal === "cut" ? 2.0 : 1.8;
  const protein = Math.round(avgWeight * proteinPerKg);

  // Fat: 25-30% of calories
  const fatCalories = targetCalories * 0.28;
  const fat = Math.round(fatCalories / 9);

  // Carbs: remainder
  const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

  const adjustment = weeklyChange > rateOfChange ? "Reduce calories by 100-200" :
    weeklyChange < rateOfChange * 0.5 ? "Increase calories by 100-200" :
    "On track — maintain current targets";

  return { estimatedTDEE, newTargets: { calories: targetCalories, protein, carbs, fat }, trend, adjustment };
}
