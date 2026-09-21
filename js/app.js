import { SonnetModel } from './model.js';
import { SonnetView } from './view.js';
import { SonnetController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new SonnetModel();
    const view = new SonnetView();
    const app = new SonnetController(model, view);

    app.init();
});