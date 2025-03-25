import { salvaConfigurazione, richiedPreventivo } from '../api.js';
import { updateProgressBar } from '../utils.js';

// Questo file ora gestisce solo la funzionalità di riepilogo (ex step7)
export function initStep6Listeners() {
  // Pulsante torna indietro dal riepilogo allo step 5
  $('#btn-torna-step5').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-riepilogo").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      updateProgressBar(5);
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
    salvaConfigurazione(codiceProdotto);
  });
  
  $('#btn-preventivo').on('click', function() {
    richiedPreventivo(codiceProdotto);
  });
}