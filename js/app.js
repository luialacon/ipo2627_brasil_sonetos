import { Modelo } from './modelo.js';
import { Vista } from './vista.js';
import { Controlador } from './controlador.js';

// Al ser un módulo, el script se ejecuta cuando el DOM ya está listo
const controlador = new Controlador(new Modelo(), new Vista());
controlador.iniciar();
