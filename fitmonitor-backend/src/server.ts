import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`✅ FitMonitor Backend запущено: http://localhost:${PORT}`);
  console.log(`📡 Тест API: http://localhost:${PORT}/api/message`);
  console.log(`🔐 Protected route: http://localhost:${PORT}/api/protected`);
});
