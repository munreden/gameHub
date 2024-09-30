document.addEventListener("DOMContentLoaded", async function() {
  const jsonFileName = 'https://munreden.github.io/gameHub/releasesCalendar/data.json'; 

  try {
    const gamesData = await readJson(jsonFileName);

    // Se obtienen las diferentes secciones de juegos
    const ubisoftPlusGames = gamesData.ubisoftPlus;
    const primeGamingGames = gamesData.primeGaming;
    const playStationPlusGames = gamesData.playStationPlus;

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let displayedMonth = currentMonth;
    let displayedYear = currentYear;

    // Máximo de 6 meses adelante
    const maxMonth = (currentMonth + 6) % 12;
    const maxYear = currentYear + Math.floor((currentMonth + 6) / 12);

    // Inicializar calendario
    initializeCalendar(displayedYear, displayedMonth);

    // Botones de navegación
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

    function canNavigatePrev() {
      return !(displayedYear === currentYear && displayedMonth === currentMonth);
    }

    function canNavigateNext() {
      return !(displayedYear === maxYear && displayedMonth === maxMonth);
    }

    function initializeCalendar(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

      document.getElementById("currentMonth").textContent = `${monthNames[month]} ${year}`;

      let calendarHTML = generateWeekDaysHTML();

      // Añadir los días vacíos hasta el primer día del mes
      calendarHTML += '<div class="week-row">';
      for (let i = 0; i < adjustedFirstDay; i++) {
        calendarHTML += `<span class="day">-</span>`;
      }

      // Crear los días del mes
      for (let i = 1; i <= daysInMonth; i++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarHTML += generateDayHTML(i, formattedDate, adjustedFirstDay);
      }

      // Completar la última semana del mes
      const totalDays = daysInMonth + adjustedFirstDay;
      calendarHTML += completeLastWeek(totalDays);
      calendarHTML += '</div>';

      document.getElementById("calendarDays").innerHTML = calendarHTML;

      // Después de renderizar el calendario, inicializamos el modal
      initializeModal(ubisoftPlusGames, primeGamingGames, playStationPlusGames, monthNames);

      // Actualizar botones de navegación
      updateNavigationButtons();
    }

    function updateNavigationButtons() {
      document.getElementById("prevMonth").disabled = !canNavigatePrev();
      document.getElementById("nextMonth").disabled = !canNavigateNext();
    }

    function generateWeekDaysHTML() {
      let html = '<div class="week-row">';
      weekDays.forEach(day => {
        html += `<span class="week-columns">${day}</span>`;
      });
      html += '</div>';
      return html;
    }

    function generateDayHTML(day, formattedDate, adjustedFirstDay) {
      // Filtrar juegos por fecha y que no estén ocultos para cada categoría
      const gamesForThisDay = [
        ...ubisoftPlusGames.filter(game => game.date === formattedDate && game.hidden === false),
        ...primeGamingGames.filter(game => game.date === formattedDate && game.hidden === false),
        ...playStationPlusGames.filter(game => game.date === formattedDate && game.hidden === false)
      ];
    
      const isToday = displayedYear === currentYear && displayedMonth === currentMonth && day === currentDate.getDate();
    
      let dayContent = `<span class="${isToday ? 'day-active' : 'day'}" data-date="${formattedDate}">${day}`;
    
      if (gamesForThisDay.length > 0) {
        dayContent += generateBadgeHTML(gamesForThisDay);
      }
    
      dayContent += `</span>`;
    
      if ((day + adjustedFirstDay) % 7 === 0) {
        dayContent += `</div><div class="week-row">`;
      }
      return dayContent;
    }

    function generateBadgeHTML(gamesForThisDay) {
      return `<span class="new-games-badge"></span><div><span class="new-games-title">${gamesForThisDay.length} ${gamesForThisDay.length > 1 ? 'juegos' : 'juego'} disponibles</span></div>`;
    }

    function completeLastWeek(totalDays) {
      const remainingSpaces = (7 - (totalDays % 7)) % 7;
      let html = '';
      for (let i = 0; i < remainingSpaces; i++) {
        html += `<span class="day">-</span>`;
      }
      return html;
    }

    function initializeModal(ubisoftPlusGames, primeGamingGames, playStationPlusGames, monthNames) {
      const modal = document.getElementById("gameModal");
      const modalBody = document.getElementById("modal-body");
      const modalTitle = document.getElementById("modal-title");
    
      document.querySelectorAll(".day, .day-active").forEach(day => {
        day.addEventListener("click", function() {
          const date = this.getAttribute("data-date");
    
          // Filtrar juegos por fecha y que no estén ocultos
          const gamesForThisDay = [
            ...ubisoftPlusGames.filter(game => game.date === date && game.hidden === false),
            ...primeGamingGames.filter(game => game.date === date && game.hidden === false),
            ...playStationPlusGames.filter(game => game.date === date && game.hidden === false)
          ];
    
          if (gamesForThisDay.length > 0) {
            const formattedDate = formatDateForModal(date, monthNames);
            modalTitle.textContent = `Juegos del ${formattedDate}`.toUpperCase();
    
            let modalContent = '<div class="games-container">';
    
            // Agrupar los juegos por tier
            const gamesByTier = groupGamesByTier(gamesForThisDay);
    
            // Generar contenido por cada tier
            Object.keys(gamesByTier).forEach(tier => {
              const tierTitle = getTierTitle(tier);
              modalContent += `<h3>${tierTitle}</h3>`;
              modalContent += generateGamesEntry(gamesByTier[tier]);
            });
    
            modalContent += '</div>';
    
            modalBody.innerHTML = modalContent;
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
          }
        });
      });
    }
    
    // Función para agrupar juegos por tier
    function groupGamesByTier(games) {
      return games.reduce((acc, game) => {
        const tier = game.tier || 'Sin categoría';  // Para manejar juegos sin categoría (si los hay)
        if (!acc[tier]) {
          acc[tier] = [];
        }
        acc[tier].push(game);
        return acc;
      }, {});
    }
    
    // Función para obtener el título del tier
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
          return tier;  // En caso de que no tenga tier
      }
    }
                
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

    function generatePlatformsIcons(platforms) {
      let platformsHTML = '<div class="platforms">';
      let hasPlayStation = false;
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
                hasPlayStation = true;
              }
              break;
            case "Ubisoft+":
              platformsHTML += `<img src="../utils/images/brands/cib-ubisoft.svg" alt="Ubisoft+">`;
              break;
            case "Amazon Games App":
              platformsHTML += `<img src="../utils/images/brands/cib-amazon.svg" alt="Amazon Games App">`;
              break;
            default:
              platformsHTML += `${platform}`;
          }
      });
    
      platformsHTML += '</div>';
      return platformsHTML;
    }

    function formatDateForModal(date, monthNames) {
      const dateObj = new Date(date);
      return `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;
    }

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