/**
 * step7.js
 * Gestione dello step 7 - Riepilogo
 */

import { salvaConfigurazione, richiedPreventivo } from '../api.js';

/**
 * Inizializza gli event listener per lo step 7
 */
export function initStep7Listeners() {
  $('#btn-torna-step6').on('click', function(e) {
    e.preventDefault();
    
    $("#step7-riepilogo").fadeOut(300, function() {
      $("#step6-personalizzazione").fadeIn(300);
      
      updateProgressBar(6);
    });
  });
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