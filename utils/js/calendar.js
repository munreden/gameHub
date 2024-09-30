// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async function() {
  // URL del archivo JSON que contiene los datos de los juegos
  const jsonFileName = 'https://munreden.github.io/gameHub/releasesCalendar/data.json'; 

  try {
    // Leer y procesar el archivo JSON
    const gamesData = await readJson(jsonFileName);

    // Secciones que agrupan los juegos por servicio
    const ubisoftPlusGames = gamesData.ubisoftPlus;
    const primeGamingGames = gamesData.primeGaming;
    const playStationPlusGames = gamesData.playStationPlus;

    // Nombres de los días de la semana y meses para el calendario
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const currentDate = new Date(); // Fecha actual
    const currentMonth = currentDate.getMonth(); // Mes actual (0-11)
    const currentYear = currentDate.getFullYear(); // Año actual
    
    let displayedMonth = currentMonth; // Mes a mostrar
    let displayedYear = currentYear; // Año a mostrar

    // Definir el mes máximo (hasta 6 meses después del actual)
    const maxMonth = (currentMonth + 6) % 12;
    const maxYear = currentYear + Math.floor((currentMonth + 6) / 12);

    // Inicializar el calendario al cargar la página
    initializeCalendar(displayedYear, displayedMonth);

    // Configurar eventos para los botones de navegación del calendario
    document.getElementById("prevMonth").addEventListener("click", function() {
      if (canNavigatePrev()) {
        displayedMonth--;
        if (displayedMonth < 0) {
          displayedMonth = 11;
          displayedYear--;
        }
        initializeCalendar(displayedYear, displayedMonth);
      }
    });

    document.getElementById("nextMonth").addEventListener("click", function() {
      if (canNavigateNext()) {
        displayedMonth++;
        if (displayedMonth > 11) {
          displayedMonth = 0;
          displayedYear++;
        }
        initializeCalendar(displayedYear, displayedMonth);
      }
    });

    /**
     * Determina si se puede navegar al mes anterior.
     * Evita navegar antes del mes actual.
     */
    function canNavigatePrev() {
      return !(displayedYear === currentYear && displayedMonth === currentMonth);
    }

    /**
     * Determina si se puede navegar al siguiente mes.
     * Evita navegar más allá de los 6 meses definidos.
     */
    function canNavigateNext() {
      return !(displayedYear === maxYear && displayedMonth === maxMonth);
    }

    /**
     * Inicializa y renderiza el calendario para el año y mes especificados.
     * @param {number} year - Año a mostrar.
     * @param {number} month - Mes a mostrar (0-11).
     */
    function initializeCalendar(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate(); // Número de días en el mes
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // Día de la semana del primer día del mes (0-6, domingo-sábado)
      const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Ajustar para comenzar en lunes (0)

      // Mostrar el mes y año actual
      document.getElementById("currentMonth").textContent = `${monthNames[month]} ${year}`;

      // Generar el HTML para los días de la semana
      let calendarHTML = generateWeekDaysHTML();

      // Añadir los espacios vacíos hasta el primer día del mes
      calendarHTML += '<div class="week-row">';
      for (let i = 0; i < adjustedFirstDay; i++) {
        calendarHTML += `<span class="day">-</span>`;
      }

      // Crear los días del mes
      for (let i = 1; i <= daysInMonth; i++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarHTML += generateDayHTML(i, formattedDate, adjustedFirstDay);
      }

      // Completar la última fila del mes con días vacíos si es necesario
      const totalDays = daysInMonth + adjustedFirstDay;
      calendarHTML += completeLastWeek(totalDays);
      calendarHTML += '</div>';

      // Insertar el calendario en el DOM
      document.getElementById("calendarDays").innerHTML = calendarHTML;

      // Inicializar el modal después de renderizar el calendario
      initializeModal(ubisoftPlusGames, primeGamingGames, playStationPlusGames, monthNames);

      // Actualizar los botones de navegación (habilitar/deshabilitar)
      updateNavigationButtons();
    }

    /**
     * Actualiza el estado (habilitado/deshabilitado) de los botones de navegación del calendario.
     */
    function updateNavigationButtons() {
      document.getElementById("prevMonth").disabled = !canNavigatePrev();
      document.getElementById("nextMonth").disabled = !canNavigateNext();
    }

    /**
     * Genera el HTML para los días de la semana.
     * @returns {string} HTML de los días de la semana.
     */
    function generateWeekDaysHTML() {
      let html = '<div class="week-row">';
      weekDays.forEach(day => {
        html += `<span class="week-columns">${day}</span>`;
      });
      html += '</div>';
      return html;
    }

    /**
     * Genera el HTML para un día específico del calendario.
     * @param {number} day - Día del mes.
     * @param {string} formattedDate - Fecha formateada (YYYY-MM-DD).
     * @param {number} adjustedFirstDay - Día de la semana ajustado para comenzar en lunes.
     * @returns {string} HTML del día.
     */
    function generateDayHTML(day, formattedDate, adjustedFirstDay) {
      // Filtrar juegos disponibles para ese día en todas las categorías
      const gamesForThisDay = [
        ...ubisoftPlusGames.filter(game => game.date === formattedDate && game.hidden === false),
        ...primeGamingGames.filter(game => game.date === formattedDate && game.hidden === false),
        ...playStationPlusGames.filter(game => game.date === formattedDate && game.hidden === false)
      ];

      // Verificar si es el día actual
      const isToday = displayedYear === currentYear && displayedMonth === currentMonth && day === currentDate.getDate();

      // Iniciar el contenido del día
      let dayContent = `<span class="${isToday ? 'day-active' : 'day'}" data-date="${formattedDate}">${day}`;

      // Si hay juegos para ese día, agregar una insignia
      if (gamesForThisDay.length > 0) {
        dayContent += generateBadgeHTML(gamesForThisDay);
      }

      dayContent += `</span>`;

      // Añadir una nueva fila después de cada 7 días
      if ((day + adjustedFirstDay) % 7 === 0) {
        dayContent += `</div><div class="week-row">`;
      }
      return dayContent;
    }

    /**
     * Genera el HTML para la insignia que muestra el número de juegos disponibles por tier.
     * @param {Array} gamesForThisDay - Array de juegos disponibles para el día.
     * @returns {string} HTML de la insignia con cuentas por tier.
     */
    function generateBadgeHTML(gamesForThisDay) {
      // Agrupar los juegos por tier
      const gamesByTier = gamesForThisDay.reduce((acc, game) => {
        const tier = game.tier || 'Sin categoría'; // Manejar juegos sin tier
        if (!acc[tier]) {
          acc[tier] = 0;
        }
        acc[tier]++;
        return acc;
      }, {});

      // Crear un array de strings con el formato "X juegos Tier"
      const tierCounts = Object.keys(gamesByTier).map(tier => {
        const count = gamesByTier[tier];
        return `${count} juego${count > 1 ? 's' : ''} ${tier}`;
      });

      // Unir los strings con una coma y un espacio
      const badgeText = tierCounts.join('<br>');

      // Retornar el HTML de la insignia con el texto formateado
      return `<span class="new-games-badge"></span><div><span class="new-games-title">${badgeText}</span></div>`;
    }

    /**
     * Completa la última fila del calendario con días vacíos si es necesario.
     * @param {number} totalDays - Total de días ya añadidos al calendario.
     * @returns {string} HTML de los días vacíos.
     */
    function completeLastWeek(totalDays) {
      const remainingSpaces = (7 - (totalDays % 7)) % 7;
      let html = '';
      for (let i = 0; i < remainingSpaces; i++) {
        html += `<span class="day">-</span>`;
      }
      return html;
    }

    /**
     * Inicializa el modal para mostrar los juegos de un día específico.
     * @param {Array} ubisoftPlusGames - Juegos de Ubisoft Plus.
     * @param {Array} primeGamingGames - Juegos de Prime Gaming.
     * @param {Array} playStationPlusGames - Juegos de PlayStation Plus.
     * @param {Array} monthNames - Nombres de los meses.
     */
    function initializeModal(ubisoftPlusGames, primeGamingGames, playStationPlusGames, monthNames) {
      const modal = document.getElementById("gameModal"); // Referencia al modal
      const modalBody = document.getElementById("modal-body"); // Referencia al cuerpo del modal
      const modalTitle = document.getElementById("modal-title"); // Referencia al título del modal

      // Agregar evento de clic a cada día en el calendario
      document.querySelectorAll(".day, .day-active").forEach(day => {
        day.addEventListener("click", function() {
          const date = this.getAttribute("data-date"); // Obtener la fecha del día clicado

          // Filtrar juegos disponibles para esa fecha en todas las categorías
          const gamesForThisDay = [
            ...ubisoftPlusGames.filter(game => game.date === date && game.hidden === false),
            ...primeGamingGames.filter(game => game.date === date && game.hidden === false),
            ...playStationPlusGames.filter(game => game.date === date && game.hidden === false)
          ];

          if (gamesForThisDay.length > 0) {
            const formattedDate = formatDateForModal(date, monthNames); // Formatear la fecha
            modalTitle.textContent = `Juegos del ${formattedDate}`.toUpperCase(); // Actualizar el título del modal

            let modalContent = '<div class="games-container">'; // Iniciar el contenedor de juegos

            // Agrupar juegos por tier (categoría)
            const gamesByTier = groupGamesByTier(gamesForThisDay);

            // Generar contenido para cada tier con el conteo de juegos
            Object.keys(gamesByTier).forEach(tier => {
              const tierCount = gamesByTier[tier].length; // Contar los juegos en el tier
              const tierTitle = `${getTierTitle(tier)} (${tierCount})`; // Crear el título del tier con el conteo
              modalContent += `<h3>${tierTitle}</h3>`; // Agregar el título del tier al contenido
              modalContent += generateGamesEntry(gamesByTier[tier]); // Agregar los juegos del tier
            });

            modalContent += '</div>'; // Cerrar el contenedor de juegos

            // Insertar el contenido en el cuerpo del modal
            modalBody.innerHTML = modalContent;

            // Mostrar el modal
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
          }
        });
      });
    }

    /**
     * Agrupa los juegos por su "tier" (categoría).
     * @param {Array} games - Array de juegos.
     * @returns {Object} Objeto donde las claves son los tiers y los valores son arrays de juegos.
     */
    function groupGamesByTier(games) {
      return games.reduce((acc, game) => {
        const tier = game.tier || 'Sin categoría';  // Manejar juegos sin tier
        if (!acc[tier]) {
          acc[tier] = [];
        }
        acc[tier].push(game);
        return acc;
      }, {});
    }

    /**
     * Obtiene el título legible para un tier específico.
     * @param {string} tier - Nombre del tier.
     * @returns {string} Título legible del tier.
     */
    function getTierTitle(tier) {
      switch (tier) {
        case 'Essential':
          return 'PlayStation Plus Essential';
        case 'Extra':
          return 'PlayStation Plus Extra';
        case 'Premium':
          return 'PlayStation Plus Premium';
        case 'Amazon Prime Gaming':
          return 'Amazon Prime Gaming';
        default:
          return tier;  // En caso de que no tenga tier o sea "Sin categoría"
      }
    }
                
    /**
     * Genera el HTML para mostrar los juegos de un tier específico.
     * @param {Array} games - Array de juegos para un tier.
     * @returns {string} HTML de los juegos.
     */
    function generateGamesEntry(games) {
      return `
        <div class="games-entry">
          ${games.map(game => `
            <div class="game-entry">
              <a href="${game.url}" target="_blank">
                ${generatePlatformsIcons(game.platforms)}
                <img class="cover" src="${game.cover}" alt="${game.name}">
                <p class="game-name">${game.name}</p>
              </a>
            </div>
          `).join('')}
        </div>`;
    }

    /**
     * Genera el HTML para los íconos de las plataformas de un juego.
     * @param {Array} platforms - Array de plataformas.
     * @returns {string} HTML de los íconos de plataformas.
     */
    function generatePlatformsIcons(platforms) {
      let platformsHTML = '<div class="platforms">';
      let hasPlayStation = false; // Variable para evitar duplicados de PlayStation

      platforms.forEach(platform => {
        switch (platform) {
          case "Epic Games Store":
            platformsHTML += `<img src="../utils/images/brands/cib-epic-games.svg" alt="Epic Games">`;
            break;
          case "GOG":
            platformsHTML += `<img src="../utils/images/brands/cib-gog-com.svg" alt="GOG">`;
            break;
          case "PS5":
          case "PS4":
            if (!hasPlayStation) {
              platformsHTML += `<img src="../utils/images/brands/cib-playstation.svg" alt="PlayStation">`;
              hasPlayStation = true; // Marcar que ya se ha añadido PlayStation
            }
            break;
          case "Ubisoft+":
            platformsHTML += `<img src="../utils/images/brands/cib-ubisoft.svg" alt="Ubisoft+">`;
            break;
          case "Amazon Games App":
            platformsHTML += `<img src="../utils/images/brands/cib-amazon.svg" alt="Amazon Games App">`;
            break;
          default:
            platformsHTML += `${platform}`; // Mostrar el nombre de la plataforma si no está en los casos anteriores
        }
      });

      platformsHTML += '</div>';
      return platformsHTML;
    }

    /**
     * Formatea una fecha en el formato "D de Mes".
     * @param {string} date - Fecha en formato YYYY-MM-DD.
     * @param {Array} monthNames - Array de nombres de meses.
     * @returns {string} Fecha formateada.
     */
    function formatDateForModal(date, monthNames) {
      const dateObj = new Date(date);
      return `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;
    }

    /**
     * Lee un archivo JSON desde una URL.
     * @param {string} jsonFileName - URL del archivo JSON.
     * @returns {Promise<Object>} Promesa que resuelve con el contenido JSON.
     */
    async function readJson(jsonFileName) {
      try {
        const response = await fetch(jsonFileName);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('There was a problem during the request:', error);
      }
    }
  } catch (error) {
    console.error('Error while processing JSON data:', error);
  }
});