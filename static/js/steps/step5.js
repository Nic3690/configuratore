import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep5Completion } from '../utils.js';
import { vaiAlleProposte } from './step6.js'


export function initStep5Listeners() {
  $('#btn-torna-step4').on('click', function(e) {
    e.preventDefault();
    
    $("#step5-controllo").fadeOut(300, function() {
      if (configurazione.tensioneSelezionato === '220V') {
        $("#step3-temperatura-potenza").fadeIn(300);
        updateProgressBar(3);
      } else {
        $("#step4-alimentazione").fadeIn(300);
        updateProgressBar(4);
      }
    });
  });
  
  $('#btn-continua-step5').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.dimmerSelezionato) {
      alert("Seleziona un'opzione dimmer prima di continuare");
      return;
    }
    
    if (!configurazione.tipoAlimentazioneCavo) {
      alert("Seleziona il tipo di alimentazione cavo prima di continuare");
      return;
    }
    
    if (!configurazione.uscitaCavoSelezionata) {
      alert("Seleziona l'uscita cavo prima di continuare");
      return;
    }
    $("#step5-controllo").fadeOut(300, function() {
      vaiAlleProposte();
    });
  });
}

// Funzione per caricare i dimmer compatibili con la strip LED selezionata
function caricaDimmerCompatibili() {
  // Contenitore iniziale per il dimmer
  $('#dimmer-container').empty().html(`
    <h3 class="mb-3">Dimmer</h3>
    <div class="text-center" id="dimmer-loading">
      <div class="spinner-border" role="status"></div>
      <p class="mt-3">Caricamento opzioni dimmer compatibili...</p>
    </div>
  `);
  
  // Calcoliamo la potenza totale del sistema
  let potenzaTotale = calcolaPotenzaTotaleStrip();

  // Per strip LED 220V, mostriamo direttamente il dimmer CTR130
  if (configurazione.tensioneSelezionato === '220V') {
    const dimmerHtml = `
      <h3 class="mb-3">Dimmer</h3>
      <div class="alert alert-info mb-3">
        <strong>Nota:</strong> Per strip LED 220V è disponibile solo il dimmer CTR130 (dimmerabile TRIAC tramite pulsante e sistema TUYA).
      </div>
      <div class="row">
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-card" data-dimmer="DIMMERABILE_TRIAC_PULSANTE_TUYA_220V" data-codice="CTR130" data-potenza-max="200">
            <img src="/static/img/dimmer/dimmer_pulsante.jpg" class="card-img-top" alt="CTR130" style="height: 180px; object-fit: cover;" onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
            <div class="card-body text-center">
              <h5 class="card-title">CTR130 - Dimmer a pulsante</h5>
              <p class="card-text small text-muted">Dimmerabile TRIAC tramite pulsante e compatibile con sistema TUYA</p>
              <p class="card-text small text-danger">Potenza massima: 200W</p>
              ${potenzaTotale > 200 ? '<p class="card-text small text-danger">Attenzione: Potenza richiesta superiore al limite massimo!</p>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    $('#dimmer-container').html(dimmerHtml);
    // Se la potenza totale è inferiore alla potenza massima, seleziona automaticamente
    if (potenzaTotale <= 200) {
      $('.dimmer-card').addClass('selected');
      configurazione.dimmerSelezionato = "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V";
      configurazione.dimmerCodice = "CTR130";
    }
    
    bindDimmerCardListeners();
    checkStep5Completion();
    return;
  }

  // Se non c'è strip LED, mostra solo "NESSUN_DIMMER"
  if (!configurazione.stripLedSelezionata || 
      configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP') {
    
    const dimmerHtml = `
      <h3 class="mb-3">Dimmer</h3>
      <div class="row">
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
            <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 180px;">
              <h5 class="card-title">Nessun dimmer</h5>
              <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    $('#dimmer-container').html(dimmerHtml);
    $('.dimmer-card').addClass('selected');
    configurazione.dimmerSelezionato = "NESSUN_DIMMER";
    configurazione.dimmerCodice = "";
    
    bindDimmerCardListeners();
    checkStep5Completion();
    return;
  }

  $('#dimmer-loading').show();
  // Definizione delle potenze massime per ogni dimmer in base al PDF fornito
  const potenzeMassimeDimmer = {
    "DIMMER_TOUCH_SU_PROFILO_PRFTSW01": 120,
    "DIMMER_TOUCH_SU_PROFILO_PRFTDIMM01": 120,
    "DIMMER_TOUCH_SU_PROFILO_PRFIRSW01": 192,
    "DIMMER_TOUCH_SU_PROFILO_PRFIRDIMM01": 192,
    "DIMMER_PWM_CON_TELECOMANDO_RGB_RGBW": 576,
    "DIMMER_PWM_CON_TELECOMANDO_MONOCOLORE": 144,
    "DIMMER_PWM_CON_TELECOMANDO_TUNABLE_WHITE": 288,
    "DIMMER_PWM_CON_PULSANTE_24V_MONOCOLORE": 288,
    "DIMMER_PWM_CON_PULSANTE_48V_MONOCOLORE": 336,
    "DIMMERABILE_PWM_CON_SISTEMA_TUYA_MONOCOLORE": 144,
    "DIMMERABILE_PWM_CON_SISTEMA_TUYA_TUNABLE_WHITE": 144,
    "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGB": 144,
    "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGBW": 144,
    "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V": 200,
    "DIMMER_PWM_DA_SCATOLA_CON_PULSANTE_NA": 192,
    "NESSUN_DIMMER": 9999 // Valore alto per "nessun dimmer"
  };

  $.ajax({
    url: `/get_opzioni_dimmerazione/${configurazione.stripLedSelezionata}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        let opzioniDimmer = response.opzioni || [];

        if (!opzioniDimmer.includes('NESSUN_DIMMER')) {
          opzioniDimmer.push('NESSUN_DIMMER');
        }

        // Filtra i dimmer in base alla potenza totale richiesta
        const isRGBStrip = [
          "STRIP_24V_RGB_COB_IP20",
          "STRIP_24V_RGB_COB_IP66",
          "STRIP_24V_RGB_SMD_IP20",
          "STRIP_24V_RGB_SMD_IP66"
        ].includes(configurazione.stripLedSelezionata);

        if (isRGBStrip && configurazione.temperaturaColoreSelezionata) {
          // Filtra i dimmer TUYA in base alla temperatura selezionata
          opzioniDimmer = opzioniDimmer.filter(dimmer => {
            // Se è un dimmer TUYA RGB/RGBW, controlla la compatibilità
            if (dimmer === "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGB") {
              return configurazione.temperaturaColoreSelezionata === 'RGB';
            }
            if (dimmer === "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGBW") {
              return configurazione.temperaturaColoreSelezionata === 'RGBW';
            }
            // Mantieni tutti gli altri dimmer
            return true;
          });
        }

        // Filtra i dimmer in base alla potenza totale richiesta
        opzioniDimmer = opzioniDimmer.filter(dimmer => {
          const potenzaMassima = potenzeMassimeDimmer[dimmer] || 0;
          return potenzaMassima >= potenzaTotale;
        });

        const dimmerCategories = {
          "TOUCH_SU_PROFILO": [
            "DIMMER_TOUCH_SU_PROFILO_PRFTSW01",
            "DIMMER_TOUCH_SU_PROFILO_PRFTDIMM01", 
            "DIMMER_TOUCH_SU_PROFILO_PRFIRSW01", 
            "DIMMER_TOUCH_SU_PROFILO_PRFIRDIMM01"
          ],
          "CON_TELECOMANDO": [
            "DIMMER_PWM_CON_TELECOMANDO_RGB_RGBW",
            "DIMMER_PWM_CON_TELECOMANDO_MONOCOLORE",
            "DIMMER_PWM_CON_TELECOMANDO_TUNABLE_WHITE"
          ],
          "CON_PULSANTE": [
            "DIMMER_PWM_CON_PULSANTE_24V_MONOCOLORE",
            "DIMMER_PWM_CON_PULSANTE_48V_MONOCOLORE",
            "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V"
          ],
          "SISTEMA_TUYA": [
            "DIMMERABILE_PWM_CON_SISTEMA_TUYA_MONOCOLORE",
            "DIMMERABILE_PWM_CON_SISTEMA_TUYA_TUNABLE_WHITE",
            "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGB",
            "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGBW"
          ],
          "DA_SCATOLA": [
            "DIMMER_PWM_DA_SCATOLA_CON_PULSANTE_NA"
          ],
          "NESSUN_DIMMER": [
            "NESSUN_DIMMER"
          ]
        };

        const categorieDisponibili = {};

        Object.keys(dimmerCategories).forEach(categoria => {
          const dimmerInCategoria = dimmerCategories[categoria].filter(d => opzioniDimmer.includes(d));
          if (dimmerInCategoria.length > 0) {
            categorieDisponibili[categoria] = dimmerInCategoria;
          }
        });
        const dimmerCategoryImages = {
          "TOUCH_SU_PROFILO": "/static/img/dimmer/touch_su_profilo.jpg",
          "CON_TELECOMANDO": "/static/img/dimmer/con_telecomando.jpg",
          "CON_PULSANTE": "/static/img/dimmer/dimmer_pulsante.jpg", 
          "SISTEMA_TUYA": "/static/img/dimmer/centralina_tuya.jpg",
          "DA_SCATOLA": "/static/img/dimmer/dimmer_scatola.jpg",
          "NESSUN_DIMMER": "/static/img/placeholder_logo.jpg"
        };

        const categoryDisplayNames = {
          "TOUCH_SU_PROFILO": "Touch su profilo",
          "CON_TELECOMANDO": "Con telecomando",
          "CON_PULSANTE": "Con pulsante",
          "SISTEMA_TUYA": "Sistema Tuya",
          "DA_SCATOLA": "Da scatola",
          "NESSUN_DIMMER": "Nessun dimmer"
        };

        const dimmerImages = {
          "DIMMER_TOUCH_SU_PROFILO_PRFTSW01": "/static/img/dimmer/touch_su_profilo.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFTDIMM01": "/static/img/dimmer/touch_su_profilo_dim.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFIRSW01": "/static/img/dimmer/ir_su_profilo.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFIRDIMM01": "/static/img/dimmer/ir_su_profilo_dim.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_RGB_RGBW": "/static/img/dimmer/con_telecomando_rgb.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_MONOCOLORE": "/static/img/dimmer/con_telecomando.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_TUNABLE_WHITE": "/static/img/dimmer/con_telecomando_cct.jpg",
          "DIMMER_PWM_CON_PULSANTE_24V_MONOCOLORE": "/static/img/dimmer/dimmer_pulsante.jpg",
          "DIMMER_PWM_CON_PULSANTE_48V_MONOCOLORE": "/static/img/dimmer/dimmer_pulsante_48v.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_MONOCOLORE": "/static/img/dimmer/centralina_tuya.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_TUNABLE_WHITE": "/static/img/dimmer/centralina_tuya_cct.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGB": "/static/img/dimmer/centralina_tuya_rgb.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGBW": "/static/img/dimmer/centralina_tuya_rgbw.jpg",
          "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V": "/static/img/dimmer/dimmer_triac_220v.jpg",
          "DIMMER_PWM_DA_SCATOLA_CON_PULSANTE_NA": "/static/img/dimmer/dimmer_scatola.jpg",
          "NESSUN_DIMMER": "/static/img/placeholder_logo.jpg"
        };

        window.dimmerData = {
          categories: categorieDisponibili,
          nomiDimmer: response.nomiDimmer || {},
          codiciDimmer: response.codiciDimmer || {},
          spaziNonIlluminati: response.spaziNonIlluminati || {},
          potenzeMassime: potenzeMassimeDimmer || {}
        };

        // Se non ci sono categorie disponibili oltre a "NESSUN_DIMMER", mostra solo quest'ultimo
        if (Object.keys(categorieDisponibili).length === 1 && Object.keys(categorieDisponibili)[0] === 'NESSUN_DIMMER') {
          const dimmerHtml = `
            <h3 class="mb-3">Dimmer</h3>
            <div class="row">
              <div class="col-md-4 mb-3 dimmer-column">
                <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
                  <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 180px;">
                    <h5 class="card-title">Nessun dimmer</h5>
                    <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          $('#dimmer-container').html(dimmerHtml);
          $('.dimmer-card').addClass('selected');
          configurazione.dimmerSelezionato = "NESSUN_DIMMER";
          configurazione.dimmerCodice = "";
          
          bindDimmerCardListeners();
          checkStep5Completion();
          return;
        }

        let dimmerHtml = `<h3 class="mb-3">Dimmer</h3>`;

        dimmerHtml += `
          <div class="mb-4">
            <h5 class="mb-3">1. Seleziona la categoria di dimmer</h5>
            <div class="row" id="dimmer-categories-container">
        `;

        Object.keys(categorieDisponibili).forEach(categoria => {
          if (categoria === 'NESSUN_DIMMER') {
            dimmerHtml += `
              <div class="col-md-4 mb-3 dimmer-category-column">
                <div class="card option-card dimmer-category-card" data-categoria="${categoria}">
                  <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 150px;">
                    <h5 class="card-title">${categoryDisplayNames[categoria]}</h5>
                    <p class="card-text small text-muted">${categorieDisponibili[categoria].length} ${categorieDisponibili[categoria].length === 1 ? 'opzione disponibile' : 'opzioni disponibili'}</p>
                  </div>
                </div>
              </div>
            `;
          } else {
            dimmerHtml += `
              <div class="col-md-4 mb-3 dimmer-category-column">
                <div class="card option-card dimmer-category-card" data-categoria="${categoria}">
                  <img src="${dimmerCategoryImages[categoria]}" class="card-img-top" alt="${categoryDisplayNames[categoria]}" 
                       style="height: 150px; object-fit: cover;" 
                       onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='150px'">
                  <div class="card-body text-center">
                    <h5 class="card-title">${categoryDisplayNames[categoria]}</h5>
                    <p class="card-text small text-muted">${categorieDisponibili[categoria].length} ${categorieDisponibili[categoria].length === 1 ? 'opzione disponibile' : 'opzioni disponibili'}</p>
                  </div>
                </div>
              </div>
            `;
          }
        });
        
        dimmerHtml += `
            </div>
          </div>
        `;

        dimmerHtml += `
          <div id="dimmer-specific-section" style="display: none;">
            <h5 class="mb-3">2. Seleziona il modello specifico <span id="categoria-selezionata-label"></span></h5>
            <div class="row" id="dimmer-specific-container"></div>
          </div>
          
          <div id="dimmer-warning" class="alert alert-warning mt-3" style="display: none;">
            <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch/IR su profilo ci sarà uno spazio non illuminato di 50mm.
          </div>
        `;

        $('#dimmer-container').html(dimmerHtml);
        $('#dimmer-loading').hide();
        
        $('.dimmer-category-card').on('click', function() {
          $('.dimmer-category-card').removeClass('selected');
          $(this).addClass('selected');
          
          const categoria = $(this).data('categoria');

          if (categoria === 'NESSUN_DIMMER') {
            $('#dimmer-specific-section').hide();

            configurazione.dimmerSelezionato = "NESSUN_DIMMER";
            configurazione.dimmerCodice = "";

            $('#dimmer-warning').hide();
            checkStep5Completion();
            return;
          }

          $('#categoria-selezionata-label').text(`di ${categoryDisplayNames[categoria]}`);
          mostraDimmerSpecifici(categoria, dimmerImages, response, potenzaTotale);
        });

        // Auto-selezione se c'è una sola categoria
        if (Object.keys(categorieDisponibili).length === 1) {
          const unicaCategoria = Object.keys(categorieDisponibili)[0];

          $(`.dimmer-category-card[data-categoria="${unicaCategoria}"]`).addClass('selected');
          $('#categoria-selezionata-label').text(`di ${categoryDisplayNames[unicaCategoria]}`);

          if (unicaCategoria === 'NESSUN_DIMMER') {
            configurazione.dimmerSelezionato = "NESSUN_DIMMER";
            configurazione.dimmerCodice = "";
            checkStep5Completion();
          } else {
            mostraDimmerSpecifici(unicaCategoria, dimmerImages, response, potenzaTotale);
          }

          // Se c'è un solo dimmer, selezionalo automaticamente
          if (categorieDisponibili[unicaCategoria].length === 1) {
            setTimeout(function() {
              const unicoDimmer = categorieDisponibili[unicaCategoria][0];
              $(`.dimmer-specific-card[data-dimmer="${unicoDimmer}"]`).click();
            }, 200);
          }
        }
        
        checkStep5Completion();
      } else {
        console.error("Errore nel caricamento dei dimmer compatibili:", response.message);
        const dimmerHtml = `
          <h3 class="mb-3">Dimmer</h3>
          <div class="row">
            <div class="col-md-4 mb-3 dimmer-column">
              <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
                <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 180px;">
                  <h5 class="card-title">Nessun dimmer</h5>
                  <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
                </div>
              </div>
            </div>
          </div>`;
        
        $('#dimmer-container').html(dimmerHtml);

        $('.dimmer-card').addClass('selected');
        configurazione.dimmerSelezionato = "NESSUN_DIMMER";
        configurazione.dimmerCodice = "";
        
        bindDimmerCardListeners();
        checkStep5Completion();
      }
    },
    error: function(error) {
      console.error("Errore nella chiamata API dei dimmer:", error);
      const dimmerHtml = `
      <h3 class="mb-3">Dimmer</h3>
      <div class="row">
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
            <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 180px;">
              <h5 class="card-title">Nessun dimmer</h5>
              <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
            </div>
          </div>
        </div>
      </div>`;
      
      $('#dimmer-container').html(dimmerHtml);

      $('.dimmer-card').addClass('selected');
      configurazione.dimmerSelezionato = "NESSUN_DIMMER";
      configurazione.dimmerCodice = "";
      
      $('#dimmer-loading').hide();
      bindDimmerCardListeners();
      checkStep5Completion();
    }
  });
}

/**
 * Calcola la potenza totale richiesta dalla strip LED
 * @returns {number} - Potenza totale in Watt
 */
function calcolaPotenzaTotaleStrip() {
  // Se non c'è una strip LED o non c'è una potenza selezionata, restituisci 0
  if (configurazione.stripLedSelezionata === 'NO_STRIP' || 
      !configurazione.potenzaSelezionata) {
    return 0;
  }

  // Estrai il valore numerico della potenza dalla stringa (es. "14W/m" -> 14)
  let potenzaPerMetro = 0;
  const potenzaMatch = configurazione.potenzaSelezionata.match(/(\d+(\.\d+)?)/);
  if (potenzaMatch && potenzaMatch[1]) {
    potenzaPerMetro = parseFloat(potenzaMatch[1]);
  }

  // Calcola la lunghezza in metri
  let lunghezzaMetri = 0;
  if (configurazione.lunghezzaRichiesta) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaRichiesta) / 1000;
  } else if (configurazione.lunghezzaSelezionata) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaSelezionata) / 1000;
  }

  // Calcola la potenza totale con un margine di sicurezza del 20%
  // Questo segue la stessa logica usata per calcolare la potenza dell'alimentatore
  const potenzaTotale = potenzaPerMetro * lunghezzaMetri * 1.2;
  
  return potenzaTotale;
}

/**
 * Mostra i dimmer specifici per una categoria selezionata
 * @param {string} categoria - La categoria di dimmer selezionata
 * @param {object} dimmerImages - Oggetto che mappa i dimmer alle immagini
 * @param {object} response - Risposta dall'API con le opzioni del dimmer
 * @param {number} potenzaTotale - Potenza totale richiesta dal sistema
 */
function mostraDimmerSpecifici(categoria, dimmerImages, response, potenzaTotale) {
  const dimmerData = window.dimmerData;
  const dimmerInCategoria = dimmerData.categories[categoria];
  const specificContainer = $('#dimmer-specific-container');
  specificContainer.empty();

  if (categoria === 'NESSUN_DIMMER') {
    return;
  } else {
    dimmerInCategoria.forEach(dimmer => {
      const dimmerText = dimmerData.nomiDimmer[dimmer] || dimmer;
      const dimmerCode = dimmerData.codiciDimmer[dimmer] || "";
      const spazioNonIlluminato = dimmerData.spaziNonIlluminati[dimmer];
      const potenzaMassima = dimmerData.potenzeMassime[dimmer] || 0;
      const imgPath = dimmerImages[dimmer] || "/static/img/placeholder_logo.jpg";
      
      // Verifica se la potenza totale richiesta supera la potenza massima supportata
      const potenzaEccessiva = potenzaTotale > potenzaMassima;
      
      specificContainer.append(`
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-specific-card ${potenzaEccessiva ? 'disabled' : ''}" 
               data-dimmer="${dimmer}" 
               data-codice="${dimmerCode}" 
               data-potenza-max="${potenzaMassima}">
            <img src="${imgPath}" class="card-img-top" alt="${dimmerText}" 
                 style="height: 180px; object-fit: cover; ${potenzaEccessiva ? 'opacity: 0.5;' : ''}" 
                 onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
            <div class="card-body text-center">
              <h5 class="card-title">${dimmerText}</h5>
              <p class="card-text small text-danger">
                Potenza massima: ${potenzaMassima}W
                ${potenzaEccessiva ? ' (Insufficiente per la configurazione attuale!)' : ''}
              </p>
              ${spazioNonIlluminato ? `<p class="card-text small text-danger">Spazio non illuminato: ${spazioNonIlluminato}mm</p>` : ''}
            </div>
          </div>
        </div>
      `);
    });
  }

  $('#dimmer-specific-section').show();
  
  // Aggiungi stile CSS per le card disabilitate
  $('<style>').text(`
    .dimmer-specific-card.disabled {
      opacity: 0.7;
      cursor: not-allowed;
      border-color: #ddd !important;
    }
    .dimmer-specific-card.disabled:hover {
      transform: none;
      box-shadow: none;
    }
  `).appendTo('head');
  
  // Aggiungi listener solo alle card non disabilitate
  $('.dimmer-specific-card:not(.disabled)').on('click', function() {
    $('.dimmer-specific-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    configurazione.dimmerCodice = $(this).data('codice') || "";
    configurazione.dimmerPotenzaMax = $(this).data('potenza-max') || 0;

    if (dimmer.includes('DIMMER_TOUCH_SU_PROFILO_') || 
        dimmer.includes('PRFIRSW') || 
        dimmer.includes('PRFIRDIMM')) {
      $('#dimmer-warning').show();
      
      if (configurazione.lunghezzaRichiesta) {
        const spazioNonIlluminato = 50;
        $('#dimmer-warning').html(`
          <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch/IR su profilo ci sarà uno spazio non illuminato di ${spazioNonIlluminato}mm.
          Lunghezza illuminata effettiva: ${configurazione.lunghezzaRichiesta - spazioNonIlluminato}mm.
        `);
      }
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });

  // Se c'è un solo dimmer non disabilitato, selezionalo automaticamente
  const dimmerAbilitati = $('.dimmer-specific-card:not(.disabled)');
  if (dimmerAbilitati.length === 1) {
    setTimeout(function() {
      dimmerAbilitati.click();
    }, 100);
  }
}

function bindDimmerCardListeners() {
  // Calcola la potenza totale per eventuali controlli
  const potenzaTotale = calcolaPotenzaTotaleStrip();
  
  $('.dimmer-card').on('click', function() {
    const dimmer = $(this).data('dimmer');
    const potenzaMax = $(this).data('potenza-max') || 9999;
    
    // Verifica se la potenza totale richiesta supera la potenza massima supportata
    if (potenzaTotale > potenzaMax) {
      // Mostra un avviso e non permette la selezione
      alert(`Questo dimmer supporta fino a ${potenzaMax}W, ma la configurazione attuale richiede circa ${potenzaTotale.toFixed(1)}W. Seleziona un dimmer con potenza massima più elevata.`);
      return;
    }
    
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.dimmerSelezionato = dimmer;
    configurazione.dimmerCodice = $(this).data('codice') || "";
    configurazione.dimmerPotenzaMax = potenzaMax;

    if (dimmer.includes('DIMMER_TOUCH_SU_PROFILO_') || 
        dimmer.includes('PRFIRSW') || 
        dimmer.includes('PRFIRDIMM')) {
      $('#dimmer-warning').show();
      
      if (configurazione.lunghezzaRichiesta) {
        const spazioNonIlluminato = 50;
        $('#dimmer-warning').html(`
          <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch/IR su profilo ci sarà uno spazio non illuminato di ${spazioNonIlluminato}mm.
          Lunghezza illuminata effettiva: ${configurazione.lunghezzaRichiesta - spazioNonIlluminato}mm.
        `);
      }
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
}

export function vaiAlControllo() {
  
  $('#profilo-nome-step5').text(configurazione.nomeModello);
  $('#tipologia-nome-step5').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                         mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                         configurazione.stripLedSelezionata;
    
    $('#strip-nome-step5').text(nomeStripLed);
  } else {
    $('#strip-nome-step5').text('Senza Strip LED');
  }

  if (configurazione.tensioneSelezionato === '220V') {
    $('#alimentazione-nome-step5').text('Strip 220V (no alimentatore)');
  } else if (configurazione.alimentazioneSelezionata === 'SENZA_ALIMENTATORE') {
    $('#alimentazione-nome-step5').text('Senza alimentatore');
  } else {
    let alimentazioneText = configurazione.alimentazioneSelezionata === 'ON-OFF' ? 'ON-OFF' : 'Dimmerabile TRIAC';
    $('#alimentazione-nome-step5').text(alimentazioneText);
  }
  
  updateProgressBar(5);

  if (configurazione.tensioneSelezionato === '220V') {
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      prepareControlloListeners();
    });
  } else {
    $("#step4-alimentazione").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      prepareControlloListeners();
    });
  }
}

export function prepareControlloListeners() {
  configurazione.dimmerSelezionato = null;
  configurazione.tipoAlimentazioneCavo = null;
  // Imposta automaticamente l'uscita cavo su DRITTA
  configurazione.uscitaCavoSelezionata = "DRITTA";
  
  $('#dimmer-warning').hide();
  $('#lunghezza-cavo-uscita-container').hide();
  
  // Nascondi completamente la sezione Uscita Cavo
  $('div.container.mb-5:has(h3:contains("Uscita Cavo"))').hide();
  
  $('#lunghezza-cavo-ingresso').val(0);
  $('#lunghezza-cavo-uscita').val(0);
  configurazione.lunghezzaCavoIngresso = 0;
  configurazione.lunghezzaCavoUscita = 0;
  
  $('#btn-continua-step5').prop('disabled', true);
  
  $('.alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');

  if (!configurazione.compatibilitaAlimentazioneDimmer) {
    if (configurazione.tensioneSelezionato === '220V') {
      configurazione.alimentazioneSelezionata = 'SENZA_ALIMENTATORE';
      configurazione.compatibilitaAlimentazioneDimmer = {
        'SENZA_ALIMENTATORE': ['NESSUN_DIMMER']
      };

      if (configurazione.stripLedSelezionata && 
          (configurazione.stripLedSelezionata.includes('RGB') || 
           configurazione.temperaturaColoreSelezionata === 'RGB' || 
           configurazione.temperaturaColoreSelezionata === 'RGBW')) {
        
        configurazione.compatibilitaAlimentazioneDimmer['SENZA_ALIMENTATORE'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
      }
    } else {
      configurazione.compatibilitaAlimentazioneDimmer = {
        'ON-OFF': ['NESSUN_DIMMER'],
        'DIMMERABILE_TRIAC': ['NESSUN_DIMMER', 'DIMMER_A_PULSANTE_SEMPLICE'],
        'SENZA_ALIMENTATORE': ['NESSUN_DIMMER']
      };

      if (configurazione.stripLedSelezionata && 
          (configurazione.stripLedSelezionata.includes('RGB') || 
           configurazione.temperaturaColoreSelezionata === 'RGB' || 
           configurazione.temperaturaColoreSelezionata === 'RGBW')) {
        
        configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
        configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
        configurazione.compatibilitaAlimentazioneDimmer['SENZA_ALIMENTATORE'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
      }

      if (configurazione.stripLedSelezionata &&
          !configurazione.stripLedSelezionata.includes('RGB') &&
          configurazione.temperaturaColoreSelezionata !== 'RGB' &&
          configurazione.temperaturaColoreSelezionata !== 'RGBW') {
        
        configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('TOUCH_SU_PROFILO');
        configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('TOUCH_SU_PROFILO');
      }
    }
  }
  caricaDimmerCompatibili();

  const lunghezzaRichiesta = configurazione.lunghezzaRichiesta || 0;
  const alimentazioneCavoContainer = $('#alimentazione-cavo-container');
  alimentazioneCavoContainer.empty();

  if (configurazione.tensioneSelezionato === '24V' && lunghezzaRichiesta > 5000) {
    alimentazioneCavoContainer.html(`
      <div class="alert alert-warning mb-3">
        <strong>Nota:</strong> Per sistemi a 24V che superano i 5000mm di lunghezza è obbligatorio utilizzare l'alimentazione doppia.
      </div>
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card option-card alimentazione-cavo-card" data-alimentazione-cavo="ALIMENTAZIONE_DOPPIA">
            <div class="card-body text-center">
              <h5 class="card-title">Alimentazione doppia</h5>
              <p class="card-text small text-muted">Due punti di alimentazione (obbligatorio per questa configurazione)</p>
            </div>
          </div>
        </div>
      </div>
    `);

    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_DOPPIA";
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
    
  } else if (configurazione.tensioneSelezionato === '48V' && lunghezzaRichiesta <= 15000) {
    alimentazioneCavoContainer.html(`
      <div class="alert alert-info mb-3">
        <strong>Nota:</strong> Per sistemi a 48V fino a 15000mm di lunghezza è prevista solo l'alimentazione unica.
      </div>
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card option-card alimentazione-cavo-card" data-alimentazione-cavo="ALIMENTAZIONE_UNICA">
            <div class="card-body text-center">
              <h5 class="card-title">Alimentazione unica</h5>
              <p class="card-text small text-muted">Singolo punto di alimentazione (consigliato per questa configurazione)</p>
            </div>
          </div>
        </div>
      </div>
    `);

    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_UNICA";
      $('#lunghezza-cavo-uscita-container').hide();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
    
  } else if (configurazione.tensioneSelezionato === '220V') {
    alimentazioneCavoContainer.html(`
      <div class="alert alert-info mb-3">
        <strong>Nota:</strong> Per sistemi a 220V è prevista solo l'alimentazione unica senza limiti di lunghezza.
      </div>
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card option-card alimentazione-cavo-card" data-alimentazione-cavo="ALIMENTAZIONE_UNICA">
            <div class="card-body text-center">
              <h5 class="card-title">Alimentazione unica</h5>
              <p class="card-text small text-muted">Singolo punto di alimentazione (obbligatorio per questa configurazione)</p>
            </div>
          </div>
        </div>
      </div>
    `);

    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_UNICA";
      $('#lunghezza-cavo-uscita-container').hide();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
  }
    
  else {
    alimentazioneCavoContainer.html(`
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card option-card alimentazione-cavo-card" data-alimentazione-cavo="ALIMENTAZIONE_UNICA">
            <div class="card-body text-center">
              <h5 class="card-title">Alimentazione unica</h5>
              <p class="card-text small text-muted">Singolo punto di alimentazione</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card option-card alimentazione-cavo-card" data-alimentazione-cavo="ALIMENTAZIONE_DOPPIA">
            <div class="card-body text-center">
              <h5 class="card-title">Alimentazione doppia</h5>
              <p class="card-text small text-muted">Due punti di alimentazione</p>
            </div>
          </div>
        </div>
      </div>
    `);

    const alimentazioniCavoDisponibili = $('.alimentazione-cavo-card').length;
    if (alimentazioniCavoDisponibili === 1) {
      const $unicaAlimentazioneCavo = $('.alimentazione-cavo-card').first();
      $unicaAlimentazioneCavo.addClass('selected');
      configurazione.tipoAlimentazioneCavo = $unicaAlimentazioneCavo.data('alimentazione-cavo');

      if (configurazione.tipoAlimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
        $('#lunghezza-cavo-uscita-container').show();
      } else {
        $('#lunghezza-cavo-uscita-container').hide();
      }
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
  }

  // Non serve più cercare e selezionare automaticamente le opzioni di uscita cavo, 
  // poiché ora abbiamo impostato un valore predefinito
  
  $('.alimentazione-cavo-card').on('click', function() {
    $('.alimentazione-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazioneCavo = $(this).data('alimentazione-cavo');
    configurazione.tipoAlimentazioneCavo = alimentazioneCavo;
    
    if (alimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      $('#lunghezza-cavo-uscita-container').hide();
    }
    
    checkStep5Completion();
  });

  // Manteniamo il listener per i pulsanti di uscita cavo, anche se la sezione è nascosta
  $('.uscita-cavo-card').on('click', function() {
    $('.uscita-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.uscitaCavoSelezionata = $(this).data('uscita-cavo');
    
    checkStep5Completion();
  });
}