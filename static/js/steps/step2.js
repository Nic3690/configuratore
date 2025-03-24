import { configurazione, mappaTipologieVisualizzazione, mappaVoltaggioVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { formatTemperatura, updateProgressBar } from '../utils.js';
import { caricaOpzioniParametri, caricaStripLedFiltrate } from '../api.js';
import { vaiAllaTemperaturaEPotenza } from './step3.js';

export function initStep2Listeners() {
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
      vaiAiParametriStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.profiloSelezionato) messaggi.push("un profilo");
      if (!configurazione.tipologiaSelezionata) messaggi.push("una tipologia");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  $('#btn-torna-step2-parametri').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-parametri").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      updateProgressBar(2);
    });
  });
  
  $('#btn-continua-parametri').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.voltaggioSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
      vaiAllaSelezioneDiStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.voltaggioSelezionato) messaggi.push("un voltaggio");
      if (!configurazione.ipSelezionato) messaggi.push("un grado IP");
      if (!configurazione.temperaturaSelezionata) messaggi.push("una temperatura");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  $('#btn-torna-parametri-strip').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-strip").fadeOut(300, function() {
      $("#step2-parametri").fadeIn(300);
    });
  });
  
  $('#btn-continua-strip').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.stripLedSelezionata) {
      if (configurazione.stripLedSelezionata === 'senza_strip') {
        vaiAllAlimentazione();
      } else {
        vaiAllaTemperaturaEPotenza();
      }
    } else {
      alert("Seleziona una strip LED prima di continuare");
    }
  });
}

/* Selezione parametri Strip LED */
export function vaiAiParametriStripLed() {
  
  $('#profilo-nome-step2-parametri').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-parametri').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-modello").fadeOut(300, function() {
    $("#step2-parametri").fadeIn(300);
    
    updateProgressBar(2);
    caricaOpzioniParametri(configurazione.profiloSelezionato);
  });
}

/* Selezione strip LED */
export function vaiAllaSelezioneDiStripLed() {
  
  $('#profilo-nome-step2-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#voltaggio-nome-step2-strip').text(mappaVoltaggioVisualizzazione[configurazione.voltaggioSelezionato] || configurazione.voltaggioSelezionato);
  $('#ip-nome-step2-strip').text(mappaIPVisualizzazione[configurazione.ipSelezionato] || configurazione.ipSelezionato);
  $('#temperatura-nome-step2-strip').text(formatTemperatura(configurazione.temperaturaSelezionata));
  
  $("#step2-parametri").fadeOut(300, function() {
    $("#step2-strip").fadeIn(300);
    
    caricaStripLedFiltrate(
      configurazione.profiloSelezionato, 
      configurazione.voltaggioSelezionato, 
      configurazione.ipSelezionato, 
      configurazione.temperaturaSelezionata
    );
  });
}
