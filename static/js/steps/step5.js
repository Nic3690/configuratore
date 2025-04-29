import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep5Completion } from '../utils.js';
import { vaiAlleProposte } from './step6.js'


export function initStep5Listeners() {
  $('#btn-torna-step4').on('click', function(e) {
    e.preventDefault();
    
    $("#step5-controllo").fadeOut(300, function() {
      // Se la strip è 220V, torniamo direttamente allo step 3 (temperatura e potenza)
      if (configurazione.tensioneSelezionato === '220V') {
        $("#step3-temperatura-potenza").fadeIn(300);
        updateProgressBar(3);
      } else {
        // Altrimenti torniamo allo step 4 (alimentazione)
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
    
    // MODIFICATO: Ora va alle proposte (step 6) invece che direttamente al riepilogo
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
  
  // GESTIONE SPECIALE PER STRIP 220V
  if (configurazione.tensioneSelezionato === '220V') {
    // Per strip 220V, mostriamo solo l'opzione CTR130
    const dimmerHtml = `
      <h3 class="mb-3">Dimmer</h3>
      <div class="alert alert-info mb-3">
        <strong>Nota:</strong> Per strip LED 220V è disponibile solo il dimmer CTR130 (dimmerabile TRIAC tramite pulsante e sistema TUYA).
      </div>
      <div class="row">
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-card" data-dimmer="DIMMERABILE_TRIAC_PULSANTE_TUYA_220V" data-codice="CTR130">
            <img src="/static/img/dimmer/dimmer_pulsante.jpg" class="card-img-top" alt="CTR130" style="height: 180px; object-fit: cover;" onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
            <div class="card-body text-center">
              <h5 class="card-title">CTR130 - Dimmer a pulsante</h5>
              <p class="card-text small text-muted">Dimmerabile TRIAC tramite pulsante e compatibile con sistema TUYA</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    $('#dimmer-container').html(dimmerHtml);
    
    // Auto-selezione immediata dato che c'è solo un'opzione
    $('.dimmer-card').addClass('selected');
    configurazione.dimmerSelezionato = "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V";
    configurazione.dimmerCodice = "CTR130";
    
    // Abilitiamo il listener
    bindDimmerCardListeners();
    checkStep5Completion();
    return;
  }

  // Se non è strip LED selezionata o è "senza strip", mostriamo solo l'opzione "nessun dimmer"
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
    // Auto-selezione dimmer solo se c'è una sola opzione
    if ($('.dimmer-card').length === 1) {
      $('.dimmer-card').addClass('selected');
      configurazione.dimmerSelezionato = "NESSUN_DIMMER";
      configurazione.dimmerCodice = "";
    } else {
      configurazione.dimmerSelezionato = null;
      configurazione.dimmerCodice = null;
    }
    
    bindDimmerCardListeners();
    return;
  }

  // Mostriamo un loader mentre carichiamo i dimmer compatibili
  $('#dimmer-loading').show();
  
  // Immagini per i diversi tipi di dimmer
  const dimmerCategoryImages = {
    "TOUCH_SU_PROFILO": "/static/img/dimmer/touch_su_profilo.jpg",
    "CON_TELECOMANDO": "/static/img/dimmer/con_telecomando.jpg",
    "CON_PULSANTE": "/static/img/dimmer/dimmer_pulsante.jpg", 
    "SISTEMA_TUYA": "/static/img/dimmer/centralina_tuya.jpg",
    "DA_SCATOLA": "/static/img/dimmer/dimmer_scatola.jpg",
    "NESSUN_DIMMER": "/static/img/placeholder_logo.jpg"
  };
  
  // Definizione delle categorie di dimmer e quali dimmer specifici appartengono a ciascuna
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
  
  // Nomi visualizzati per le categorie
  const categoryDisplayNames = {
    "TOUCH_SU_PROFILO": "Touch su profilo",
    "CON_TELECOMANDO": "Con telecomando",
    "CON_PULSANTE": "Con pulsante",
    "SISTEMA_TUYA": "Sistema Tuya",
    "DA_SCATOLA": "Da scatola",
    "NESSUN_DIMMER": "Nessun dimmer"
  };
  
  // Chiamiamo l'API per ottenere i dimmer compatibili
  $.ajax({
    url: `/get_opzioni_dimmerazione/${configurazione.stripLedSelezionata}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        // Iniziamo con tutte le opzioni disponibili dall'API
        let opzioniDimmer = response.opzioni || [];
        
        // Aggiungiamo sempre l'opzione NESSUN_DIMMER se non è già presente
        if (!opzioniDimmer.includes('NESSUN_DIMMER')) {
          opzioniDimmer.push('NESSUN_DIMMER');
        }
        
        // Raggruppiamo i dimmer disponibili per categoria
        const categorieDisponibili = {};
        
        // Popoliamo le categorie disponibili
        Object.keys(dimmerCategories).forEach(categoria => {
          const dimmerInCategoria = dimmerCategories[categoria].filter(d => opzioniDimmer.includes(d));
          if (dimmerInCategoria.length > 0) {
            categorieDisponibili[categoria] = dimmerInCategoria;
          }
        });
        
        // Immagini per i diversi tipi di dimmer specifici
        const dimmerImages = {
          "DIMMER_TOUCH_SU_PROFILO_PRFTSW01": "/static/img/dimmer/touch_su_profilo.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFTDIMM01": "/static/img/dimmer/touch_su_profilo_dim.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFIRSW01": "/static/img/dimmer/ir_su_profilo.jpg",
          "DIMMER_TOUCH_SU_PROFILO_PRFIRDIMM01": "/static/img/dimmer/ir_su_profilo_dim.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_RGB_RGBW": "/static/img/dimmer/con_telecomando_rgb.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_MONOCOLORE": "/static/img/dimmer/con_telecomando.jpg",
          "DIMMER_PWM_CON_TELECOMANDO_TUNABLE_WHITE": "/static/img/dimmer/con_telecomando_cct.jpg",
          "DIMMER_PWM_CON_PULSANTE_24V_MONOCOLORE": "/static/img/dimmer/dimmer_pulsante.jpg",
          "DIMMER_PWM_CON_PULSANTE_48V_MONOCOLORE": "/static/img/dimmer/dimmer_pulsante.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_MONOCOLORE": "/static/img/dimmer/centralina_tuya.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_TUNABLE_WHITE": "/static/img/dimmer/centralina_tuya_cct.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGB": "/static/img/dimmer/centralina_tuya_rgb.jpg",
          "DIMMERABILE_PWM_CON_SISTEMA_TUYA_RGBW": "/static/img/dimmer/centralina_tuya_rgbw.jpg",
          "DIMMERABILE_TRIAC_PULSANTE_TUYA_220V": "/static/img/dimmer/dimmer_triac_220v.jpg",
          "DIMMER_PWM_DA_SCATOLA_CON_PULSANTE_NA": "/static/img/dimmer/dimmer_scatola.jpg",
          "NESSUN_DIMMER": "/static/img/placeholder_logo.jpg"
        };
        
        // Memorizziamo tutte le informazioni sui dimmer disponibili per uso futuro
        window.dimmerData = {
          categories: categorieDisponibili,
          nomiDimmer: response.nomiDimmer || {},
          codiciDimmer: response.codiciDimmer || {},
          spaziNonIlluminati: response.spaziNonIlluminati || {}
        };
        
        // Creiamo l'HTML per il container dei dimmer
        let dimmerHtml = `<h3 class="mb-3">Dimmer</h3>`;
        
        // Se c'è una sola categoria e contiene solo l'opzione NESSUN_DIMMER, mostro direttamente quella
        if (Object.keys(categorieDisponibili).length === 1 && 
            Object.keys(categorieDisponibili)[0] === 'NESSUN_DIMMER' && 
            categorieDisponibili['NESSUN_DIMMER'].length === 1) {
            
          dimmerHtml += `
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
          
          // Auto-seleziona l'opzione
          $('.dimmer-card').addClass('selected');
          configurazione.dimmerSelezionato = "NESSUN_DIMMER";
          configurazione.dimmerCodice = "";
          
          bindDimmerCardListeners();
          checkStep5Completion();
          return;
        }
        
        // Creiamo la struttura a due livelli
        dimmerHtml += `
          <div class="mb-4">
            <h5 class="mb-3">1. Seleziona la categoria di dimmer</h5>
            <div class="row" id="dimmer-categories-container">
        `;
        
        // Aggiungiamo le card delle categorie
        Object.keys(categorieDisponibili).forEach(categoria => {
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
        });
        
        dimmerHtml += `
            </div>
          </div>
        `;
        
        // Aggiungiamo il container per i dimmer specifici (inizialmente vuoto)
        dimmerHtml += `
          <div id="dimmer-specific-section" style="display: none;">
            <h5 class="mb-3">2. Seleziona il modello specifico <span id="categoria-selezionata-label"></span></h5>
            <div class="row" id="dimmer-specific-container"></div>
          </div>
          
          <div id="dimmer-warning" class="alert alert-warning mt-3" style="display: none;">
            <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch/IR su profilo ci sarà uno spazio non illuminato di 50mm.
          </div>
        `;
        
        // Aggiorniamo il contenitore con le opzioni di dimmer
        $('#dimmer-container').html(dimmerHtml);
        
        // Nascondiamo il loader
        $('#dimmer-loading').hide();
        
        // Aggiungiamo listener per le categorie di dimmer
        $('.dimmer-category-card').on('click', function() {
          // Rimuoviamo la classe selected da tutte le categorie
          $('.dimmer-category-card').removeClass('selected');
          // Aggiungiamo la classe selected alla categoria cliccata
          $(this).addClass('selected');
          
          const categoria = $(this).data('categoria');
          
          // Aggiorniamo il label della categoria selezionata
          $('#categoria-selezionata-label').text(`di ${categoryDisplayNames[categoria]}`);
          
          // Carichiamo e mostriamo i dimmer specifici di questa categoria
          mostraDimmerSpecifici(categoria, dimmerImages, response);
        });
        
        // Se c'è una sola categoria disponibile, la selezioniamo automaticamente
        if (Object.keys(categorieDisponibili).length === 1) {
          const unicaCategoria = Object.keys(categorieDisponibili)[0];
          
          // Seleziona visivamente la categoria
          $(`.dimmer-category-card[data-categoria="${unicaCategoria}"]`).addClass('selected');
          
          // Aggiorniamo il label della categoria selezionata
          $('#categoria-selezionata-label').text(`di ${categoryDisplayNames[unicaCategoria]}`);
          
          // Mostra e seleziona automaticamente i dimmer di questa categoria
          mostraDimmerSpecifici(unicaCategoria, dimmerImages, response);
          
          // Se questa categoria ha un solo dimmer, lo selezioniamo automaticamente
          if (categorieDisponibili[unicaCategoria].length === 1) {
            setTimeout(function() {
              const unicoDimmer = categorieDisponibili[unicaCategoria][0];
              $(`.dimmer-specific-card[data-dimmer="${unicoDimmer}"]`).click();
            }, 200);
          }
        }
        
        // Verifica completamento passo
        checkStep5Completion();
      } else {
        // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
        console.error("Errore nel caricamento dei dimmer compatibili:", response.message);
        const dimmerHtml = `
          <h3 class="mb-3">Dimmer</h3>
          <div class="row">
            <div class="col-md-4 mb-3 dimmer-column">
              <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
                <div class="card-body text-center">
                  <h5 class="card-title">Nessun dimmer</h5>
                  <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
                </div>
              </div>
            </div>
          </div>`;
        
        $('#dimmer-container').html(dimmerHtml);
        
        // Auto-seleziona l'opzione solo se è l'unica
        if ($('.dimmer-card').length === 1) {
          $('.dimmer-card').addClass('selected');
          configurazione.dimmerSelezionato = "NESSUN_DIMMER";
          configurazione.dimmerCodice = "";
        } else {
          configurazione.dimmerSelezionato = null;
          configurazione.dimmerCodice = null;
        }
        
        bindDimmerCardListeners();
        checkStep5Completion();
      }
    },
    error: function(error) {
      // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
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
      
      // Auto-seleziona l'opzione solo se è l'unica
      if ($('.dimmer-card').length === 1) {
        $('.dimmer-card').addClass('selected');
        configurazione.dimmerSelezionato = "NESSUN_DIMMER";
        configurazione.dimmerCodice = "";
      } else {
        configurazione.dimmerSelezionato = null;
        configurazione.dimmerCodice = null;
      }
      
      $('#dimmer-loading').hide();
      bindDimmerCardListeners();
      checkStep5Completion();
    }
  });
}

// Funzione per mostrare i dimmer specifici di una categoria
function mostraDimmerSpecifici(categoria, dimmerImages, response) {
  // Ottenere i dati della categoria selezionata
  const dimmerData = window.dimmerData;
  const dimmerInCategoria = dimmerData.categories[categoria];
  
  // Prepara il container per i dimmer specifici
  const specificContainer = $('#dimmer-specific-container');
  specificContainer.empty();
  
  // Caso speciale per NESSUN_DIMMER
  if (categoria === 'NESSUN_DIMMER') {
    specificContainer.append(`
      <div class="col-md-4 mb-3 dimmer-column">
        <div class="card option-card dimmer-specific-card" data-dimmer="NESSUN_DIMMER">
          <div class="card-body text-center d-flex flex-column justify-content-center" style="min-height: 180px;">
            <h5 class="card-title">Nessun dimmer</h5>
            <p class="card-text small text-muted">Installazione senza controllo di luminosità</p>
          </div>
        </div>
      </div>
    `);
  } else {
    // Per tutte le altre categorie, aggiungi ogni dimmer specifico
    dimmerInCategoria.forEach(dimmer => {
      const dimmerText = dimmerData.nomiDimmer[dimmer] || dimmer;
      const dimmerCode = dimmerData.codiciDimmer[dimmer] || "";
      const spazioNonIlluminato = dimmerData.spaziNonIlluminati[dimmer];
      const imgPath = dimmerImages[dimmer] || "/static/img/placeholder_logo.jpg";
      
      specificContainer.append(`
        <div class="col-md-4 mb-3 dimmer-column">
          <div class="card option-card dimmer-specific-card" data-dimmer="${dimmer}" data-codice="${dimmerCode}">
            <img src="${imgPath}" class="card-img-top" alt="${dimmerText}" 
                 style="height: 180px; object-fit: cover;" onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
            <div class="card-body text-center">
              <h5 class="card-title">${dimmerText}</h5>
              ${spazioNonIlluminato ? `<p class="card-text small text-danger">Spazio non illuminato: ${spazioNonIlluminato}mm</p>` : ''}
            </div>
          </div>
        </div>
      `);
    });
  }
  
  // Mostra il container dei dimmer specifici
  $('#dimmer-specific-section').show();
  
  // Aggiungi i listener per le card dei dimmer specifici
  $('.dimmer-specific-card').on('click', function() {
    $('.dimmer-specific-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    // Salva il codice del dimmer
    configurazione.dimmerCodice = $(this).data('codice') || "";
    
    // Gestione dello warning per i dimmer touch/ir su profilo
    if (dimmer.includes('DIMMER_TOUCH_SU_PROFILO_') || 
        dimmer.includes('PRFIRSW') || 
        dimmer.includes('PRFIRDIMM')) {
      $('#dimmer-warning').show();
      
      // Se c'è anche una lunghezza richiesta, aggiorna il calcolo considerando lo spazio non illuminato
      if (configurazione.lunghezzaRichiesta) {
        const spazioNonIlluminato = 50; // mm
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
  
  // Se c'è solo un dimmer in questa categoria, selezionalo automaticamente
  if (dimmerInCategoria.length === 1) {
    // Piccolo timeout per assicurarsi che il DOM sia pronto
    setTimeout(function() {
      $('.dimmer-specific-card').click();
    }, 100);
  }
}

function bindDimmerCardListeners() {
  $('.dimmer-card').on('click', function() {
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    // Salva il codice del dimmer
    configurazione.dimmerCodice = $(this).data('codice') || "";
    
    // Gestione dello warning per i dimmer touch/ir su profilo
    if (dimmer.includes('DIMMER_TOUCH_SU_PROFILO_') || 
        dimmer.includes('PRFIRSW') || 
        dimmer.includes('PRFIRDIMM')) {
      $('#dimmer-warning').show();
      
      // Se c'è anche una lunghezza richiesta, aggiorna il calcolo considerando lo spazio non illuminato
      if (configurazione.lunghezzaRichiesta) {
        const spazioNonIlluminato = 50; // mm
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

/* Controllo (dimmer e cavi) */
export function vaiAlControllo() {
  
  $('#profilo-nome-step5').text(configurazione.nomeModello);
  $('#tipologia-nome-step5').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    // Usa il nome commerciale se disponibile
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                         mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                         configurazione.stripLedSelezionata;
    
    $('#strip-nome-step5').text(nomeStripLed);
  } else {
    $('#strip-nome-step5').text('Senza Strip LED');
  }
  
  // Gestiamo il caso delle strip 220V
  if (configurazione.tensioneSelezionato === '220V') {
    $('#alimentazione-nome-step5').text('Strip 220V (no alimentatore)');
  } else if (configurazione.alimentazioneSelezionata === 'SENZA_ALIMENTATORE') {
    $('#alimentazione-nome-step5').text('Senza alimentatore');
  } else {
    let alimentazioneText = configurazione.alimentazioneSelezionata === 'ON-OFF' ? 'ON-OFF' : 'Dimmerabile TRIAC';
    $('#alimentazione-nome-step5').text(alimentazioneText);
  }
  
  updateProgressBar(5);
  
  // Aggiorniamo questa parte per gestire entrambi i casi di provenienza (da step3 o step4)
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
  configurazione.uscitaCavoSelezionata = null;
  
  $('#dimmer-warning').hide();
  $('#lunghezza-cavo-uscita-container').hide();
  
  $('#lunghezza-cavo-ingresso').val(0);
  $('#lunghezza-cavo-uscita').val(0);
  configurazione.lunghezzaCavoIngresso = 0;
  configurazione.lunghezzaCavoUscita = 0;
  
  $('#btn-continua-step5').prop('disabled', true);
  
  $('.alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');
  
  // Configurazione delle opzioni di compatibilità tra alimentazioni e dimmer
  // se non è già impostata in prepareAlimentazioneListeners
  if (!configurazione.compatibilitaAlimentazioneDimmer) {
    // Per le strip 220V, impostiamo automaticamente SENZA_ALIMENTATORE
    if (configurazione.tensioneSelezionato === '220V') {
      configurazione.alimentazioneSelezionata = 'SENZA_ALIMENTATORE';
      configurazione.compatibilitaAlimentazioneDimmer = {
        'SENZA_ALIMENTATORE': ['NESSUN_DIMMER']
      };
      
      // Per le strip 220V RGB (se esistono), aggiungiamo opzioni speciali
      if (configurazione.stripLedSelezionata && 
          (configurazione.stripLedSelezionata.includes('RGB') || 
           configurazione.temperaturaColoreSelezionata === 'RGB' || 
           configurazione.temperaturaColoreSelezionata === 'RGBW')) {
        
        configurazione.compatibilitaAlimentazioneDimmer['SENZA_ALIMENTATORE'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
      }
    } else {
      // Configurazione normale per altre tensioni
      configurazione.compatibilitaAlimentazioneDimmer = {
        'ON-OFF': ['NESSUN_DIMMER'],
        'DIMMERABILE_TRIAC': ['NESSUN_DIMMER', 'DIMMER_A_PULSANTE_SEMPLICE'],
        'SENZA_ALIMENTATORE': ['NESSUN_DIMMER']
      };
      
      // Aggiungi opzioni speciali se c'è una strip RGB
      if (configurazione.stripLedSelezionata && 
          (configurazione.stripLedSelezionata.includes('RGB') || 
           configurazione.temperaturaColoreSelezionata === 'RGB' || 
           configurazione.temperaturaColoreSelezionata === 'RGBW')) {
        
        configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
        configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
        configurazione.compatibilitaAlimentazioneDimmer['SENZA_ALIMENTATORE'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
      }
      
      // Aggiungi TOUCH_SU_PROFILO per strip non-RGB compatibili
      if (configurazione.stripLedSelezionata &&
          !configurazione.stripLedSelezionata.includes('RGB') &&
          configurazione.temperaturaColoreSelezionata !== 'RGB' &&
          configurazione.temperaturaColoreSelezionata !== 'RGBW') {
        
        configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('TOUCH_SU_PROFILO');
        configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('TOUCH_SU_PROFILO');
      }
    }
  }
  
  // Carica i dimmer compatibili
  caricaDimmerCompatibili();
  
  // MODIFICA: Applicazione delle regole specifiche per le opzioni di alimentazione in base alla tensione e lunghezza
  
  // Ottieni la lunghezza attuale in mm
  const lunghezzaRichiesta = configurazione.lunghezzaRichiesta || 0;
  
  // Container per le opzioni di alimentazione
  const alimentazioneCavoContainer = $('#alimentazione-cavo-container');
  alimentazioneCavoContainer.empty();
  
  // Regole specifiche in base alla tensione
  if (configurazione.tensioneSelezionato === '24V' && lunghezzaRichiesta > 5000) {
    // Per sistemi 24V > 5000mm, obbligatorio due alimentatori
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
    
    // Auto-selezione solo se c'è una sola opzione
    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_DOPPIA";
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
    
  } else if (configurazione.tensioneSelezionato === '48V' && lunghezzaRichiesta <= 15000) {
    // Per sistemi 48V fino a 15000mm, solo alimentazione unica
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
    
    // Auto-selezione solo se c'è una sola opzione
    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_UNICA";
      $('#lunghezza-cavo-uscita-container').hide();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
    
  } else if (configurazione.tensioneSelezionato === '220V') {
    // Per sistemi 220V, layout a colonne per l'alimentazione unica
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
    
    // Auto-selezione solo se c'è una sola opzione
    if ($('.alimentazione-cavo-card').length === 1) {
      $('.alimentazione-cavo-card').addClass('selected');
      configurazione.tipoAlimentazioneCavo = "ALIMENTAZIONE_UNICA";
      $('#lunghezza-cavo-uscita-container').hide();
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
  }
    
  else {
    // Caso normale, mostra entrambe le opzioni
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

    // Auto-selezione alimentazione cavo - solo se c'è una sola opzione
    const alimentazioniCavoDisponibili = $('.alimentazione-cavo-card').length;
    if (alimentazioniCavoDisponibili === 1) {
      const $unicaAlimentazioneCavo = $('.alimentazione-cavo-card').first();
      $unicaAlimentazioneCavo.addClass('selected');
      configurazione.tipoAlimentazioneCavo = $unicaAlimentazioneCavo.data('alimentazione-cavo');
      
      // Gestisci visibilità container lunghezza cavo uscita
      if (configurazione.tipoAlimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
        $('#lunghezza-cavo-uscita-container').show();
      } else {
        $('#lunghezza-cavo-uscita-container').hide();
      }
    } else {
      configurazione.tipoAlimentazioneCavo = null;
    }
  }

  // Auto-selezione per uscita cavo - solo se c'è una sola opzione
  const usciteCavoDisponibili = $('.uscita-cavo-card').length;
  if (usciteCavoDisponibili === 1) {
    const $unicaUscitaCavo = $('.uscita-cavo-card').first();
    $unicaUscitaCavo.addClass('selected');
    configurazione.uscitaCavoSelezionata = $unicaUscitaCavo.data('uscita-cavo');
  } else {
    configurazione.uscitaCavoSelezionata = null;
  }

  // Re-attacca gli event listeners per le card di alimentazione cavo
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

  $('.uscita-cavo-card').on('click', function() {
    $('.uscita-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.uscitaCavoSelezionata = $(this).data('uscita-cavo');
    
    checkStep5Completion();
  });
}