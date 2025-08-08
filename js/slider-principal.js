// ------------------------------------------------------------------
// Espera a que el DOM esté completamente cargado antes de ejecutar el código
// ------------------------------------------------------------------
// Esto asegura que todos los elementos del HTML (inputs, botones, etc.)
// ya existan en el documento cuando intentemos seleccionarlos.
// Si intentamos seleccionar algo antes de que el DOM esté listo, 
// obtendríamos "null" o errores.
document.addEventListener('DOMContentLoaded', () => {

    // ------------------------
    // 1) Selecciones y comprobaciones
    // ------------------------

    // Seleccionamos todos los inputs tipo radio que estén dentro del carrusel.
    // Estos radios son los "puntos" que controlan qué imagen se ve.
    // querySelectorAll devuelve un NodeList (similar a un array).
    const radios = document.querySelectorAll('.carrusel input[type="radio"]');

    // Si NO encontramos radios o el número de radios es 0, mostramos un error
    // en la consola y salimos de la función.
    // Esto evita que el resto del código se ejecute y lance errores por variables vacías.
    if (!radios || radios.length === 0) {
        console.error(
            'Slider: no se encontraron inputs radio (.carrusel input[type="radio"]). ' +
            'Revisa el HTML y la clase .carrusel.'
        );
        return; // Detenemos la ejecución de este bloque
    }

    // Seleccionamos las flechas de navegación:
    // btnIzq → flecha izquierda (retroceder)
    // btnDer → flecha derecha (avanzar)
    // IMPORTANTE: que las clases .flecha.izq y .flecha.der coincidan con el HTML.
    const btnIzq = document.querySelector('.flecha.izq');
    const btnDer = document.querySelector('.flecha.der');

    // ------------------------
    // 2) Inicializar índice actual (si algún radio ya está checked)
    // ------------------------

    // Buscamos si hay un radio marcado inicialmente usando findIndex:
    // - Array.from() convierte el NodeList en un array real.
    // - .findIndex(r => r.checked) devuelve el índice del primer radio marcado.
    //   Si ninguno está marcado, devuelve -1.
    let indice = Array.from(radios).findIndex(r => r.checked);

    // Si no había ningún radio marcado (-1), asumimos que empezamos en la primera imagen (índice 0).
    if (indice === -1) indice = 0;

    // Marcamos el radio correspondiente al índice inicial
    // Esto asegura que el estado visual y la variable estén sincronizados al iniciar.
    radios[indice].checked = true;


// ------------------------
// 3) Funciones auxiliares
// ------------------------

/**
 * Función que muestra una imagen específica del slider.
 * El slider funciona con inputs tipo radio: 
 *   → Cuando un radio está marcado (checked), el CSS desplaza las imágenes para mostrar la correspondiente.
 * Por eso, esta función se encarga de marcar el radio correcto.
 * 
 * @param {number} index - Índice de la imagen que queremos mostrar (ej: 0, 1, 2...).
 */
function mostrarImagen(index) {
    // Guardamos la cantidad total de radios (cada radio = un slide)
    const n = radios.length;

    // Normalizamos el índice para que siempre esté dentro del rango [0, n-1].
    // ((index % n) + n) % n funciona así:
    //   - Si 'index' es mayor que n-1, vuelve al principio.
    //   - Si 'index' es negativo, salta al final.
    // Ejemplo: si tenemos 3 imágenes y el índice es -1 → se convierte en 2.
    index = ((index % n) + n) % n;

    // Marcamos como seleccionado el radio correspondiente a este índice
    radios[index].checked = true;

    // Guardamos este índice en la variable global 'indice' para saber en qué imagen estamos ahora
    indice = index;
}

// Tiempo en milisegundos que queremos entre cada cambio automático de imagen.
// 3000 ms = 3 segundos
const AUTOPLAY_MS = 3000;

// Variable que guardará el ID del temporizador que usa setInterval()
// Esto nos permite luego detenerlo con clearInterval()
let autoPlay = null;

/**
 * Función que inicia el cambio automático de imágenes (autoplay).
 * El autoplay funciona con setInterval(), que ejecuta una acción cada cierto tiempo.
 */
function iniciarAutoPlay() {
    // Si ya existe un autoplay activo, lo detenemos antes de iniciar uno nuevo.
    // Esto evita que se creen múltiples intervalos que avancen las imágenes demasiado rápido.
    if (autoPlay) clearInterval(autoPlay);

    // Creamos un intervalo que cada AUTOPLAY_MS milisegundos avanza a la siguiente imagen
    autoPlay = setInterval(() => {
        // Avanzamos al siguiente índice (indice + 1)
        mostrarImagen(indice + 1);
    }, AUTOPLAY_MS);
}

/**
 * Función que reinicia el autoplay desde cero.
 * Se usa, por ejemplo, cuando el usuario cambia de imagen manualmente 
 * (con flechas o puntos) para que el temporizador no cambie la imagen 
 * justo después de que él lo haga.
 */
function reiniciarAutoPlay() {
    // Detenemos el autoplay actual, si lo hay
    if (autoPlay) clearInterval(autoPlay);

    // Volvemos a iniciarlo para que el contador de tiempo empiece desde cero
    iniciarAutoPlay();
}

// ------------------------
// 4) Eventos de las flechas (si existen)
// ------------------------

// Verificamos si el botón de la flecha derecha existe en el HTML
if (btnDer) {

    // Si existe, escuchamos el evento "click"
    btnDer.addEventListener('click', (e) => {

        e.preventDefault(); // Evita que el botón haga acciones por defecto (por ejemplo, enviar formulario si estuviera dentro de uno)

        mostrarImagen(indice + 1); // Muestra la imagen siguiente sumando 1 al índice actual

        reiniciarAutoPlay(); // Reinicia el autoplay para que no cambie de imagen inmediatamente después del clic
    });

} else {
    // Si no se encuentra el botón de flecha derecha, mostramos una advertencia en consola
    console.warn('Slider: no se encontró el botón derecha (.flecha.der). Verifica la clase en el HTML.');
}

// Verificamos si el botón de la flecha izquierda existe en el HTML
if (btnIzq) {

    // Si existe, escuchamos el evento "click"
    btnIzq.addEventListener('click', (e) => {

        e.preventDefault(); // Evita comportamiento por defecto

        mostrarImagen(indice - 1); // Muestra la imagen anterior restando 1 al índice actual

        reiniciarAutoPlay(); // Reinicia el autoplay
    });

} else {
    // Si no se encuentra el botón de flecha izquierda, mostramos advertencia en consola
    console.warn('Slider: no se encontró el botón izquierda (.flecha.izq). Verifica la clase en el HTML.');
}


// ------------------------
// 5) Sincronizar cuando el usuario pulse los puntos (radios)
// ------------------------
radios.forEach((radio, i) => {          //Recorremos cada uno de los inputs tipo "radio" (los puntos del slider).
    radio.addEventListener('change', () => {   //Escuchamos el evento "change": se activa cuando el usuario selecciona ese punto.
        if (radio.checked) {            //Comprobamos si ese radio está seleccionado (true).
            indice = i;                 //Guardamos en la variable "indice" el número del radio (posición de la imagen).
            reiniciarAutoPlay();        //Llamamos a la función que reinicia el autoplay para que no avance inmediatamente después de que el usuario haya hecho clic.
        }
    });
});


// ------------------------
// 6) Arrancamos autoplay al final
// ------------------------

// Llamamos a la función iniciarAutoPlay() para comenzar el cambio automático de imágenes
// desde el momento en que el script termina de configurarse.
// Es decir, después de preparar los eventos de flechas, indicadores, etc.,
// aquí ya le decimos "ok, empieza a pasar las imágenes solo".
iniciarAutoPlay();

// ------------------------
// 7) Limpieza (por si navegan fuera)
// ------------------------

// Escuchamos el evento 'beforeunload' en el objeto global "window" 
// (la ventana/pestaña actual del navegador).
// Este evento ocurre justo antes de cerrar la pestaña, recargar la página
// o navegar a otra URL.
window.addEventListener('beforeunload', () => {

    // Si existe el intervalo de autoPlay (control del cambio automático de imágenes),
    // lo detenemos con clearInterval para evitar que siga corriendo en segundo plano.
    // Esto ayuda a liberar memoria y prevenir errores.
    if (autoPlay) clearInterval(autoPlay);
});

// Cierre de la función principal que se ejecuta cuando el DOM ha cargado.
// Este "})" corresponde a la apertura de document.addEventListener("DOMContentLoaded", ...)
}); // DOMContentLoaded

