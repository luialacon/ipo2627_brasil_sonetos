// CONTROLADOR: recibe las peticiones de la vista, las traduce en acciones
// sobre el modelo y decide qué debe mostrar la vista.
export class Controlador {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;
    }

    async iniciar() {
        try {
            await this.modelo.iniciar();
        } catch (error) {
            console.error(error);
            this.vista.mostrarError('No se han podido cargar los sonetos. Abre la página desde un servidor local (por ejemplo, Live Server).');
            return;
        }

        const sonetoActual = this.modelo.obtenerSonetoActual();
        if (!sonetoActual) {
            this.vista.mostrarError('No hay sonetos disponibles.');
            return;
        }

        this.vista.rellenarDesplegable(this.modelo.obtenerSonetos(), sonetoActual.id);
        this.vista.mostrarSoneto(sonetoActual);

        this.vista.escucharDesplegable((id) => this.gestionarCambioSoneto(id));
        this.vista.escucharBuscador(
            (consulta) => this.gestionarBusqueda(consulta),
            (id) => this.gestionarCambioSoneto(id)
        );
    }

    gestionarBusqueda(consulta) {
        if (!consulta.trim()) {
            this.vista.ocultarResultados();
            return;
        }
        this.vista.mostrarResultados(this.modelo.buscarSonetos(consulta));
    }

    gestionarCambioSoneto(id) {
        const soneto = this.modelo.seleccionarSoneto(id);
        if (!soneto) return;

        this.vista.actualizarDesplegable(id);
        this.vista.mostrarSoneto(soneto);
    }
}
