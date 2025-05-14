import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniAlimentatore } from '../api.js';
import { vaiAlControllo } from './step5.js';

export function initStep4Listeners() {
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-alimentazione").fadeOut(300, function() {
      $("#step3-temperatura-potenza").fadeIn(300);
      updateProgressBar(3);
    });
  });
  
  $('#btn-continua-step4').on('click', function(e) {
    e.preventDefault();
    
    if (!checkStep4Completion()) {
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

    $("#step4-alimentazione").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      vaiAlControllo();
    });
  });
}

function calcolaPotenzaAlimentatoreConsigliata() {
  if (configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP' || 
      !configurazione.potenzaSelezionata) {
    $('#potenza-consigliata-section').hide();
    return;
  }

  let potenzaPerMetro = 0;
  const potenzaMatch = configurazione.potenzaSelezionata.match(/(\d+(\.\d+)?)/);
  if (potenzaMatch && potenzaMatch[1]) {
    potenzaPerMetro = parseFloat(potenzaMatch[1]);
  }

  let lunghezzaMetri = 0;
  if (configurazione.lunghezzaRichiesta) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaRichiesta) / 1000;
  } else if (configurazione.lunghezzaSelezionata) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaSelezionata) / 1000;
  }

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
          $('#potenza-consigliata').text(response.potenzaConsigliata);
          $('#potenza-consigliata-section').show();

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
  $(".step-section").hide();
  $('#profilo-nome-step4').text(configurazione.nomeModello);
  $('#tipologia-nome-step4').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                        mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                        configurazione.stripLedSelezionata;
    
    $('#strip-nome-step4').text(nomeStripLed);

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

$("#step4-alimentazione").fadeIn(300);

if (configurazione.tensioneSelezionato === '220V') {
  $('#alimentazione-container').html(`
    <div class="alert alert-info mb-3">
      <strong>Nota:</strong> Per strip LED 220V non è necessario un alimentatore aggiuntivo, in quanto si collegano direttamente alla rete elettrica.
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <div class="card option-card alimentazione-card selected" data-alimentazione="SENZA_ALIMENTATORE">
          <div class="card-body text-center">
            <h5 class="card-title">Senza alimentatore</h5>
            <p class="card-text small text-muted">Strip LED 220V (collegamento diretto)</p>
          </div>
        </div>
      </div>
    </div>
  `);
  
  configurazione.alimentazioneSelezionata = "SENZA_ALIMENTATORE";
  $('#alimentatore-section').hide();
  $('#potenza-alimentatore-section').hide();
  $('#btn-continua-step4').prop('disabled', false);
}

prepareAlimentazioneListeners();

  if (configurazione.stripLedSelezionata === 'senza_strip' || 
      configurazione.stripLedSelezionata === 'NO_STRIP' ||
      !configurazione.potenzaSelezionata) {
    $('#potenza-consigliata-section').hide();
  } else {
    calcolaPotenzaAlimentatoreConsigliata();
  }
}

export function prepareAlimentazioneListeners() {
  configurazione.alimentazioneSelezionata = null;
  configurazione.tipologiaAlimentatoreSelezionata = null;
  configurazione.potenzaAlimentatoreSelezionata = null;
  
  $('#alimentatore-section').hide();
  $('#potenza-alimentatore-section').hide();
  
  $('#btn-continua-step4').prop('disabled', true);
  
  $('.alimentazione-card').removeClass('selected');

  const isRGBStrip = 
    (configurazione.stripLedSelezionata && configurazione.stripLedSelezionata.includes('RGB')) || 
    configurazione.temperaturaColoreSelezionata === 'RGB' || 
    configurazione.temperaturaColoreSelezionata === 'RGBW';

  let alimentazioneHtml = '';
  
  if (isRGBStrip) {
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

  $('#alimentazione-container').html(alimentazioneHtml);

  const opzioniAlimentazione = $('.alimentazione-card');
  if (opzioniAlimentazione.length === 1) {
    const $unicaAlimentazione = $(opzioniAlimentazione[0]);
    $unicaAlimentazione.addClass('selected');
    const alimentazione = $unicaAlimentazione.data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      $('#potenza-alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      configurazione.potenzaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
      $('#potenza-alimentatore-section').hide();
      $('#btn-continua-step4').prop('disabled', true);
    }
  } else {
    configurazione.alimentazioneSelezionata = null;
    $('#alimentatore-section').hide();
    $('#potenza-alimentatore-section').hide();
    $('#btn-continua-step4').prop('disabled', true);
  }

  $('.alimentazione-card').on('click', function() {
    $('.alimentazione-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazione = $(this).data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      $('#potenza-alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      configurazione.potenzaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
      $('#potenza-alimentatore-section').hide();
      $('#btn-continua-step4').prop('disabled', true);
    }
  });

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
