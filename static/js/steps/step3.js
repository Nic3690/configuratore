import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaOpzioniPotenza, caricaStripLedCompatibili } from '../api.js';
import { vaiAllAlimentazione } from './step4.js';

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
    
    if (configurazione.potenzaSelezionata && configurazione.stripLedSceltaFinale) {
      // Ora passiamo direttamente all'alimentazione, saltando la selezione strip
      $("#step3-temperatura-potenza").fadeOut(300, function() {
        vaiAllAlimentazione();
      });
    } else {
      if (!configurazione.potenzaSelezionata) {
        alert("Seleziona una potenza prima di continuare");
      } else if (!configurazione.stripLedSceltaFinale) {
        alert("Seleziona un modello di strip LED prima di continuare");
      }
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
  
  // Resetta la scelta del modello
  configurazione.stripLedSceltaFinale = null;
  $('#strip-led-model-section').hide();
  $('#btn-continua-step3').prop('disabled', true);
  
  // Carica le opzioni di potenza
  caricaOpzioniPotenza(configurazione.profiloSelezionato, configurazione.temperaturaSelezionata);
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

// Aggiungiamo il listener per il click sulle card potenza con la nuova logica
export function initPotenzaListener() {
  $(document).off('click', '.potenza-card').on('click', '.potenza-card', function() {
    $('.potenza-card').removeClass('selected');
    $(this).addClass('selected');
    configurazione.potenzaSelezionata = $(this).data('potenza');
    configurazione.codicePotenza = $(this).data('codice');
    
    // Mostra la sezione di selezione modello e carica i modelli compatibili
    $('#strip-led-model-section').show();
    caricaStripLedCompatibili(
      configurazione.profiloSelezionato,
      configurazione.tensioneSelezionato,
      configurazione.ipSelezionato,
      configurazione.temperaturaSelezionata,
      configurazione.potenzaSelezionata,
      configurazione.tipologiaStripSelezionata
    );
    
    // Il pulsante continua rimane disabilitato finché non si seleziona un modello
    $('#btn-continua-step3').prop('disabled', true);
  });
  
  // Aggiungiamo il listener per la selezione del modello strip LED
  $(document).off('click', '.strip-led-compatibile-card').on('click', '.strip-led-compatibile-card', function() {
    $('.strip-led-compatibile-card').removeClass('selected');
    $(this).addClass('selected');
    
    const stripId = $(this).data('strip-id');
    const nomeCommerciale = $(this).data('nome-commerciale') || '';
    
    configurazione.stripLedSceltaFinale = stripId;
    configurazione.nomeCommercialeStripLed = nomeCommerciale;
    configurazione.stripLedSelezionata = stripId;
    
    // Ora che abbiamo sia la potenza che il modello, possiamo abilitare il pulsante continua
    $('#btn-continua-step3').prop('disabled', false);
  });
}