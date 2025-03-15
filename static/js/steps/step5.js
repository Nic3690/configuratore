/**
 * step5.js
 * Gestione dello step 5 - Controllo (dimmer e cavi)
 */

import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep5Completion } from '../utils.js';
import { vaiAllaPersonalizzazione } from './step6.js';

/**
 * Inizializza gli event listener per lo step 5
 */
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
    
    vaiAllaPersonalizzazione();
  });
}

/**
 * Passa al controllo (dimmer e cavi)
 */
export function vaiAlControllo() {
  console.log("Passaggio al controllo (dimmer e cavi)");
  
  $('#profilo-nome-step5').text(configurazione.nomeModello);
  $('#tipologia-nome-step5').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step5').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
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

/**
 * Prepara gli event listener per il controllo
 */
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
  
  $('.dimmer-card, .alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');
  
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
  
  $('.btn-seleziona-dimmer').on('click', function(e) {
    e.stopPropagation();
    
    const dimmerCard = $(this).closest('.dimmer-card');
    $('.dimmer-card').removeClass('selected');
    dimmerCard.addClass('selected');
    
    const dimmer = dimmerCard.data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
  
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
  
  $('.btn-seleziona-alimentazione-cavo').on('click', function(e) {
    e.stopPropagation();
    
    const alimentazioneCavoCard = $(this).closest('.alimentazione-cavo-card');
    $('.alimentazione-cavo-card').removeClass('selected');
    alimentazioneCavoCard.addClass('selected');
    
    const alimentazioneCavo = alimentazioneCavoCard.data('alimentazione-cavo');
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
  
  $('.btn-seleziona-uscita-cavo').on('click', function(e) {
    e.stopPropagation();
    
    const uscitaCavoCard = $(this).closest('.uscita-cavo-card');
    $('.uscita-cavo-card').removeClass('selected');
    uscitaCavoCard.addClass('selected');
    
    configurazione.uscitaCavoSelezionata = uscitaCavoCard.data('uscita-cavo');
    
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