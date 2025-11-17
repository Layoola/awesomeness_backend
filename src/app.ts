import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./openapi.yaml');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Awesomeness Backend' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
