import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { finalizzaConfigurazione } from '../api.js';

export function initStep6Listeners() {
  // Torna da proposte a controllo (step 5)
  $('#btn-torna-step5-from-proposte').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-proposte").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      updateProgressBar(5);
    });
  });
  
  // Continua dalle proposte al riepilogo (step 7)
  $('#btn-continua-step6').on('click', function(e) {
    e.preventDefault();
    
    // Passiamo al riepilogo
    finalizzaConfigurazione();
  });

  // Gestione delle proposte di lunghezza standard
  $('.btn-seleziona-proposta').on('click', function() {
    const proposta = $(this).data('proposta');
    const valore = parseInt($(this).data('valore'), 10);
    
    if (proposta === 1) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    } else if (proposta === 2) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    }
    
    // Abilita il pulsante per continuare
    $('#btn-continua-step6').prop('disabled', false);
  });
}

export function vaiAlleProposte() {
  // Popola i badge con le informazioni correnti
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    // Usa il nome commerciale se disponibile
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                         mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                         configurazione.stripLedSelezionata;
    
    $('#strip-nome-step6').text(nomeStripLed);
  } else {
    $('#strip-nome-step6').text('Senza Strip LED');
  }
  
  // Imposta i valori delle lunghezze
  $('#lunghezza-attuale').text(configurazione.lunghezzaRichiesta || 0);
  $('#step6-lunghezza-finale').text(configurazione.lunghezzaRichiesta || 0);
  
  // Mostra le proposte calcolate
  if (configurazione.proposta1) {
    $('#step6-proposta1-valore').text(configurazione.proposta1 + 'mm');
    $('.btn-seleziona-proposta[data-proposta="1"]').data('valore', configurazione.proposta1);
  }
  
  if (configurazione.proposta2) {
    $('#step6-proposta2-valore').text(configurazione.proposta2 + 'mm');
    $('.btn-seleziona-proposta[data-proposta="2"]').data('valore', configurazione.proposta2);
  }
  
  // Imposta lo spazio di produzione
  $('#step6-spazio-produzione').text(configurazione.spazioProduzione || 5);
  
  // Se una lunghezza è già selezionata, abilita il pulsante per continuare
  if (configurazione.lunghezzaRichiesta) {
    $('#btn-continua-step6').prop('disabled', false);
  } else {
    $('#btn-continua-step6').prop('disabled', true);
  }
  
  // Aggiorna il progress bar
  updateProgressBar(6);
  
  // Nascondi tutti gli altri step e mostra questo
  $(".step-section").hide();
  $("#step6-proposte").fadeIn(300);
}