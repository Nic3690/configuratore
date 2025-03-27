import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniAlimentatore } from '../api.js';
import { vaiAlControllo } from './step5.js';

export function initStep4Listeners() {
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-alimentazione").fadeOut(300, function() {
      if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
        $("#step3-temperatura-potenza").fadeIn(300);
        updateProgressBar(3);
      } else {
        $("#step2-strip").fadeIn(300);
        updateProgressBar(2);
      }
    });
  });
  
  $('#btn-continua-step4').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.alimentazioneSelezionata) {
      alert("Seleziona il tipo di alimentazione prima di continuare");
      return;
    }
    
    if (configurazione.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE' && !configurazione.tipologiaAlimentatoreSelezionata) {
      alert("Seleziona la tipologia di alimentatore prima di continuare");
      return;
    }
    
    // Nascondi completamente questa sezione prima di procedere
    $("#step4-alimentazione").fadeOut(300, function() {
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
  
  $('#alimentatore-section').hide();
  
  $('#btn-continua-step4').prop('disabled', true);
  
  $('.alimentazione-card').removeClass('selected');
  
  // Aggiorna il container delle opzioni di alimentazione
  $('#alimentazione-container').html(`
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
      <div class="card option-card alimentazione-card" data-alimentazione="DIMMERABILE_DALI_PUSH">
        <div class="card-body text-center">
          <h5 class="card-title">Dimmerabile DALI/PUSH</h5>
          <p class="card-text small text-muted">Alimentazione con protocollo DALI o pulsante PUSH</p>
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
  `);
  
  // Riattiva i listener per le card di alimentazione
  $('.alimentazione-card').on('click', function() {
    $('.alimentazione-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazione = $(this).data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
    }
  });
  
  // Per compatibilità con le opzioni di dimmerazione, imposta quale
  // tipo di alimentazione supporta quale tipo di dimmer
  configurazione.compatibilitaAlimentazioneDimmer = {
    'ON-OFF': ['NESSUN_DIMMER'],
    'DIMMERABILE_TRIAC': ['NESSUN_DIMMER', 'DIMMER_A_PULSANTE_SEMPLICE'],
    'DIMMERABILE_DALI_PUSH': ['NESSUN_DIMMER', 'DIMMER_A_PULSANTE_SEMPLICE', 'DIMMERABILE_DALI'],
    'SENZA_ALIMENTATORE': ['NESSUN_DIMMER']
  };
  
  // Aggiungi opzioni speciali se c'è una strip RGB
  if (configurazione.stripLedSelezionata && 
      (configurazione.stripLedSelezionata.includes('RGB') || 
       configurazione.temperaturaColoreSelezionata === 'RGB' || 
       configurazione.temperaturaColoreSelezionata === 'RGBW')) {
    
    configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
    configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
    configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_DALI_PUSH'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
    configurazione.compatibilitaAlimentazioneDimmer['SENZA_ALIMENTATORE'].push('CON_TELECOMANDO', 'CENTRALINA_TUYA');
  }
  
  // Aggiungi TOUCH_SU_PROFILO per strip non-RGB compatibili
  if (configurazione.stripLedSelezionata &&
      !configurazione.stripLedSelezionata.includes('RGB') &&
      configurazione.temperaturaColoreSelezionata !== 'RGB' &&
      configurazione.temperaturaColoreSelezionata !== 'RGBW') {
    
    configurazione.compatibilitaAlimentazioneDimmer['ON-OFF'].push('TOUCH_SU_PROFILO');
    configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_TRIAC'].push('TOUCH_SU_PROFILO');
    configurazione.compatibilitaAlimentazioneDimmer['DIMMERABILE_DALI_PUSH'].push('TOUCH_SU_PROFILO');
  }
}
