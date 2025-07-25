import express from 'express';
import cors from 'cors';
import router from './src/routes';
import morgan from 'morgan';
import logger from './src/logger';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', router);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server started on http://localhost:${PORT}`);
});
