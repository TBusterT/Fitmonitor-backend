import dotenv from 'dotenv';
const { PrismaClient } = require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/utils/security';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL не задано');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.progressHistory.deleteMany();
  await prisma.activeWorkout.deleteMany();
  await prisma.trainingExercise.deleteMany();
  await prisma.progressStats.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.dietEntry.deleteMany();
  await prisma.healthMetric.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.training.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workoutType.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: 'Тарас Цюпак',
      email: 'taras@example.com',
      passwordHash: hashPassword('password123'),
      progressStats: {
        create: {
          workouts: 2,
          calories: 610,
          activeMinutes: 75,
          steps: 12500,
          streak: 3
        }
      }
    }
  });

  const [strength, cardio, yoga] = await Promise.all([
    prisma.workoutType.create({
      data: {
        name: 'Силові',
        description: 'Тренування з власною вагою, гантелями та штангою',
        image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'
      }
    }),
    prisma.workoutType.create({
      data: {
        name: 'Кардіо',
        description: 'Активності для витривалості та спалювання калорій',
        image: 'https://images.pexels.com/photos/4753996/pexels-photo-4753996.jpeg'
      }
    }),
    prisma.workoutType.create({
      data: {
        name: 'Йога',
        description: 'Розтяжка, мобільність і відновлення',
        image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg'
      }
    })
  ]);

  const squat = await prisma.exercise.create({
    data: {
      title: 'Присідання зі штангою',
      description: 'Базова вправа для ніг і сідниць.',
      muscle: 'Ноги',
      difficulty: 'INTERMEDIATE',
      equipment: 'Штанга',
      image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg',
      steps: ['Поставте ноги на ширині плечей', 'Опустіться до паралелі', 'Поверніться у вихідне положення'],
      mistakes: ['Зведення колін', 'Округлення спини']
    }
  });

  const bench = await prisma.exercise.create({
    data: {
      title: 'Жим штанги лежачи',
      description: 'Вправа для грудних мʼязів, плечей і трицепса.',
      muscle: 'Груди',
      difficulty: 'INTERMEDIATE',
      equipment: 'Штанга, лава',
      image: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg',
      steps: ['Ляжте на лаву', 'Опустіть штангу до грудей', 'Вижміть штангу вгору'],
      mistakes: ['Відрив таза', 'Неправильний хват']
    }
  });

  const burpee = await prisma.exercise.create({
    data: {
      title: 'Берпі',
      description: 'Інтенсивна кардіо-вправа для всього тіла.',
      muscle: 'Все тіло',
      difficulty: 'ADVANCED',
      equipment: 'Без обладнання',
      image: 'https://images.pexels.com/photos/4753996/pexels-photo-4753996.jpeg',
      steps: ['Присядьте', 'Вийдіть у планку', 'Виконайте стрибок вгору'],
      mistakes: ['Провал попереку', 'Занадто швидкий темп без техніки']
    }
  });

  const fullbody = await prisma.training.create({
    data: {
      title: 'Фулбоді силове тренування',
      description: 'Комплекс на все тіло: присідання, жим і базові рухи.',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
      badge: 'Середній',
      durationMinutes: 50,
      calories: 450,
      difficulty: 'INTERMEDIATE',
      typeId: strength.id,
      trainingExercises: {
        create: [
          { exerciseId: squat.id, order: 1, sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseId: bench.id, order: 2, sets: 4, reps: '8-10', restSeconds: 90 }
        ]
      }
    }
  });

  const hiit = await prisma.training.create({
    data: {
      title: 'Кардіо HIIT 20 хв',
      description: 'Інтервальне тренування для витривалості.',
      image: 'https://images.pexels.com/photos/4753996/pexels-photo-4753996.jpeg',
      badge: 'Новачок',
      durationMinutes: 20,
      calories: 300,
      difficulty: 'BEGINNER',
      typeId: cardio.id,
      trainingExercises: {
        create: [
          { exerciseId: burpee.id, order: 1, sets: 5, reps: '30 сек', restSeconds: 30 }
        ]
      }
    }
  });

  const morningYoga = await prisma.training.create({
    data: {
      title: 'Ранкова йога',
      description: 'Мʼяка розтяжка та дихання для старту дня.',
      image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg',
      badge: 'Новачок',
      durationMinutes: 30,
      calories: 150,
      difficulty: 'BEGINNER',
      typeId: yoga.id
    }
  });

  const activeStrength = await prisma.activeWorkout.create({
    data: {
      userId: user.id,
      trainingId: fullbody.id,
      typeId: strength.id,
      title: 'Фулбоді силове тренування',
      status: 'ACTIVE',
      durationMinutes: 50,
      caloriesBurned: 450,
      notes: 'Поточне активне тренування'
    }
  });

  await prisma.activeWorkout.create({
    data: {
      userId: user.id,
      trainingId: hiit.id,
      typeId: cardio.id,
      title: 'Кардіо HIIT 20 хв',
      status: 'PLANNED',
      durationMinutes: 20,
      caloriesBurned: 300
    }
  });

  await prisma.activeWorkout.create({
    data: {
      userId: user.id,
      trainingId: morningYoga.id,
      typeId: yoga.id,
      title: 'Ранкова йога',
      status: 'ACTIVE',
      durationMinutes: 30,
      caloriesBurned: 150
    }
  });

  await prisma.progressHistory.createMany({
    data: [
      {
        userId: user.id,
        activeWorkoutId: activeStrength.id,
        title: 'Кардіо HIIT',
        typeName: 'Кардіо',
        durationMinutes: 22,
        calories: 310,
        date: new Date('2026-05-07'),
        image: 'https://images.pexels.com/photos/4753996/pexels-photo-4753996.jpeg'
      },
      {
        userId: user.id,
        title: 'Йога',
        typeName: 'Йога',
        durationMinutes: 35,
        calories: 160,
        date: new Date('2026-05-06'),
        image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg'
      }
    ]
  });

  await prisma.achievement.createMany({
    data: [
      { title: 'Перше тренування', description: 'Завершити перше тренування', points: 50, icon: '🏆', isUnlocked: true, unlockedDate: new Date('2026-04-01'), current: 1, target: 1, unit: 'тренувань' },
      { title: 'Тиждень поспіль', description: '7 днів тренувань підряд', points: 200, icon: '🔥', isUnlocked: false, current: 3, target: 7, unit: 'днів' }
    ]
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, type: 'fitness', title: 'Схуднути на 5 кг', description: 'Знизити вагу до 75 кг', current: 2, target: 5, unit: 'кг', deadline: new Date('2026-07-01'), status: 'active' },
      { userId: user.id, type: 'fitness', title: 'Пробігти 5 км', description: 'Без зупинок за 30 хв', current: 3, target: 5, unit: 'км', deadline: new Date('2026-06-01'), status: 'active' }
    ]
  });

  await prisma.calendarEvent.createMany({
    data: [
      { userId: user.id, date: new Date('2026-05-18T10:00:00'), title: 'Силове тренування', duration: '50 хв', status: 'planned' },
      { userId: user.id, date: new Date('2026-05-19T18:00:00'), title: 'Кардіо', duration: '30 хв', status: 'planned' }
    ]
  });

  await prisma.recipe.createMany({
    data: [
      { title: 'Куряча грудка з овочами', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', time: '30 хв', calories: 380, protein: 42, fat: 10, carbs: 20, description: 'Легка та поживна страва.', category: 'Основне' },
      { title: 'Протеїновий смузі', image: 'https://images.pexels.com/photos/3652900/pexels-photo-3652900.jpeg', time: '5 хв', calories: 280, protein: 30, fat: 5, carbs: 25, description: 'Швидкий перекус після тренування.', category: 'Сніданок' }
    ]
  });

  await prisma.dietEntry.createMany({
    data: [
      { userId: user.id, name: 'Вівсянка з ягодами', mealType: 'Сніданок', calories: 350, protein: 12, fat: 8, carbs: 55 },
      { userId: user.id, name: 'Куряча грудка з рисом', mealType: 'Обід', calories: 520, protein: 45, fat: 12, carbs: 50 }
    ]
  });

  await prisma.healthMetric.createMany({
    data: [
      { userId: user.id, name: 'Вага', value: '78 кг', trend: 'down', trendText: '-0.5 кг' },
      { userId: user.id, name: 'ІМТ', value: '24.2', trend: 'stable', trendText: 'норма' }
    ]
  });

  console.log('✅ Seed завершено');
  console.log('Тестовий користувач: taras@example.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
