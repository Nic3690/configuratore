import { richiediPreventivo } from '../api.js';
import { updateProgressBar } from '../utils.js';
import { configurazione } from '../config.js';
import { generaPDF } from '../pdf.js';

// Questo file ora gestisce solo la funzionalità di riepilogo (rinominato da step6 a step7)
export function initStep7Listeners() {
  // Pulsante torna indietro dal riepilogo - MODIFICATO per gestire diversi casi
  $('#btn-torna-step6').on('click', function(e) {
    e.preventDefault();
    
    $("#step7-riepilogo").fadeOut(300, function() {
      // Verifica se la configurazione include una strip LED
      if (configurazione.stripLedSelezionata === 'NO_STRIP' || 
          configurazione.stripLedSelezionata === 'senza_strip' || 
          configurazione.includeStripLed === false) {
        
        // Se non c'è strip LED, torna allo step 2 (personalizzazione)
        $("#step2-personalizzazione").fadeIn(300);
        updateProgressBar(2);
      } else {
        // Altrimenti torna allo step 6 (proposte)
        $("#step6-proposte").fadeIn(300);
        updateProgressBar(6);
      }
    });
  });

  // Questi listener vengono inizializzati dinamicamente quando viene creato il riepilogo
  // poiché i pulsanti non esistono fino a quel momento
}

/**
 * Inizializza gli event listener per le operazioni finali
 * @param {string} codiceProdotto - Codice prodotto finale
 */
export function initRiepilogoOperationsListeners(codiceProdotto) {
  $('#btn-salva-configurazione').on('click', function() {
    generaPDF(codiceProdotto, configurazione);
  });
  
  $('#btn-preventivo').on('click', function() {
    richiediPreventivo(codiceProdotto);
  });
}