import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniPotenza, caricaStripLedCompatibili } from '../api.js';
import { vaiAllAlimentazione } from './step4.js';
import { vaiAllaSelezioneLedStrip } from './step3_strip.js';

export function initStep3Listeners() {
  $('#btn-torna-step2').on('click', function(e) {
    e.preventDefault();
    
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step2-parametri").fadeIn(300);
      
      updateProgressBar(3);
    });
  });
  
  $('#btn-continua-step3').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.potenzaSelezionata) {
      // Modificato: Ora va al nuovo step di selezione strip LED
      $("#step3-temperatura-potenza").fadeOut(300, function() {
        vaiAllaSelezioneLedStrip();
      });
    } else {
      alert("Seleziona temperatura e potenza prima di continuare");
    }
  });
}

/* Selezione temperatura e potenza */
export function vaiAllaTemperaturaEPotenza() {
  // Seleziona automaticamente una strip LED basata sui parametri (questa servirà come default)
  selezionaStripLedAutomaticamente();
  
  $('#profilo-nome-step3').text(configurazione.nomeModello);
  $('#tipologia-nome-step3').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#strip-nome-step3').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  
  // Aggiorna la barra di progresso a 3
  updateProgressBar(3);
  
  // Assicurati che tutte le altre sezioni siano nascoste
  $(".step-section").hide();
  
  // Poi mostra solo la sezione corrente
  $("#step3-temperatura-potenza").fadeIn(300);
  
  caricaOpzioniPotenza(configurazione.stripLedSelezionata, configurazione.temperaturaSelezionata);
}

// Seleziona automaticamente una strip LED basata sui parametri scelti
function selezionaStripLedAutomaticamente() {
  // Costruiamo l'ID della strip LED basato sui parametri selezionati
  let stripId = '';
  
  // Se è SMD
  if (configurazione.tipologiaStripSelezionata === 'SMD') {
    stripId = `STRIP_${configurazione.tensioneSelezionato}_SMD_${configurazione.ipSelezionato}`;
  }
  // Se è COB
  else if (configurazione.tipologiaStripSelezionata === 'COB') {
    stripId = `STRIP_${configurazione.tensioneSelezionato}_COB_${configurazione.ipSelezionato}`;
  }
  // Se è RGB
  else if (configurazione.temperaturaSelezionata === 'RGB') {
    if (configurazione.tipologiaStripSelezionata === 'SMD') {
      stripId = `STRIP_${configurazione.tensioneSelezionato}_RGB_SMD_${configurazione.ipSelezionato}`;
    } else if (configurazione.tipologiaStripSelezionata === 'COB') {
      stripId = `STRIP_${configurazione.tensioneSelezionato}_RGB_COB_${configurazione.ipSelezionato}`;
    }
  }
  // Special strips (per semplicità, usano lo stesso pattern come SMD)
  else if (configurazione.tipologiaStripSelezionata === 'SPECIAL') {
    stripId = `STRIP_${configurazione.tensioneSelezionato}_SMD_${configurazione.ipSelezionato}`;
  }
  
  // Impostazione della stripLedSelezionata nella configurazione
  configurazione.stripLedSelezionata = stripId;
  
  // Memorizza anche la temperatura selezionata
  configurazione.temperaturaColoreSelezionata = configurazione.temperaturaSelezionata;
}