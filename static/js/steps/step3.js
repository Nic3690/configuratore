import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniPotenza } from '../api.js';
import { vaiAllAlimentazione } from './step4.js';

export function initStep3Listeners() {
  $('#btn-torna-step2').on('click', function(e) {
    e.preventDefault();
    
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step2-strip").fadeIn(300);
      
      updateProgressBar(2);
    });
  });
  
  $('#btn-continua-step3').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.potenzaSelezionata) {
      vaiAllAlimentazione();
    } else {
      alert("Seleziona temperatura e potenza prima di continuare");
    }
  });
}

/* Selezione temperatura e potenza */
export function vaiAllaTemperaturaEPotenza() {
  console.log("Passaggio alla temperatura e potenza");
  
  $('#profilo-nome-step3').text(configurazione.nomeModello);
  $('#tipologia-nome-step3').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#strip-nome-step3').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  
  updateProgressBar(3);
  
  $("#step2-strip").fadeOut(300, function() {
    $("#step3-temperatura-potenza").fadeIn(300);
    
    caricaOpzioniPotenza(configurazione.stripLedSelezionata, "3000K");
  });
}
