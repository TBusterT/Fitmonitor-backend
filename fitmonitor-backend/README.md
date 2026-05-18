# FitMonitor Backend Ready

Оновлений бекенд для варіанту 21: **веб-сайт платформи для моніторингу здоров'я та фізичної активності**.

Стек:

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT через `Authorization: Bearer <token>`
- Хостинг статичних файлів з папки `public`

## Що реалізовано за вимогами

1. **Express-сервер** з API та статичними файлами.
2. **Реляційна база даних PostgreSQL** через Prisma.
3. **Готова Prisma-схема** і міграція для створення таблиць.
4. **JWT-аутентифікація**: реєстрація, логін, `GET /api/protected`.
5. **Активні тренування**:
   - `GET /api/active-workouts/grouped` — отримання активних/запланованих тренувань, згрупованих за типами.
   - `POST /api/active-workouts` — збереження активного тренування.
   - `PATCH /api/active-workouts/:id/finish` — завершення тренування, запис у прогрес та оновлення статистики.
6. Додаткові маршрути для тренувань, вправ, цілей, прогресу, рецептів, харчування, календаря, метрик здоров'я.

## Запуск

### 1. Встановити залежності

```bash
npm install
```

### 2. Створити `.env`

Скопіюй приклад:

```bash
copy .env .env
```

На Linux/Mac:

```bash
cp .env .env
```

У `.env` вкажи свій PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitmonitor?schema=public"
PORT=5000
JWT_SECRET="replace_this_with_long_random_secret"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Згенерувати Prisma Client

```bash
npm run prisma:generate
```

### 4. Запустити міграцію

```bash
npm run prisma:migrate
```

### 5. Заповнити БД тестовими даними

```bash
npm run db:seed
```

Тестовий користувач після seed:

```txt
taras@example.com
password123
```

### 6. Запустити сервер

```bash
npm run dev
```

Сервер буде доступний тут:

```txt
http://localhost:5000
```

Тест:

```txt
http://localhost:5000/api/message
```

## Основні маршрути

### Тестові

| Метод | Маршрут | Опис |
|---|---|---|
| GET | `/api/message` | Перевірка роботи API |
| GET | `/api/health` | Health check |

### Auth / JWT

| Метод | Маршрут | Опис |
|---|---|---|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Логін, повертає JWT |
| GET | `/api/auth/me` | Дані поточного користувача |
| GET | `/api/protected` | Захищений маршрут за вимогою завдання |

### Активні тренування

Ці маршрути захищені. Треба передавати токен:

```http
Authorization: Bearer <token>
```

| Метод | Маршрут | Опис |
|---|---|---|
| GET | `/api/active-workouts` | Список активних тренувань користувача |
| GET | `/api/active-workouts/grouped` | Активні/заплановані тренування, згруповані за типами |
| GET | `/api/active-workouts/:id` | Одне активне тренування |
| POST | `/api/active-workouts` | Створити/зберегти активне тренування |
| PATCH | `/api/active-workouts/:id` | Оновити активне тренування |
| PATCH | `/api/active-workouts/:id/finish` | Завершити тренування і записати в прогрес |
| DELETE | `/api/active-workouts/:id` | Видалити активне тренування |

Приклад створення активного тренування:

```json
{
  "typeId": 1,
  "trainingId": 1,
  "title": "Фулбоді силове тренування",
  "status": "ACTIVE",
  "durationMinutes": 50,
  "caloriesBurned": 450,
  "notes": "Тренування розпочато"
}
```

### Тренування і довідники

| Метод | Маршрут | Опис |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/workout-types` | Типи тренувань |
| GET/POST/PATCH/DELETE | `/api/trainings` | Плани тренувань |
| GET | `/api/trainings/grouped/by-type` | Плани тренувань, згруповані за типами |
| GET/POST/PATCH/DELETE | `/api/exercises` | Вправи |
| GET/POST/PATCH/DELETE | `/api/achievements` | Досягнення |
| GET/POST/PATCH/DELETE | `/api/recipes` | Рецепти |

### Користувацькі дані

Усі ці маршрути захищені JWT:

| Метод | Маршрут | Опис |
|---|---|---|
| GET/POST/DELETE | `/api/progress/history` | Історія прогресу |
| GET | `/api/progress` | Загальна статистика + остання історія |
| GET/POST/PATCH/DELETE | `/api/goals` | Цілі користувача |
| GET/POST/PATCH/DELETE | `/api/calendar-events` | Події календаря |
| GET/POST/PATCH/DELETE | `/api/diet-entries` | Харчування |
| GET/POST/PATCH/DELETE | `/api/health-metrics` | Метрики здоров'я |

## Приклад перевірки в Postman / Thunder Client

### 1. Login

`POST http://localhost:5000/api/auth/login`

```json
{
  "email": "taras@example.com",
  "password": "password123"
}
```

Скопіюй `token` з відповіді.

### 2. Protected route

`GET http://localhost:5000/api/protected`

Headers:

```txt
Authorization: Bearer <token>
```

### 3. Активні тренування, згруповані за типами

`GET http://localhost:5000/api/active-workouts/grouped`

Headers:

```txt
Authorization: Bearer <token>
```

## Таблиці БД

У міграції створюються таблиці:

- `User`
- `WorkoutType`
- `Training`
- `Exercise`
- `TrainingExercise`
- `ActiveWorkout`
- `ProgressStats`
- `ProgressHistory`
- `Achievement`
- `Goal`
- `CalendarEvent`
- `Recipe`
- `DietEntry`
- `HealthMetric`

## Важливо

- `.env` не додано в архів, є тільки `.env.example`.
- `node_modules` не додано в архів. Після розпакування треба виконати `npm install`.
- Міграція вже лежить у `prisma/migrations/20260517120000_init/migration.sql`.
