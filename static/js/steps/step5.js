import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep5Completion } from '../utils.js';
import { finalizzaConfigurazione } from '../api.js';

export function initStep5Listeners() {
  $('#btn-torna-step4').on('click', function(e) {
    e.preventDefault();
    
    $("#step5-controllo").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      updateProgressBar(4);
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
    
    // MODIFICATO: Ora va direttamente al riepilogo (finalizzazione) invece che alla personalizzazione
    finalizzaConfigurazione();
  });
}

/**
 * Carica i dimmer compatibili con la strip LED selezionata
 */
function caricaDimmerCompatibili() {
  // Se non c'è strip LED selezionata o è "senza strip", mostriamo solo l'opzione "nessun dimmer"
  if (!configurazione.stripLedSelezionata || 
      configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP') {
    
    // Creiamo la card per "nessun dimmer"
    const dimmerHtml = `
      <div class="container mb-5">
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
      </div>`;
    
    $('#dimmer-container').html(dimmerHtml);
    return;
  }

  // Mostria un loader mentre carichiamo i dimmer compatibili
  $('#dimmer-loading').show();
  
  // Chiamiamo l'API per ottenere i dimmer compatibili
  $.ajax({
    url: `/get_opzioni_dimmerazione/${configurazione.stripLedSelezionata}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        // Creiamo l'HTML per le opzioni di dimmer
        let dimmerHtml = `<div class="container mb-5"><h3 class="mb-3">Dimmer</h3><div class="row">`;
        
        // Mappatura tra codici dimmer e testi visualizzati
        const dimmerLabel = {
          'NESSUN_DIMMER': 'Nessun dimmer',
          'TOUCH_SU_PROFILO': 'Touch su profilo',
          'CON_TELECOMANDO': 'Con telecomando',
          'CENTRALINA_TUYA': 'Centralina TUYA',
          'DIMMER_A_PULSANTE_SEMPLICE': 'Dimmer a pulsante semplice'
        };
        
        // Mappatura tra codici dimmer e descrizioni
        const dimmerDesc = {
          'NESSUN_DIMMER': 'Installazione senza controllo di luminosità',
          'TOUCH_SU_PROFILO': 'Controllo touch direttamente sul profilo',
          'CON_TELECOMANDO': 'Controllo a distanza con telecomando dedicato',
          'CENTRALINA_TUYA': 'Controllo smart tramite app mobile',
          'DIMMER_A_PULSANTE_SEMPLICE': 'Controllo con pulsante standard'
        };
        
        // Per ogni dimmer compatibile, creiamo una card
        response.opzioni.forEach(dimmer => {
          // Ottieni il testo e la descrizione del dimmer
          const dimmerText = dimmerLabel[dimmer] || dimmer;
          const dimmerDescription = dimmerDesc[dimmer] || '';
          
          // Controlla se questo dimmer ha spazi non illuminati
          const spazioNonIlluminato = response.spaziNonIlluminati && response.spaziNonIlluminati[dimmer];
          
          // Crea la card per questo dimmer
          dimmerHtml += `
            <div class="col-md-4 mb-3">
              <div class="card option-card dimmer-card" data-dimmer="${dimmer}">
                <div class="card-body text-center">
                  <h5 class="card-title">${dimmerText}</h5>
                  <p class="card-text small text-muted">${dimmerDescription}</p>
                  ${spazioNonIlluminato ? `<p class="card-text small text-danger">Spazio non illuminato: ${spazioNonIlluminato}mm</p>` : ''}
                </div>
              </div>
            </div>`;
        });
        
        dimmerHtml += `</div></div>`;
        
        // Aggiorniamo il contenitore con le opzioni di dimmer
        $('#dimmer-container').html(dimmerHtml);
        
        // Ripristiniamo gli event listener per le card di dimmer
        bindDimmerCardListeners();
      } else {
        // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
        console.error("Errore nel caricamento dei dimmer compatibili:", response.message);
        const dimmerHtml = `
          <div class="container mb-5">
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
          </div>`;
        
        $('#dimmer-container').html(dimmerHtml);
      }
      
      // Nascondiamo il loader
      $('#dimmer-loading').hide();
    },
    error: function(error) {
      // In caso di errore, mostriamo solo l'opzione "nessun dimmer"
      console.error("Errore nella chiamata API dei dimmer:", error);
      const dimmerHtml = `
        <div class="container mb-5">
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
        </div>`;
      
      $('#dimmer-container').html(dimmerHtml);
      $('#dimmer-loading').hide();
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
  
  if (configurazione.alimentazioneSelezionata === 'SENZA_ALIMENTATORE') {
    $('#alimentazione-nome-step5').text('Senza alimentatore');
  } else {
    let alimentazioneText = configurazione.alimentazioneSelezionata === 'ON-OFF' ? 'ON-OFF' : 'Dimmerabile TRIAC';
    $('#alimentazione-nome-step5').text(alimentazioneText);
  }
  
  updateProgressBar(5);
  
  $("#step4-alimentazione").fadeOut(300, function() {
    $("#step5-controllo").fadeIn(300);
    
    prepareControlloListeners();
  });
}

/* Bind event listener per le card di dimmer */
function bindDimmerCardListeners() {
  $('.dimmer-card').on('click', function() {
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
}

/* Event listener per il controllo */
export function prepareControlloListeners() {
  configurazione.dimmerSelezionato = null;
  configurazione.tipoAlimentazioneCavo = null;
  configurazione.uscitaCavoSelezionata = null;
  
  $('#dimmer-warning').hide();
  $('#lunghezza-cavo-uscita-container').hide();
  
  $('#lunghezza-cavo-ingresso').val(1800);
  $('#lunghezza-cavo-uscita').val(1800);
  configurazione.lunghezzaCavoIngresso = 1800;
  configurazione.lunghezzaCavoUscita = 1800;
  
  $('#btn-continua-step5').prop('disabled', true);
  
  $('.alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');
  
  // Carica i dimmer compatibili
  caricaDimmerCompatibili();
  
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
  
  $('#lunghezza-cavo-ingresso, #lunghezza-cavo-uscita').on('change', function() {
    const campo = $(this).attr('id');
    const valore = parseInt($(this).val(), 10) || 0;
    
    if (campo === 'lunghezza-cavo-ingresso') {
      configurazione.lunghezzaCavoIngresso = valore;
    } else if (campo === 'lunghezza-cavo-uscita') {
      configurazione.lunghezzaCavoUscita = valore;
    }
  });
}