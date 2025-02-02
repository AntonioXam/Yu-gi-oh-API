console.log('Yu-Gi-Oh! Card Database')

// Variables globales para los filtros
let activeTypeFilter = null;
let minAtk = null;
let minDef = null;

// Inicializar la función "init" cuando la página cargue completamente
document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('Inicializando aplicación...');
    // Cargar 10 cartas aleatorias al inicio
    buscarCartasAleatorias();
    initializeFilters();
}

// Retorna un entero aleatorio entre min (incluido) y max (excluido)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Función para obtener elementos aleatorios de un array
function obtenerElementosAleatorios(array, cantidad) {
    if (!array || array.length === 0) {
        console.log('Array vacío o nulo');
        return [];
    }
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(cantidad, array.length));
}

const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

// Inicializar los filtros
function initializeFilters() {
    // Botones de tipo
    const typeButtons = document.querySelectorAll('.filter-btn');
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Filtro seleccionado:', button.dataset.type);
            // Toggle active state
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                activeTypeFilter = null;
            } else {
                typeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeTypeFilter = button.dataset.type;
            }
            aplicarFiltros();
        });
    });

    // Filtros de estadísticas
    const minAtkInput = document.getElementById('minAtk');
    const minDefInput = document.getElementById('minDef');
    const applyStatFiltersBtn = document.getElementById('applyStatFilters');

    applyStatFiltersBtn.addEventListener('click', () => {
        minAtk = minAtkInput.value ? parseInt(minAtkInput.value) : null;
        minDef = minDefInput.value ? parseInt(minDefInput.value) : null;
        console.log('Aplicando filtros de estadísticas:', { minAtk, minDef });
        aplicarFiltros();
    });

    // Botón de limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    clearFiltersBtn.addEventListener('click', () => {
        console.log('Limpiando filtros');
        // Limpiar filtros de tipo
        typeButtons.forEach(btn => btn.classList.remove('active'));
        activeTypeFilter = null;

        // Limpiar filtros de estadísticas
        minAtkInput.value = '';
        minDefInput.value = '';
        minAtk = null;
        minDef = null;

        // Cargar 10 cartas aleatorias
        buscarCartasAleatorias();
    });
}

// Función para mostrar mensaje de carga
function mostrarCargando() {
    const container = document.getElementById('cardContainer');
    if (container) {
        container.innerHTML = '<p style="color: white; text-align: center;">Cargando cartas...</p>';
    }
}

// Función para mostrar mensaje de error
function mostrarError(mensaje) {
    const container = document.getElementById('cardContainer');
    if (container) {
        container.innerHTML = `<p style="color: white; text-align: center; background: rgba(255,0,0,0.2); padding: 1rem; border-radius: 4px;">${mensaje}</p>`;
    }
}

// Función para buscar cartas aleatorias
async function buscarCartasAleatorias() {
    try {
        mostrarCargando();
        console.log('Buscando cartas aleatorias...');
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('Cartas obtenidas:', data);
        
        if (data && data.data && Array.isArray(data.data)) {
            const cartasAleatorias = obtenerElementosAleatorios(data.data, 10);
            console.log('Cartas aleatorias seleccionadas:', cartasAleatorias);
            mostrarCartas(cartasAleatorias);
        } else {
            mostrarError('Error en el formato de datos recibidos');
            console.error('Formato de datos inesperado:', data);
        }
    } catch (error) {
        mostrarError('Error al cargar las cartas. Por favor, intenta de nuevo.');
        console.error('Error al buscar cartas aleatorias:', error);
    }
}

// Función para aplicar los filtros
async function aplicarFiltros() {
    try {
        mostrarCargando();
        let url = API_URL;
        const params = new URLSearchParams();

        // Aplicar filtro de tipo si está activo
        if (activeTypeFilter) {
            params.append('type', activeTypeFilter);
        }

        // Añadir parámetros si hay alguno
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Filtrar por ATK y DEF en el cliente
        let cartasFiltradas = data.data;
        
        if (minAtk !== null) {
            cartasFiltradas = cartasFiltradas.filter(carta => 
                carta.atk && parseInt(carta.atk) >= minAtk
            );
        }
        
        if (minDef !== null) {
            cartasFiltradas = cartasFiltradas.filter(carta => 
                carta.def && parseInt(carta.def) >= minDef
            );
        }

        if (cartasFiltradas.length === 0) {
            mostrarError('No se encontraron cartas con los filtros seleccionados');
            return;
        }

        // Seleccionar 10 cartas aleatorias que cumplan con los filtros
        const cartasAleatorias = obtenerElementosAleatorios(cartasFiltradas, 10);
        mostrarCartas(cartasAleatorias);

    } catch (error) {
        mostrarError('Error al aplicar los filtros. Por favor, intenta de nuevo.');
        console.error('Error al aplicar filtros:', error);
    }
}

// Función para mostrar las cartas
function mostrarCartas(cartas) {
    console.log('Mostrando cartas:', cartas);
    const container = document.getElementById('cardContainer');
    if (!container) {
        console.error('No se encontró el contenedor de cartas');
        return;
    }
    
    container.innerHTML = '';

    if (!cartas || cartas.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center;">No se encontraron cartas</p>';
        return;
    }

    cartas.forEach(carta => {
        try {
            const template = document.getElementById('template-card');
            if (!template) {
                console.error('No se encontró el template de carta');
                return;
            }
            
            const clone = template.content.cloneNode(true);

            // Imagen de la carta
            const img = clone.querySelector('.card-image img');
            if (carta.card_images && carta.card_images[0]) {
                img.src = carta.card_images[0].image_url;
                img.alt = carta.name;
            }

            // Nombre de la carta
            clone.querySelector('.card-name').textContent = carta.name;

            // Nivel/Rango (estrellas)
            const levelElement = clone.querySelector('.card-level');
            if (carta.level) {
                levelElement.textContent = '★'.repeat(carta.level);
            } else if (carta.rank) {
                levelElement.textContent = '★'.repeat(carta.rank);
            } else {
                levelElement.style.display = 'none';
            }

            // Tipo de carta
            clone.querySelector('.card-type').textContent = carta.type;

            // Estadísticas (ATK/DEF)
            const statsElement = clone.querySelector('.card-stats');
            if (carta.atk !== undefined && carta.def !== undefined) {
                statsElement.innerHTML = `
                    <span class="atk">ATK: ${carta.atk}</span>
                    <span class="def">DEF: ${carta.def}</span>
                `;
            } else {
                statsElement.style.display = 'none';
            }

            // Descripción
            clone.querySelector('.card-desc').textContent = carta.desc;

            container.appendChild(clone);
        } catch (error) {
            console.error('Error al procesar carta:', error, carta);
        }
    });
}

// Funcionalidad de búsqueda
const searchInput = document.getElementById('searchCard');
const searchButton = document.getElementById('searchButton');

async function buscarCartas(nombre = '') {
    try {
        let url = API_URL;
        if (nombre) {
            url += `?fname=${encodeURIComponent(nombre)}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        // Aplicar filtros actuales a los resultados de la búsqueda
        let cartasFiltradas = data.data;
        
        if (activeTypeFilter) {
            cartasFiltradas = cartasFiltradas.filter(carta => 
                carta.type === activeTypeFilter
            );
        }
        
        if (minAtk !== null) {
            cartasFiltradas = cartasFiltradas.filter(carta => 
                carta.atk && parseInt(carta.atk) >= minAtk
            );
        }
        
        if (minDef !== null) {
            cartasFiltradas = cartasFiltradas.filter(carta => 
                carta.def && parseInt(carta.def) >= minDef
            );
        }
        
        // Seleccionar 10 cartas aleatorias de los resultados filtrados
        const cartasAleatorias = obtenerElementosAleatorios(cartasFiltradas, 10);
        mostrarCartas(cartasAleatorias);
    } catch (error) {
        console.error('Error al buscar cartas:', error);
    }
}

// Evento de búsqueda al hacer click
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    buscarCartas(searchTerm);
});

// Búsqueda al presionar Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        buscarCartas(searchTerm);
    }
});
