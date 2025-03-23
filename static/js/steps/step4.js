import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniAlimentatore } from '../api.js';
import { vaiAlControllo } from './step5.js';

export function initStep4Listeners() {
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-alimentazione").fadeOut(300, function() {
      if (configurazione.stripLedSelezionata !== 'senza_strip') {
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

/* Passa all'alimentazione */
export function vaiAllAlimentazione() {
  console.log("Passaggio all'alimentazione");
  
  $('#profilo-nome-step4').text(configurazione.nomeModello);
  $('#tipologia-nome-step4').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step4').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
    
    if (configurazione.potenzaSelezionata) {
      $('#potenza-nome-step4').text(configurazione.potenzaSelezionata);
      $('#badge-potenza-step4').show();
    } else {
      $('#badge-potenza-step4').hide();
    }
  } else {
    $('#strip-nome-step4').text('Senza Strip LED');
    $('#badge-temperatura-step4').hide();
    $('#badge-potenza-step4').hide();
  }
  
  updateProgressBar(4);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      prepareAlimentazioneListeners();
    });
  } else {
    $("#step2-strip").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      prepareAlimentazioneListeners();
    });
  }
}

/* Event listener per l'alimentazione */
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
