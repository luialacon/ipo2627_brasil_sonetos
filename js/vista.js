// VISTA: muestra la información y recoge las acciones del usuario.
// Solo cambia clases (classList); el aspecto lo decide el CSS.
export class Vista {
    constructor() {
        this.buscador = document.getElementById('buscador');
        this.listaResultados = document.getElementById('resultados');
        this.desplegable = document.getElementById('desplegable');
        this.contenedorSoneto = document.getElementById('soneto');

        this.indiceActivo = -1;
        this.cambioPendiente = null;
    }

    /* ---------- Desplegable ---------- */

    rellenarDesplegable(sonetos, idActual) {
        const opciones = sonetos.map(({ id, titulo, autor }) => {
            const opcion = document.createElement('option');
            opcion.value = id;
            opcion.textContent = `${titulo} — ${autor}`;
            return opcion;
        });
        this.desplegable.replaceChildren(...opciones);
        this.desplegable.value = idActual;
    }

    actualizarDesplegable(id) {
        this.desplegable.value = id;
    }

    escucharDesplegable(alCambiar) {
        this.desplegable.addEventListener('change', (evento) => alCambiar(evento.target.value));
    }

    /* ---------- Buscador ---------- */

    escucharBuscador(alEscribir, alElegir) {
        this.buscador.addEventListener('input', (evento) => alEscribir(evento.target.value));
        this.buscador.addEventListener('keydown', (evento) => this.#gestionarTeclado(evento, alElegir));

        // Delegación de eventos: un único listener para todos los resultados
        this.listaResultados.addEventListener('click', (evento) => {
            const resultado = evento.target.closest('.selector__resultado');
            if (resultado) this.#elegirResultado(resultado.dataset.id, alElegir);
        });

        // Cerrar la lista al pulsar fuera del buscador
        document.addEventListener('click', (evento) => {
            if (!evento.target.closest('.selector__combo')) this.ocultarResultados();
        });
    }

    mostrarResultados(sonetos) {
        const elementos = sonetos.length > 0
            ? sonetos.map((soneto) => this.#crearResultado(soneto))
            : [this.#crearSinResultados()];

        this.listaResultados.replaceChildren(...elementos);
        this.indiceActivo = -1;
        this.buscador.removeAttribute('aria-activedescendant');
        this.#alternarResultados(true);
    }

    ocultarResultados() {
        this.#alternarResultados(false);
        this.indiceActivo = -1;
        this.buscador.removeAttribute('aria-activedescendant');
    }

    // Navegación con teclado: flechas, Intro y Escape
    #gestionarTeclado(evento, alElegir) {
        if (evento.key === 'Escape') {
            this.ocultarResultados();
            return;
        }

        const estaAbierta = !this.listaResultados.classList.contains('selector__resultados--oculto');
        const resultados = estaAbierta ? [...this.listaResultados.querySelectorAll('.selector__resultado')] : [];
        if (resultados.length === 0) return;

        switch (evento.key) {
            case 'ArrowDown':
                evento.preventDefault();
                this.#resaltarResultado(resultados, (this.indiceActivo + 1) % resultados.length);
                break;
            case 'ArrowUp':
                evento.preventDefault();
                this.#resaltarResultado(resultados, (this.indiceActivo - 1 + resultados.length) % resultados.length);
                break;
            case 'Enter': {
                // Sin selección previa, Intro elige el primer resultado
                const resultado = resultados[this.indiceActivo] ?? resultados[0];
                evento.preventDefault();
                this.#elegirResultado(resultado.dataset.id, alElegir);
                break;
            }
        }
    }

    #resaltarResultado(resultados, indice) {
        resultados.forEach((resultado, i) => {
            const estaActivo = i === indice;
            resultado.classList.toggle('selector__resultado--activo', estaActivo);
            resultado.setAttribute('aria-selected', estaActivo);
        });
        this.indiceActivo = indice;
        this.buscador.setAttribute('aria-activedescendant', resultados[indice].id);
        resultados[indice].scrollIntoView({ block: 'nearest' });
    }

    #elegirResultado(id, alElegir) {
        alElegir(id);
        this.buscador.value = '';
        this.ocultarResultados();
    }

    #alternarResultados(visible) {
        this.listaResultados.classList.toggle('selector__resultados--oculto', !visible);
        this.buscador.setAttribute('aria-expanded', visible);
    }

    #crearResultado({ id, titulo, autor }) {
        const elemento = document.createElement('li');
        elemento.id = `resultado-${id}`;
        elemento.className = 'selector__resultado';
        elemento.dataset.id = id;
        elemento.setAttribute('role', 'option');
        elemento.setAttribute('aria-selected', 'false');

        const elementoTitulo = document.createElement('span');
        elementoTitulo.className = 'selector__resultado-titulo';
        elementoTitulo.textContent = titulo;

        const elementoAutor = document.createElement('span');
        elementoAutor.className = 'selector__resultado-autor';
        elementoAutor.textContent = autor;

        elemento.append(elementoTitulo, elementoAutor);
        return elemento;
    }

    #crearSinResultados() {
        const elemento = document.createElement('li');
        elemento.className = 'selector__vacio';
        elemento.textContent = 'No se encontraron coincidencias';
        return elemento;
    }

    /* ---------- Soneto ---------- */

    mostrarSoneto(soneto) {
        clearTimeout(this.cambioPendiente);
        this.contenedorSoneto.classList.add('soneto--desvanecido');

        // Espera a que termine el fundido definido en styles.css (--duracion-transicion)
        this.cambioPendiente = setTimeout(() => {
            this.contenedorSoneto.replaceChildren(
                this.#crearCabeceraSoneto(soneto),
                this.#crearCuerpoSoneto(soneto)
            );
            this.contenedorSoneto.classList.remove('soneto--desvanecido');
        }, this.#obtenerDuracionTransicion());
    }

    mostrarError(mensaje) {
        const estado = document.createElement('p');
        estado.className = 'soneto__estado';
        estado.setAttribute('role', 'alert');
        estado.textContent = mensaje;

        this.contenedorSoneto.replaceChildren(estado);
        this.contenedorSoneto.classList.remove('soneto--desvanecido');
    }

    #crearCabeceraSoneto({ titulo, autor }) {
        const cabecera = document.createElement('header');
        cabecera.className = 'soneto__cabecera';

        const elementoTitulo = document.createElement('h2');
        elementoTitulo.id = 'titulo-soneto';
        elementoTitulo.className = 'soneto__titulo';
        elementoTitulo.textContent = titulo;

        const elementoAutor = document.createElement('p');
        elementoAutor.className = 'soneto__autor';
        elementoAutor.textContent = `Por ${autor}`;

        cabecera.append(elementoTitulo, elementoAutor);
        return cabecera;
    }

    // Cada estrofa es un párrafo; cada verso, un span dentro de él
    #crearCuerpoSoneto({ estrofas }) {
        const cuerpo = document.createElement('div');
        cuerpo.className = 'soneto__cuerpo';

        const elementosEstrofa = estrofas.map((versos) => {
            const estrofa = document.createElement('p');
            estrofa.className = 'soneto__estrofa';

            const elementosVerso = versos.map((textoVerso) => {
                const verso = document.createElement('span');
                verso.className = 'soneto__verso';
                verso.textContent = textoVerso;
                return verso;
            });

            estrofa.append(...elementosVerso);
            return estrofa;
        });

        cuerpo.append(...elementosEstrofa);
        return cuerpo;
    }

    // CSSOM: lee la variable --duracion-transicion para que JS y CSS
    // usen siempre la misma duración (y 0 ms si se reducen animaciones)
    #obtenerDuracionTransicion() {
        const valor = getComputedStyle(document.documentElement)
            .getPropertyValue('--duracion-transicion')
            .trim();
        const cantidad = parseFloat(valor) || 0;
        return valor.endsWith('ms') ? cantidad : cantidad * 1000;
    }
}
