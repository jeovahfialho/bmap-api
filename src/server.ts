import express from 'express';
import cors from 'cors';
import cardsRoutes from './presentation/routes/cardsRoutes';
import aiRoutes from './presentation/routes/aiRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/cards', cardsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BusinessMap API is running' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});