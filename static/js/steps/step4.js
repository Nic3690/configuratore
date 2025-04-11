import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniAlimentatore } from '../api.js';
import { vaiAlControllo } from './step5.js';

export function initStep4Listeners() {
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-alimentazione").fadeOut(300, function() {
      // Ora torniamo sempre a step3-temperatura-potenza che include anche la selezione del modello strip LED
      $("#step3-temperatura-potenza").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(3);
    });
  });
  
  $('#btn-continua-step4').on('click', function(e) {
    e.preventDefault();
    
    if (!checkStep4Completion()) {
      // Verifica quali campi mancano
      let messaggi = [];
      
      if (!configurazione.alimentazioneSelezionata) {
        messaggi.push("il tipo di alimentazione");
      } else if (configurazione.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE') {
        if (!configurazione.tipologiaAlimentatoreSelezionata) {
          messaggi.push("la tipologia di alimentatore");
        }
        
        if (!configurazione.potenzaAlimentatoreSelezionata) {
          messaggi.push("la potenza dell'alimentatore");
        }
      }
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
      return;
    }
    
    // Nascondi completamente questa sezione prima di procedere
    $("#step4-alimentazione").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      // Solo dopo che è completamente nascosta, vai alla sezione controllo
      vaiAlControllo();
    });
  });
}

/* Calcola la potenza dell'alimentatore consigliata */
function calcolaPotenzaAlimentatoreConsigliata() {
  // Se non c'è una strip LED o non c'è una potenza selezionata, nascondi la sezione
  if (configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP' || 
      !configurazione.potenzaSelezionata) {
    $('#potenza-consigliata-section').hide();
    return;
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

  // Se abbiamo sia potenza che lunghezza, chiamiamo l'API
  if (potenzaPerMetro > 0 && lunghezzaMetri > 0) {
    $.ajax({
      url: '/calcola_potenza_alimentatore',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        potenzaPerMetro: potenzaPerMetro,
        lunghezzaMetri: lunghezzaMetri
      }),
      success: function(response) {
        if (response.success) {
          // Aggiorna e mostra la sezione con la potenza consigliata
          $('#potenza-consigliata').text(response.potenzaConsigliata);
          $('#potenza-consigliata-section').show();
          
          // Memorizza la potenza consigliata nella configurazione
          configurazione.potenzaConsigliataAlimentatore = response.potenzaConsigliata;
        }
      },
      error: function(error) {
        console.error("Errore nel calcolo della potenza dell'alimentatore:", error);
        $('#potenza-consigliata-section').hide();
      }
    });
  } else {
    $('#potenza-consigliata-section').hide();
  }
}

export function vaiAllAlimentazione() {
  // Assicurati che tutte le altre sezioni siano nascoste
  $(".step-section").hide();
  $('#profilo-nome-step4').text(configurazione.nomeModello);
  $('#tipologia-nome-step4').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    // Usa il nome commerciale se disponibile
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                        mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                        configurazione.stripLedSelezionata;
    
    $('#strip-nome-step4').text(nomeStripLed);
    
    // Aggiungi il badge della potenza solo se abbiamo una potenza selezionata
    if (configurazione.potenzaSelezionata) {
      $('#potenza-nome-step4').text(configurazione.potenzaSelezionata);
      $('#badge-potenza-step4').show();
    } else {
      $('#badge-potenza-step4').hide();
    }
  } else {
    $('#strip-nome-step4').text('Senza Strip LED');
    $('#badge-potenza-step4').hide();
  }
  
  updateProgressBar(4);
  
  // Mostra la sezione di alimentazione
  $("#step4-alimentazione").fadeIn(300);
  
  prepareAlimentazioneListeners();
  
  // Nascondi la sezione della potenza consigliata se non c'è strip LED o non abbiamo una potenza
  if (configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP' ||
      !configurazione.potenzaSelezionata) {
    $('#potenza-consigliata-section').hide();
  } else {
    // Altrimenti calcola la potenza consigliata
    calcolaPotenzaAlimentatoreConsigliata();
  }
}

export function prepareAlimentazioneListeners() {
  configurazione.alimentazioneSelezionata = null;
  configurazione.tipologiaAlimentatoreSelezionata = null;
  configurazione.potenzaAlimentatoreSelezionata = null;
  
  $('#alimentatore-section').hide();
  $('#potenza-alimentatore-section').hide(); // Nascondi la sezione della potenza
  
  $('#btn-continua-step4').prop('disabled', true);
  
  $('.alimentazione-card').removeClass('selected');
  
  // Verifica se la strip LED selezionata è di tipo RGB o RGBWW
  const isRGBStrip = 
    (configurazione.stripLedSelezionata && configurazione.stripLedSelezionata.includes('RGB')) || 
    configurazione.temperaturaColoreSelezionata === 'RGB' || 
    configurazione.temperaturaColoreSelezionata === 'RGBW';
  
  // Prepara l'HTML in base al tipo di strip LED
  let alimentazioneHtml = '';
  
  if (isRGBStrip) {
    // Per strip RGB/RGBWW, mostra solo ON-OFF e SENZA_ALIMENTATORE
    alimentazioneHtml = `
      <div class="col-md-6 mb-3">
        <div class="card option-card alimentazione-card" data-alimentazione="ON-OFF">
          <div class="card-body text-center">
            <h5 class="card-title">ON/OFF</h5>
            <p class="card-text small text-muted">Alimentazione standard ON/OFF</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-3">
        <div class="card option-card alimentazione-card" data-alimentazione="SENZA_ALIMENTATORE">
          <div class="card-body text-center">
            <h5 class="card-title">Senza alimentatore</h5>
            <p class="card-text small text-muted">Configurazione senza alimentatore incluso</p>
          </div>
        </div>
      </div>
    `;
  } else {
    // Per tutte le altre strip, mostra tutte le opzioni
    alimentazioneHtml = `
      <div class="col-md-4 mb-3">
        <div class="card option-card alimentazione-card" data-alimentazione="ON-OFF">
          <div class="card-body text-center">
            <h5 class="card-title">ON/OFF</h5>
            <p class="card-text small text-muted">Alimentazione standard ON/OFF</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card option-card alimentazione-card" data-alimentazione="DIMMERABILE_TRIAC">
          <div class="card-body text-center">
            <h5 class="card-title">Dimmerabile TRIAC</h5>
            <p class="card-text small text-muted">Alimentazione con controllo dell'intensità luminosa TRIAC</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card option-card alimentazione-card" data-alimentazione="SENZA_ALIMENTATORE">
          <div class="card-body text-center">
            <h5 class="card-title">Senza alimentatore</h5>
            <p class="card-text small text-muted">Configurazione senza alimentatore incluso</p>
          </div>
        </div>
      </div>
    `;
  }
  
  // Aggiorna il container delle opzioni di alimentazione
  $('#alimentazione-container').html(alimentazioneHtml);

  // Se c'è una sola opzione di alimentazione disponibile (caso raro ma possibile)
  const opzioniAlimentazione = $('.alimentazione-card');
  if (opzioniAlimentazione.length === 1) {
    const $unicaAlimentazione = $(opzioniAlimentazione[0]);
    $unicaAlimentazione.addClass('selected');
    const alimentazione = $unicaAlimentazione.data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      $('#potenza-alimentatore-section').hide(); // Nascondi anche la sezione potenza
      configurazione.tipologiaAlimentatoreSelezionata = null;
      configurazione.potenzaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
      $('#potenza-alimentatore-section').hide(); // Nascondi la sezione potenza fino a quando non viene scelto un alimentatore
      $('#btn-continua-step4').prop('disabled', true);
    }
  } else {
    // Se ci sono più opzioni, non selezionare nessuna opzione di default
    configurazione.alimentazioneSelezionata = null;
    $('#alimentatore-section').hide();
    $('#potenza-alimentatore-section').hide();
    $('#btn-continua-step4').prop('disabled', true);
  }
  
  // Riattiva i listener per le card di alimentazione
  $('.alimentazione-card').on('click', function() {
    $('.alimentazione-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazione = $(this).data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      $('#potenza-alimentatore-section').hide(); // Nascondi anche la sezione potenza
      configurazione.tipologiaAlimentatoreSelezionata = null;
      configurazione.potenzaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
      $('#potenza-alimentatore-section').hide(); // Nascondi la sezione potenza fino a quando non viene scelto un alimentatore
      $('#btn-continua-step4').prop('disabled', true);
    }
  });

  // Per compatibilità con le opzioni di dimmerazione, imposta quale
  // tipo di alimentazione supporta quale tipo di dimmer
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
  
  // Verifica il completamento iniziale
  checkStep4Completion();
}

export function checkStep4Completion() {
  let isComplete = true;
  
  if (!configurazione.alimentazioneSelezionata) {
    isComplete = false;
  }
  
  if (configurazione.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE') {
    if (!configurazione.tipologiaAlimentatoreSelezionata) {
      isComplete = false;
    }
    
    if (!configurazione.potenzaAlimentatoreSelezionata) {
      isComplete = false;
    }
  }
  
  $('#btn-continua-step4').prop('disabled', !isComplete);
  return isComplete;
}
