import { Router } from "express";
import { NFCeController } from "./controllers/NFCeController";

const routes = Router();

routes.post('/', new NFCeController().getInfo)

export default routes;