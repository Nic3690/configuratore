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
    
    vaiAlControllo();
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
  
  // Transizione dallo step di strip direttamente all'alimentazione
  $("#step2-strip").fadeOut(300, function() {
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
  });
}

export function prepareAlimentazioneListeners() {
  configurazione.alimentazioneSelezionata = null;
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  $('#alimentatore-section').hide();
  
  $('#btn-continua-step4').prop('disabled', true);
  
  $('.alimentazione-card').removeClass('selected');
  
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
}
