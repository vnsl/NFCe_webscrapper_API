import express from 'express';
import routes from './routes';
const cors = require('cors');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

app.use(routes);

app.listen(process.env.PORT || 3000)
