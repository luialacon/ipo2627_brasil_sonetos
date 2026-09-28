// MODELO: datos y lógica de negocio. No conoce el DOM.
export class Modelo {
    constructor() {
        this.sonetos = [];
        this.sonetoActual = null;
    }

    // Carga el índice y todos los sonetos una sola vez
    async iniciar() {
        const respuesta = await fetch('./data/index.json');
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar el índice de sonetos (${respuesta.status})`);
        }
        const indice = await respuesta.json();

        const resultados = await Promise.allSettled(indice.map((entrada) => this.#cargarSoneto(entrada)));
        resultados
            .filter((resultado) => resultado.status === 'rejected')
            .forEach((resultado) => console.warn(resultado.reason));

        this.sonetos = resultados
            .filter((resultado) => resultado.status === 'fulfilled')
            .map((resultado) => resultado.value);
        this.sonetoActual = this.sonetos[0] ?? null;
    }

    obtenerSonetos() {
        return this.sonetos;
    }

    obtenerSonetoActual() {
        return this.sonetoActual;
    }

    seleccionarSoneto(id) {
        const soneto = this.sonetos.find((elemento) => elemento.id === id);
        if (soneto) {
            this.sonetoActual = soneto;
        }
        return soneto ?? null;
    }

    // Búsqueda por título o autor, sin distinguir mayúsculas ni tildes
    buscarSonetos(consulta) {
        const consultaLimpia = this.#normalizar(consulta);
        if (!consultaLimpia) return [];

        return this.sonetos.filter(({ titulo, autor }) =>
            this.#normalizar(titulo).includes(consultaLimpia) ||
            this.#normalizar(autor).includes(consultaLimpia)
        );
    }

    async #cargarSoneto({ id, titulo, fichero }) {
        const respuesta = await fetch(fichero);
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${fichero} (${respuesta.status})`);
        }
        const texto = await respuesta.text();
        return this.#interpretarSoneto(id, texto, titulo);
    }

    // Formato del .md: "Título: ...", "Autor: ...", "Soneto" y los 14 versos
    #interpretarSoneto(id, texto, tituloPorDefecto) {
        const lineas = texto.replace(/\r\n/g, '\n').split('\n');

        let titulo = tituloPorDefecto ?? 'Sin título';
        let autor = 'Anónimo';
        const versos = [];

        for (const linea of lineas) {
            const limpia = linea.trim();
            if (!limpia) continue;

            if (/^T[íi]tulo:/i.test(limpia)) {
                titulo = limpia.replace(/^T[íi]tulo:\s*/i, '').replace(/^"|"$/g, '').trim();
            } else if (/^Autor:/i.test(limpia)) {
                autor = limpia.replace(/^Autor:\s*/i, '').replace(/^"|"$/g, '').trim();
            } else if (!/^Soneto:?$/i.test(limpia)) {
                versos.push(limpia);
            }
        }

        // Soneto: dos cuartetos (4 + 4) y dos tercetos (3 + 3)
        const estrofas = versos.length === 14
            ? [versos.slice(0, 4), versos.slice(4, 8), versos.slice(8, 11), versos.slice(11, 14)]
            : [versos];

        return { id, titulo, autor, estrofas };
    }

    #normalizar(texto = '') {
        return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}
