import { Router } from "express";
import { NFCeController } from "./controllers/NFCeController";

const routes = Router();

routes.get('/', new NFCeController().getInfo)
routes.post('/teste', new NFCeController().getInfo)

export default routes;