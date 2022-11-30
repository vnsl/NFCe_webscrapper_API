import express from 'express';
import routes from './routes';

const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors({
    origin: '*'
}));

app.use(routes);

app.listen(process.env.PORT || 3000)
