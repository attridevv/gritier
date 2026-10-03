import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

async function main() {
  console.log("Seeding GRIT database...");

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { clerkId: "demo_clerk_user_1" },
    update: {},
    create: {
      clerkId: "demo_clerk_user_1",
      email: "demo@grit.os",
      name: "Demo Athlete",
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create profile
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      height: 175,
      weight: 72,
      bodyFat: 15,
      age: 20,
      sex: "male",
      restingHR: 55,
      vo2Max: 52,
      trainingAge: 2.5,
      raceGoal: "Sub-1:40 Half Marathon",
      raceDistance: "half",
      raceDate: new Date("2027-03-15"),
      prs: { "5k": 1214, "10k": 2520 },
      strengthPriorities: ["push", "pull", "squat"],
      endurancePriorities: ["easy", "tempo", "longRun"],
      weeklyAvailability: 8,
      recoveryCapacity: "medium",
      preferredSplit: ["run", "run", "strength", "run", "run", "strength"],
      equipmentAccess: ["barbell", "dumbbells", "pull_up_bar"],
      dietaryPreference: "balanced",
      targetCalories: 2600,
      targetProtein: 180,
      targetCarbs: 310,
      targetFat: 80,
      isPublic: true,
      bio: "Hybrid athlete. Running + lifting.",
    },
  });

  console.log(`Created profile for ${profile.userId}`);

  // Create nutrition target
  const nutritionTarget = await prisma.nutritionTarget.create({
    data: {
      userId: user.id,
      calories: 2600,
      protein: 180,
      carbs: 310,
      fat: 80,
      estimatedTDEE: 2650,
      expenditureTrend: "stable",
      goal: "cut",
      rateOfChange: -0.5,
    },
  });

  console.log("Created nutrition target");

  // Create training plan
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: user.id,
      name: "Half Marathon Build",
      type: "running",
      phase: "build",
      distance: "half",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2027-03-15"),
      raceDate: new Date("2027-03-15"),
      totalWeeks: 12,
      currentWeek: 6,
      weeksPerMesocycle: 4,
      isAdaptive: true,
      autoProgress: true,
      status: "active",
      completedWeeks: 5,
      baselineFitness: { recent5k: 1214, recent10k: 2520 },
      preferredPaces: { easy: 5.75, tempo: 4.83, threshold: 4.5, vo2max: 4.0 },
    },
  });

  console.log(`Created plan: ${plan.name}`);

  // Create plan days for current week
  const weekPlan = [
    { day: 0, workoutType: "rest", name: "Rest & Recovery", week: 6 },
    { day: 1, workoutType: "easy", name: "Easy 5K", targetDistance: 5, targetRPE: 4, paceWindow: { min: "5:30", max: "6:00" }, week: 6 },
    { day: 2, workoutType: "strength", name: "Lower Body", targetRPE: 6, week: 6 },
    { day: 3, workoutType: "tempo", name: "Tempo 6K", targetDistance: 6, targetRPE: 7, paceWindow: { min: "4:50", max: "5:10" }, week: 6 },
    { day: 4, workoutType: "rest", name: "Active Recovery", week: 6 },
    { day: 5, workoutType: "easy", name: "Easy Shakeout", targetDistance: 3, targetRPE: 3, week: 6 },
    { day: 6, workoutType: "longRun", name: "Long Run 10K", targetDistance: 10, targetRPE: 5, paceWindow: { min: "5:45", max: "6:15" }, week: 6 },
  ];

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  for (const day of weekPlan) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + day.day);
    await prisma.planDay.create({
      data: {
        planId: plan.id,
        userId: user.id,
        date,
        weekNumber: day.week,
        dayOfWeek: day.day,
        workoutType: day.workoutType,
        name: day.name,
        targetDistance: day.targetDistance,
        targetRPE: day.targetRPE,
        paceWindow: day.paceWindow,
        completed: day.day < 3,
        completedAt: day.day < 3 ? date : undefined,
      },
    });
  }

  console.log(`Created ${weekPlan.length} plan days for week 6`);

  // Create sample activities
  const activities = [
    {
      type: "run" as const,
      name: "Easy Morning Run",
      date: new Date(Date.now() - 86400000),
      duration: 1694,
      rpe: 4,
      distance: 5.2,
      avgHr: 142,
      maxHr: 156,
      cadence: 172,
      pace: 5.43,
      terrain: "road",
      isPublic: true,
      likesCount: 12,
      commentsCount: 3,
    },
    {
      type: "run" as const,
      name: "Tempo Intervals",
      date: new Date(Date.now() - 3 * 86400000),
      duration: 1960,
      rpe: 8,
      distance: 7.0,
      avgHr: 156,
      maxHr: 170,
      cadence: 178,
      pace: 4.67,
      terrain: "road",
      isPublic: true,
      likesCount: 8,
      commentsCount: 1,
    },
    {
      type: "strength" as const,
      name: "Upper Body Push",
      date: new Date(Date.now() - 2 * 86400000),
      duration: 2700,
      rpe: 7,
      calories: 320,
      isPublic: false,
      likesCount: 5,
      commentsCount: 0,
    },
  ];

  for (const act of activities) {
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        ...act,
      },
    });

    if (act.type === "strength") {
      const exercises = [
        { name: "Bench Press", category: "push", weight: 80, sets: 4, reps: 6, rpe: 7 },
        { name: "Overhead Press", category: "push", weight: 45, sets: 3, reps: 8, rpe: 7 },
        { name: "Dips", category: "push", weight: 0, sets: 3, reps: 10, rpe: 6 },
      ];
      for (const ex of exercises) {
        const est1RM = ex.weight > 0 ? ex.weight * (1 + ex.reps! / 30) : null;
        const vol = ex.weight > 0 ? ex.sets! * ex.reps! * ex.weight : 0;
        await prisma.exercise.create({
          data: {
            activityId: activity.id,
            ...ex,
            estimated1RM: est1RM,
            volumeLoad: vol,
          },
        });
      }
    }
  }

  console.log(`Created ${activities.length} activities`);

  // Create readiness scores
  for (let i = 13; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const score = 65 + Math.floor(Math.random() * 25);
    await prisma.readinessScore.create({
      data: {
        userId: user.id,
        date,
        overall: score,
        sleepScore: 70 + Math.floor(Math.random() * 20),
        hrRecoveryScore: 75 + Math.floor(Math.random() * 15),
        energyScore: 60 + Math.floor(Math.random() * 30),
        sorenessScore: 70 + Math.floor(Math.random() * 20),
        painPenalty: 85 + Math.floor(Math.random() * 15),
        trainingRecovery: 80 + Math.floor(Math.random() * 15),
        zone: score >= 80 ? "green" : score >= 60 ? "yellow" : "red",
        insights: score >= 80 ? ["Feeling great — push the pace"] : score >= 60 ? ["Moderate — maintain volume"] : ["Low — prioritize recovery"],
      },
    });
  }

  console.log("Created 14 readiness scores");

  // Create meals
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    for (const mealType of mealTypes) {
      const calories = 400 + Math.floor(Math.random() * 500);
      const protein = 25 + Math.floor(Math.random() * 40);
      const carbs = 40 + Math.floor(Math.random() * 60);
      const fat = 15 + Math.floor(Math.random() * 30);
      await prisma.meal.create({
        data: {
          userId: user.id,
          name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
          date,
          mealType,
          foods: [
            { name: "Example Food", serving: "1 serving", calories, protein, carbs, fat },
          ],
          totalCalories: calories,
          totalProtein: protein,
          totalCarbs: carbs,
          totalFat: fat,
        },
      });
    }
  }

  console.log("Created 28 meals (4/day × 7 days)");

  // Create AI insight
  await prisma.aIInsight.create({
    data: {
      userId: user.id,
      type: "weekly",
      content: "Your training load has been in the sweet spot all week (ACWR 1.12). Readiness scores averaged 76, with good sleep (7.2h avg) and stable RHR. Consider extending your tempo block by 1km next week.",
      metadata: { readiness: 78, acwr: 1.12, injuryRisk: "low" },
      categories: ["training", "nutrition", "recovery"],
      recommendations: [
        "Extend Thursday tempo by 1km next week",
        "Add 30g post-run carbs",
        "Maintain mobility at 4+ sessions/week",
      ],
    },
  });

  console.log("Created weekly AI insight");

  // Create check-ins
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    await prisma.checkIn.create({
      data: {
        userId: user.id,
        date,
        sleepHours: 6.5 + Math.random() * 2.5,
        sleepQuality: 5 + Math.floor(Math.random() * 5),
        restingHeartRate: 53 + Math.floor(Math.random() * 6),
        energyLevel: 5 + Math.floor(Math.random() * 5),
        motivation: 5 + Math.floor(Math.random() * 5),
        mood: ["good", "neutral", "good", "good", "neutral"][Math.floor(Math.random() * 5)] as any,
        stressLevel: 2 + Math.floor(Math.random() * 4),
        soreness: 1 + Math.floor(Math.random() * 4),
        hydrationHit: Math.random() > 0.3,
        proteinHit: Math.random() > 0.4,
        mobilityCompleted: Math.random() > 0.5,
        groinPain: 0,
        lowerBackPain: Math.floor(Math.random() * 2),
        shoulderPain: 0,
        kneePain: 0,
        hamstringTightness: Math.floor(Math.random() * 3),
        habits: { nofap: true, junkfood: true, trained: true, meditation: Math.random() > 0.5, focused: Math.random() > 0.3 },
        habitScore: 3 + Math.floor(Math.random() * 3),
      },
    });
  }

  console.log("Created 7 check-ins");

  console.log("\n✅ Seed complete! GRIT is ready to roll.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
