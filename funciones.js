// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

    // Configuración de la API de TMDB

    const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Clave de acceso a la API
    const API_URL = 'https://api.themoviedb.org/3';      // URL base de la API
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';  // URL base para las imágenes 

    // Obtener referencias a los elementos del DOM que usaremos frecuentemente

    const campoBusqueda = document.getElementById('campoBusqueda');   
    const botonBuscar = document.getElementById('botonBuscar');       
    const divResultados = document.getElementById('resultados');       
    const botonesGenero = document.querySelectorAll('.boton-genero'); 

    // Muestra el mensaje inicial de bienvenida cuando se carga la página.
    divResultados.innerHTML = `
        <div class="mensaje-inicial">
            <h2>¡Bienvenido al Buscador de Películas!</h2>
            <p>Puedes buscar películas por nombre o seleccionar un género para ver películas aleatorias.</p>
        </div>
    `;

    /**
     * Obtiene películas aleatorias de un género específico.
     * Tutorial sobre async/await y fetch:
     * https://es.javascript.info/async-await
     */
    async function obtenerPeliculasPorGenero(generoId) {
        try {
            // Primera petición: obtener total de páginas
            const respuestaTotalPaginas = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&language=es-ES`
            );
            const datosTotalPaginas = await respuestaTotalPaginas.json();
            
            // Calcular página aleatoria (máximo 500 por limitación de la API)
            const paginaAleatoria = Math.floor(Math.random() * Math.min(datosTotalPaginas.total_pages, 500)) + 1;

            // Segunda petición: obtener películas de la página aleatoria
            const respuesta = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&page=${paginaAleatoria}&language=es-ES`
            );
            const datos = await respuesta.json();
            
            // Procesar y aleatorizar resultados
            const peliculasAleatorias = datos.results
                .sort(() => Math.random() - 0.5) // Mezcla aleatoria usando el algoritmo Fisher-Yates
                .slice(0, 10);                   // Tomar solo 10 películas
            
            mostrarPeliculas(peliculasAleatorias);
        } catch (error) {
            console.error('Error al obtener películas por género:', error);
            divResultados.innerHTML = '<p>Hubo un error al cargar las películas.</p>';
        }
    }

    /**
     * Busca películas por nombre o términos de búsqueda.
     * Tutorial sobre APIs y fetch en español:
     * https://www.youtube.com/watch?v=eLqMkQf4Qks&ab_channel=Garajedeideas%7CTech
     */
    async function buscarPeliculas(query) {
        try {
            const respuesta = await fetch(
                `${API_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=es-ES`
            );
            const datos = await respuesta.json();
            mostrarPeliculas(datos.results.slice(0, 10));
        } catch (error) {
            console.error('Error en la búsqueda de películas:', error);
            divResultados.innerHTML = '<p>Hubo un error en la búsqueda.</p>';
        }
    }

    // Muestra las películas en la interfaz de usuario.
    function mostrarPeliculas(peliculas) {
        divResultados.innerHTML = '';
        
        if (peliculas.length === 0) {
            divResultados.innerHTML = '<p>No se encontraron películas.</p>';
            return;
        }

        peliculas.forEach(pelicula => {
            const { title, poster_path, vote_average, overview, release_date } = pelicula;
            const divPelicula = document.createElement('div');
            divPelicula.className = 'carta';

            // Construir URL de la imagen con fallback
            const imagenUrl = poster_path 
                ? IMG_PATH + poster_path 
                : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

            divPelicula.innerHTML = `
                <img src="${imagenUrl}" alt="${title}">
                <div class="info">
                    <h3>${title}</h3>
                    <div class="valoracion">★ ${vote_average.toFixed(1)}</div>
                    <div class="fecha">${formatearFecha(release_date)}</div>
                    <p class="descripcion">${overview || 'Sin descripción disponible.'}</p>
                </div>
            `;

            divResultados.appendChild(divPelicula);
        });
    }

    
    // Formatea una fecha al estilo español.
    function formatearFecha(fecha) {
        if (!fecha) return 'Fecha no disponible';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }

    /**
     * Event Listeners para la interacción del usuario
     * enlace a tutorial: https://developer.mozilla.org/es/docs/Learn_web_development/Core/Scripting/Events
     * 
     */
    
    // Manejador para el botón de búsqueda
    botonBuscar.addEventListener('click', () => {
        const terminoBusqueda = campoBusqueda.value.trim();
        if (terminoBusqueda) {
            buscarPeliculas(terminoBusqueda);
        }
    });

    // Manejador para la tecla Enter en el campo de búsqueda
    campoBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const terminoBusqueda = campoBusqueda.value.trim();
            if (terminoBusqueda) {
                buscarPeliculas(terminoBusqueda);
            }
        }
    });

    // Manejadores para los botones de género
    botonesGenero.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Actualizar estado visual de los botones
            botonesGenero.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');
            
            // Obtener y buscar películas del género seleccionado
            const generoId = e.target.dataset.genero;
            obtenerPeliculasPorGenero(generoId);
        });
    });
}); 