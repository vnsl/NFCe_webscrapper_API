import express from 'express';
import routes from './routes';

const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(routes);

app.listen(process.env.PORT || 3000)
