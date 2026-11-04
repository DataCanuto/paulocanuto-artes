// Escolhe a fonte de dados uma única vez. Services importam daqui e não sabem se é MySQL ou JSON.
import { config } from '../config/env.js';
import * as temaMysql from './mysql/temaModel.js';
import * as obraMysql from './mysql/obraModel.js';
import { temaModel as temaJson, obraModel as obraJson } from './json/catalogo.js';

const usarJson = config.dataSource === 'json';

export const temaModel = usarJson ? temaJson : temaMysql;
export const obraModel = usarJson ? obraJson : obraMysql;
