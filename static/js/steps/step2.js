import { configurazione, mappaTipologieVisualizzazione, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { formatTemperatura, updateProgressBar } from '../utils.js';
import { caricaOpzioniParametri, caricaStripLedFiltrate } from '../api.js';
import { vaiAllaTemperaturaEPotenza } from './step3.js';
import { vaiAllAlimentazione } from './step4.js';
import { vaiAllaPersonalizzazione } from './step6.js';

export function initStep2Listeners() {
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
      vaiAlleOpzioniStripLed(); // Mostra prima le opzioni sì/no per la strip LED
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
      $("#step2-option-strip").fadeIn(300); // Torna alle opzioni strip LED anziché al modello
      
      updateProgressBar(2);
    });
  });
  
  $('#btn-continua-parametri').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.tensioneSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
      vaiAllaSelezioneDiStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.tensioneSelezionato) messaggi.push("un tensione");
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
      if (configurazione.stripLedSelezionata === 'senza_strip' || configurazione.stripLedSelezionata === 'NO_STRIP') {
        vaiAllAlimentazione();
      } else {
        vaiAllaTemperaturaEPotenza();
      }
    } else {
      alert("Seleziona una strip LED prima di continuare");
    }
  });
  
  // Nuovi event listener per la sezione delle opzioni strip LED
  $('#btn-torna-step2-option').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-option-strip").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
    });
  });
  
  // Utilizziamo document.on per assicurarci che l'evento funzioni anche se gli elementi vengono aggiunti dinamicamente
  $(document).on('click', '.strip-option-card', function() {
    $('.strip-option-card').removeClass('selected');
    $(this).addClass('selected');
    
    const opzione = $(this).data('option');
    configurazione.includeStripLed = opzione === 'si';
    
    $('#btn-continua-step2-option').prop('disabled', false);
  });
  
  $('#btn-continua-step2-option').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.includeStripLed === undefined) {
      alert("Seleziona se includere o meno una strip LED prima di continuare");
      return;
    }
    
    if (configurazione.includeStripLed) {
      // L'utente ha scelto di includere una strip LED, continua con il flusso normale
      vaiAiParametriStripLed();
    } else {
      // L'utente ha scelto di non includere una strip LED, salta direttamente alla personalizzazione
      configurazione.stripLedSelezionata = 'NO_STRIP';
      updateProgressBar(6); // Aggiorna la barra di progresso allo step 6
      vaiAllaPersonalizzazione();
    }
  });
}

/**
 * Aggiunge i badge di compatibilità alle card dei profili
 * @param {Object} profilo - Oggetto profilo da visualizzare
 * @param {jQuery} $cardBody - Elemento jQuery del corpo della card
 */
export function aggiungiCompatibilitaBadge(profilo, $cardBody) {
  // Aggiungi il badge di compatibilità con le strip LED
  if (profilo.stripLedCompatibiliInfo && profilo.stripLedCompatibiliInfo.length > 0) {
    const stripCount = profilo.stripLedCompatibiliInfo.length;
    
    // Crea il badge di compatibilità
    const $compatibilityBadge = $('<div class="compatibility-badge mt-2">')
      .append($('<span class="badge bg-success">').text(`Strip LED compatibili: ${stripCount}`));
    
    // Aggiungi tooltip con informazioni sulle strip compatibili
    let tooltipContent = "Strip LED compatibili: ";
    const stripNomi = profilo.stripLedCompatibiliInfo
      .filter(s => s.nomeCommerciale)
      .map(s => s.nomeCommerciale)
      .filter((v, i, a) => a.indexOf(v) === i); // Rimuovi duplicati
    
    if (stripNomi.length > 0) {
      tooltipContent += stripNomi.join(", ");
      $compatibilityBadge.attr('title', tooltipContent)
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'top');
    }
    
    $cardBody.append($compatibilityBadge);
  }
}

// Nuova funzione per mostrare le opzioni sì/no per la strip LED
export function vaiAlleOpzioniStripLed() {
  $('#profilo-nome-step2-option').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-option').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-modello").fadeOut(300, function() {
    $("#step2-option-strip").fadeIn(300);
    
    // Reset dello stato delle card e del pulsante "Continua"
    $('.strip-option-card').removeClass('selected');
    $('#btn-continua-step2-option').prop('disabled', true);
    configurazione.includeStripLed = undefined;
  });
}

/* Selezione parametri Strip LED */
export function vaiAiParametriStripLed() {
  
  $('#profilo-nome-step2-parametri').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-parametri').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-option-strip").fadeOut(300, function() { // Modifica qui: fadeOut da option-strip invece che da modello
    $("#step2-parametri").fadeIn(300);
    
    updateProgressBar(2);
    caricaOpzioniParametri(configurazione.profiloSelezionato);
  });
}

/* Selezione strip LED */
export function vaiAllaSelezioneDiStripLed() {
  
  $('#profilo-nome-step2-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#tensione-nome-step2-strip').text(mappaTensioneVisualizzazione[configurazione.tensioneSelezionato] || configurazione.tensioneSelezionato);
  $('#ip-nome-step2-strip').text(mappaIPVisualizzazione[configurazione.ipSelezionato] || configurazione.ipSelezionato);
  $('#temperatura-nome-step2-strip').text(formatTemperatura(configurazione.temperaturaSelezionata));
  
  $("#step2-parametri").fadeOut(300, function() {
    $("#step2-strip").fadeIn(300);
    
    caricaStripLedFiltrate(
      configurazione.profiloSelezionato, 
      configurazione.tensioneSelezionato, 
      configurazione.ipSelezionato, 
      configurazione.temperaturaSelezionata
    );
  });
}

// Funzione che memorizza il nome commerciale della strip LED selezionata
export function memorizzaNomeCommercialeStripLed(stripId) {
  // Chiamata al server per ottenere il nome commerciale
  $.ajax({
    url: `/get_nomi_commerciali/${stripId}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        configurazione.nomeCommercialeStripLed = response.nomeCommerciale;
        configurazione.codiciProdottoStripLed = response.codiciProdotto;
        
        // Aggiorna l'etichetta nella UI se necessario
        $('.strip-led-nome-commerciale').text(configurazione.nomeCommercialeStripLed);
      }
    },
    error: function(error) {
      console.error("Errore nel recupero del nome commerciale:", error);
    }
  });
}