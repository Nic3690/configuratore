import { configurazione, mappaTipologieVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep2Completion, checkPersonalizzazioneCompletion, formatTemperatura } from '../utils.js';
import { caricaOpzioniParametri, caricaStripLedFiltrate, caricaFinitureDisponibili, calcolaProposte, finalizzaConfigurazione } from '../api.js';
import { vaiAllaTemperaturaEPotenza } from './step3.js';
import { vaiAllAlimentazione } from './step4.js';

export function initStep2Listeners() {
  // Primo pulsante continua - dopo selezione profilo/tipologia
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
      vaiAllaPersonalizzazione(); // Ora va prima alla personalizzazione
    } else {
      let messaggi = [];
      if (!configurazione.profiloSelezionato) messaggi.push("un profilo");
      if (!configurazione.tipologiaSelezionata) messaggi.push("una tipologia");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  // NUOVO: Button torna dalla personalizzazione al modello
  $('#btn-torna-step2-modello').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-personalizzazione").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
    });
  });
  
  // NUOVO: Button continua dalla personalizzazione alle opzioni strip
  $('#btn-continua-personalizzazione').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.formaDiTaglioSelezionata) {
      alert("Seleziona una forma di taglio prima di continuare");
      return;
    }
    
    if (!configurazione.finituraSelezionata) {
      alert("Seleziona una finitura prima di continuare");
      return;
    }
    
    if (!configurazione.lunghezzaRichiesta && configurazione.tipologiaSelezionata === 'taglio_misura') {
      alert("Inserisci una lunghezza prima di continuare");
      return;
    }
    
    vaiAlleOpzioniStripLed(); // Dopo personalizzazione, va alle opzioni strip
  });
  
  // MODIFICATO: Pulsante torna dalle opzioni strip alla personalizzazione
  $('#btn-torna-step2-personalizzazione').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-option-strip").fadeOut(300, function() {
      $("#step2-personalizzazione").fadeIn(300);
    });
  });
  
  // Resto dell'initStep2Listeners rimane invariato
  $('#btn-torna-step2-parametri').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-parametri").fadeOut(300, function() {
      $("#step2-option-strip").fadeIn(300); // Torna alle opzioni strip LED anziché al modello
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
      // L'utente ha scelto di non includere una strip LED
      configurazione.stripLedSelezionata = 'NO_STRIP';
      $("#step2-option-strip").fadeOut(300, function() {
        updateProgressBar(6); // Aggiorniamo la barra di progresso
        finalizzaConfigurazione(); // Ora questa funzione si occuperà solo di mostrare il riepilogo
      });
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

// NUOVO: Funzione per andare alla personalizzazione 
export function vaiAllaPersonalizzazione() {
  $('#profilo-nome-step2-personalizzazione').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-personalizzazione').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-modello").fadeOut(300, function() {
    $("#step2-personalizzazione").fadeIn(300);
    
    preparePersonalizzazioneListeners();
  });
}

// NUOVO: Funzione di preparazione della personalizzazione (spostata da step6.js)
export function preparePersonalizzazioneListeners() {
  configurazione.formaDiTaglioSelezionata = "DRITTO_SEMPLICE";
  caricaFinitureDisponibili(configurazione.profiloSelezionato);
  $('.forma-taglio-card[data-forma="DRITTO_SEMPLICE"]').addClass('selected');
  
  $('.forma-taglio-card').on('click', function() {
    $('.forma-taglio-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.formaDiTaglioSelezionata = $(this).data('forma');
    
    updateIstruzioniMisurazione(configurazione.formaDiTaglioSelezionata);
    checkPersonalizzazioneCompletion();
  });
  
  $('.finitura-card').on('click', function() {
    $('.finitura-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.finituraSelezionata = $(this).data('finitura');
    
    checkPersonalizzazioneCompletion();
  });

  $('#lunghezza-personalizzata').on('input', function() {
    configurazione.lunghezzaRichiesta = parseInt($(this).val(), 10) || null;
    
    if (configurazione.lunghezzaRichiesta && configurazione.lunghezzaRichiesta > 0) {
      calcolaProposte(configurazione.lunghezzaRichiesta);
    } else {
      $('#proposte-container').hide();
    }
    
    checkPersonalizzazioneCompletion();
  });
  
  $('.btn-seleziona-proposta').on('click', function() {
    const proposta = $(this).data('proposta');
    const valore = parseInt($(this).data('valore'), 10);
    
    if (proposta === 1) {
      configurazione.lunghezzaRichiesta = valore;
      $('#lunghezza-personalizzata').val(valore);
    } else if (proposta === 2) {
      configurazione.lunghezzaRichiesta = valore;
      $('#lunghezza-personalizzata').val(valore);
    }
    
    checkPersonalizzazioneCompletion();
  });
  
  updateIstruzioniMisurazione('DRITTO_SEMPLICE');
  
  checkPersonalizzazioneCompletion();
}

// NUOVO: Funzione per aggiornare le istruzioni di misurazione (spostata da step6.js)
export function updateIstruzioniMisurazione(forma) {
  const istruzioniContainer = $('#istruzioni-misurazione');
  istruzioniContainer.empty();

  switch(forma) {
    case 'DRITTO_SEMPLICE':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/dritto_semplice.png" alt="Forma dritta" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'FORMA_L_DX':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_l_dx.png" alt="Forma a L destra" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'FORMA_L_SX':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_l_sx.png" alt="Forma a L sinistra" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'FORMA_C':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_c.png" alt="Forma a C" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'RETTANGOLO_QUADRATO':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_rettangolo.png" alt="Forma rettangolare" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    default:
      istruzioniContainer.html(`<p>Seleziona una forma di taglio per visualizzare le istruzioni.</p>`);
  }
}

// Funzione per mostrare le opzioni sì/no per la strip LED
export function vaiAlleOpzioniStripLed() {
  $('#profilo-nome-step2-option').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-option').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-personalizzazione").fadeOut(300, function() {
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
  
  $("#step2-option-strip").fadeOut(300, function() { 
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