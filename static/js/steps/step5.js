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
    // Per strip 220V, mostriamo solo l'opzione CTR130 ma in formato a colonne
    const dimmerHtml = `
      <h3 class="mb-3">Dimmer</h3>
      <div class="alert alert-info mb-3">
        <strong>Nota:</strong> Per strip LED 220V è disponibile solo il dimmer CTR130 (dimmerabile TRIAC tramite pulsante e sistema TUYA).
      </div>
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card option-card dimmer-card" data-dimmer="DIMMER_A_PULSANTE_SEMPLICE">
            <img src="/static/img/dimmer_pulsante.jpg" class="card-img-top" alt="CTR130" style="height: 180px; object-fit: cover;" onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
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
    configurazione.dimmerSelezionato = "DIMMER_A_PULSANTE_SEMPLICE";
    configurazione.dimmerModeloSpecifico = "CTR130"; // Aggiungiamo questa proprietà per identificare il modello specifico
    
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
        <div class="col-md-4 mb-3">
          <div class="card option-card dimmer-card" data-dimmer="NESSUN_DIMMER">
            <div class="card-body text-center">
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
    } else {
      configurazione.dimmerSelezionato = null;
    }
    
    bindDimmerCardListeners();
    return;
  }

  // Mostriamo un loader mentre carichiamo i dimmer compatibili
  $('#dimmer-loading').show();
  
  // Mappatura tra codici dimmer e testi visualizzati
  const dimmerLabel = {
    'NESSUN_DIMMER': 'Nessun dimmer',
    'TOUCH_SU_PROFILO': 'Touch su profilo',
    'CON_TELECOMANDO': 'Con telecomando',
    'CENTRALINA_TUYA': 'Centralina TUYA',
    'DIMMER_A_PULSANTE_SEMPLICE': 'Dimmer a pulsante semplice',
    'DIMMERABILE_PWM': 'Dimmerabile PWM',
    'DIMMERABILE_DALI': 'Dimmerabile DALI'
  };
  
  // Mappatura tra codici dimmer e descrizioni
  const dimmerDesc = {
    'NESSUN_DIMMER': 'Installazione senza controllo di luminosità',
    'TOUCH_SU_PROFILO': 'Controllo touch direttamente sul profilo',
    'CON_TELECOMANDO': 'Controllo a distanza con telecomando dedicato',
    'CENTRALINA_TUYA': 'Controllo smart tramite app mobile',
    'DIMMER_A_PULSANTE_SEMPLICE': 'Controllo con pulsante standard',
    'DIMMERABILE_PWM': 'Controllo tramite modulazione PWM',
    'DIMMERABILE_DALI': 'Controllo tramite protocollo DALI'
  };
  
  // Mappatura tra codici dimmer e percorsi immagini
  const dimmerImages = {
    'TOUCH_SU_PROFILO': '/static/img/touch_su_profilo.jpg',
    'CON_TELECOMANDO': '/static/img/con_telecomando.jpg',
    'CENTRALINA_TUYA': '/static/img/centralina_tuya.jpg',
    'DIMMER_A_PULSANTE_SEMPLICE': '/static/img/dimmer_pulsante.jpg',
    'DIMMERABILE_PWM': '/static/img/dimmer_pwm.jpg',
    'DIMMERABILE_DALI': '/static/img/dimmer_dali.jpg'
  };
  
  // Chiamiamo l'API per ottenere i dimmer compatibili
  $.ajax({
    url: `/get_opzioni_dimmerazione/${configurazione.stripLedSelezionata}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        // Iniziamo con tutte le opzioni disponibili dall'API
        let opzioniDimmer = response.opzioni || [];
        
        // Filtriamo le opzioni in base all'alimentazione selezionata
        if (configurazione.alimentazioneSelezionata && 
            configurazione.compatibilitaAlimentazioneDimmer && 
            configurazione.compatibilitaAlimentazioneDimmer[configurazione.alimentazioneSelezionata]) {
          
          // Intersezione tra opzioni API e opzioni compatibili con alimentazione
          const opzioniCompatibili = configurazione.compatibilitaAlimentazioneDimmer[configurazione.alimentazioneSelezionata];
          opzioniDimmer = opzioniDimmer.filter(dimmer => opzioniCompatibili.includes(dimmer));
        }
        
        // Se non ci sono opzioni compatibili, mostriamo solo "nessun dimmer"
        if (opzioniDimmer.length === 0 || !opzioniDimmer.includes('NESSUN_DIMMER')) {
          opzioniDimmer = ['NESSUN_DIMMER'];
        }
        
        // Creiamo l'HTML per le opzioni di dimmer
        let dimmerHtml = `<h3 class="mb-3">Dimmer</h3><div class="row">`;
        
        // Per ogni dimmer compatibile, creiamo una card
        opzioniDimmer.forEach(dimmer => {
          // Ottieni il testo e la descrizione del dimmer
          const dimmerText = dimmerLabel[dimmer] || dimmer;
          const dimmerDescription = dimmerDesc[dimmer] || '';
          
          // Controlla se questo dimmer ha spazi non illuminati
          const spazioNonIlluminato = response.spaziNonIlluminati && response.spaziNonIlluminati[dimmer];
          
          // Crea una card diversa in base al tipo di dimmer
          if (dimmer === 'NESSUN_DIMMER') {
            // Per "NESSUN_DIMMER", non mostriamo l'immagine, solo il testo
            dimmerHtml += `
              <div class="col-md-4 mb-3">
                <div class="card option-card dimmer-card" data-dimmer="${dimmer}">
                  <div class="card-body text-center">
                    <h5 class="card-title">${dimmerText}</h5>
                    <p class="card-text small text-muted">${dimmerDescription}</p>
                  </div>
                </div>
              </div>`;
          } else {
            // Per tutti gli altri dimmer, includiamo l'immagine
            const imgPath = dimmerImages[dimmer] || '/static/img/placeholder_logo.jpg';
            dimmerHtml += `
              <div class="col-md-4 mb-3">
                <div class="card option-card dimmer-card" data-dimmer="${dimmer}">
                  <img src="${imgPath}" class="card-img-top" alt="${dimmerText}" style="height: 180px; object-fit: cover;" onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px'">
                  <div class="card-body text-center">
                    <h5 class="card-title">${dimmerText}</h5>
                    <p class="card-text small text-muted">${dimmerDescription}</p>
                    ${spazioNonIlluminato ? `<p class="card-text small text-danger">Spazio non illuminato: ${spazioNonIlluminato}mm</p>` : ''}
                  </div>
                </div>
              </div>`;
          }
        });
        
        dimmerHtml += `</div>`;
        
        // Se c'è l'opzione TOUCH_SU_PROFILO, aggiungiamo un alert sotto il container
        if (opzioniDimmer.includes('TOUCH_SU_PROFILO')) {
          dimmerHtml += `
            <div id="dimmer-warning" class="alert alert-warning mt-3" style="display: none;">
              <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch su profilo ci sarà uno spazio non illuminato di 50mm.
            </div>
          `;
        }
        
        // Aggiorniamo il contenitore con le opzioni di dimmer
        $('#dimmer-container').html(dimmerHtml);
        
        // Auto-selezione solo se c'è una sola opzione
        if (opzioniDimmer.length === 1) {
          const $unicoDimmer = $('.dimmer-card');
          $unicoDimmer.addClass('selected');
          configurazione.dimmerSelezionato = opzioniDimmer[0];
          
          // Se il dimmer è TOUCH_SU_PROFILO, mostra l'avviso
          if (opzioniDimmer[0] === 'TOUCH_SU_PROFILO') {
            $('#dimmer-warning').show();
          }
        } else {
          // Non selezionare automaticamente nessuna opzione quando ce ne sono più di una
          configurazione.dimmerSelezionato = null;
        }
        
        // Ripristiniamo gli event listener per le card di dimmer
        bindDimmerCardListeners();
        
        // Verifica completamento passo
        checkStep5Completion();
      } else {
        // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
        console.error("Errore nel caricamento dei dimmer compatibili:", response.message);
        const dimmerHtml = `
          <h3 class="mb-3">Dimmer</h3>
          <div class="row">
            <div class="col-md-4 mb-3">
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
        } else {
          configurazione.dimmerSelezionato = null;
        }
        
        bindDimmerCardListeners();
        checkStep5Completion();
      }
      
      // Nascondiamo il loader
      $('#dimmer-loading').hide();
    },
    error: function(error) {
      // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
      console.error("Errore nella chiamata API dei dimmer:", error);
      const dimmerHtml = `
        <h3 class="mb-3">Dimmer</h3>
        <div class="row">
          <div class="col-md-4 mb-3">
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
      } else {
        configurazione.dimmerSelezionato = null;
      }
      
      $('#dimmer-loading').hide();
      bindDimmerCardListeners();
      checkStep5Completion();
    }
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

function bindDimmerCardListeners() {
  $('.dimmer-card').on('click', function() {
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    // Gestione dello warning per TOUCH_SU_PROFILO
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
      
      // Se c'è anche una lunghezza richiesta, aggiorna il calcolo considerando lo spazio non illuminato
      if (configurazione.lunghezzaRichiesta) {
        const spazioNonIlluminato = 50; // mm
        $('#dimmer-warning').html(`
          <strong style="color:#ff0000 !important;">Nota:</strong> Con l'opzione Touch su profilo ci sarà uno spazio non illuminato di ${spazioNonIlluminato}mm.
          Lunghezza illuminata effettiva: ${configurazione.lunghezzaRichiesta - spazioNonIlluminato}mm.
        `);
      }
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
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