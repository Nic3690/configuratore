import { configurazione, mappaTipologieVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { caricaStripLedCompatibili } from '../api.js';
import { vaiAllAlimentazione } from './step4.js';

// Inizializza i listener per la selezione della strip LED
export function initStripSelectionListeners() {
  // Listener per il pulsante indietro
  $('#btn-torna-step3-potenza').on('click', function(e) {
    e.preventDefault();
    
    $("#step3-strip-selection").fadeOut(300, function() {
      $("#step3-temperatura-potenza").fadeIn(300);
    });
  });
  
  // Listener per il pulsante continua
  $('#btn-continua-step3-strip').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.stripLedSceltaFinale) {
      $("#step3-strip-selection").fadeOut(300, function() {
        vaiAllAlimentazione();
      });
    } else {
      alert("Seleziona un modello di strip LED prima di continuare");
    }
  });
}

// Funzione per andare alla selezione del modello di strip LED
export function vaiAllaSelezioneLedStrip() {
  // Popola i badge con le informazioni correnti
  $('#profilo-nome-step3-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step3-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#tensione-nome-step3-strip').text(configurazione.tensioneSelezionato);
  $('#ip-nome-step3-strip').text(configurazione.ipSelezionato);
  $('#temperatura-nome-step3-strip').text(configurazione.temperaturaSelezionata);
  $('#potenza-nome-step3-strip').text(configurazione.potenzaSelezionata);
  
  // Reset della selezione
  configurazione.stripLedSceltaFinale = null;
  $('#btn-continua-step3-strip').prop('disabled', true);
  
  // Nascondi tutte le sezioni e mostra quella corrente
  $(".step-section").hide();
  $("#step3-strip-selection").fadeIn(300);
  
  // Carica le strip LED compatibili
  caricaStripLedCompatibili(
    configurazione.profiloSelezionato,
    configurazione.tensioneSelezionato,
    configurazione.ipSelezionato,
    configurazione.temperaturaSelezionata,
    configurazione.potenzaSelezionata,
    configurazione.tipologiaStripSelezionata
  );
  
  // Manteniamo la barra di progresso a 3 perché è ancora parte dello step 3
  updateProgressBar(3);
}