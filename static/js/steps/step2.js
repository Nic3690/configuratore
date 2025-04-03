import { configurazione, mappaTipologieVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep2Completion, checkPersonalizzazioneCompletion, formatTemperatura, checkParametriCompletion } from '../utils.js';
import { caricaOpzioniParametri, caricaStripLedFiltrate, caricaFinitureDisponibili, finalizzaConfigurazione, caricaOpzioniIP } from '../api.js';
import { vaiAllaTemperaturaEPotenza } from './step3.js';

export function initStep2Listeners() {
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
      vaiAllaPersonalizzazione();
    } else {
      let messaggi = [];
      if (!configurazione.profiloSelezionato) messaggi.push("un profilo");
      if (!configurazione.tipologiaSelezionata) messaggi.push("una tipologia");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  // Torna dalla personalizzazione al modello
  $('#btn-torna-step2-modello').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-personalizzazione").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
    });
  });
  
  // Continua dalla personalizzazione alle opzioni strip
  $('#btn-continua-personalizzazione').on('click', function(e) {
    e.preventDefault();
    
    if (!checkPersonalizzazioneComplete()) {
      return;
    }
    
    vaiAlleOpzioniStripLed();
  });
  
  // Torna dalle opzioni strip alla personalizzazione
  $('#btn-torna-step2-personalizzazione').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-option-strip").fadeOut(300, function() {
      $("#step2-personalizzazione").fadeIn(300);
    });
  });
  
  // Torna dai parametri alla tipologia strip
  $('#btn-torna-step2-parametri').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-parametri").fadeOut(300, function() {
      $("#step2-tipologia-strip").fadeIn(300);
    });
  });
  
  // Continua dai parametri alla potenza
  $('#btn-continua-parametri').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.tensioneSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
      // MODIFICATO: Vai direttamente alla selezione della potenza invece della selezione strip
      vaiAllaTemperaturaEPotenza();
    } else {
      let messaggi = [];
      if (!configurazione.tensioneSelezionato) messaggi.push("una tensione");
      if (!configurazione.ipSelezionato) messaggi.push("un grado IP");
      if (!configurazione.temperaturaSelezionata) messaggi.push("una temperatura");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  // Torna dalla tipologia strip alle opzioni strip
  $('#btn-torna-step2-option-strip').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-tipologia-strip").fadeOut(300, function() {
      $("#step2-option-strip").fadeIn(300);
    });
  });
  
  // Continua dalla tipologia strip ai parametri
  $('#btn-continua-tipologia-strip').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.tipologiaStripSelezionata) {
      alert("Seleziona una tipologia di strip LED prima di continuare");
      return;
    }
    
    // Se è selezionata SPECIAL ma non è stato selezionato un tipo specifico
    if (configurazione.tipologiaStripSelezionata === 'SPECIAL' && !configurazione.specialStripSelezionata) {
      alert("Seleziona un tipo di special strip prima di continuare");
      return;
    }
    
    vaiAiParametriStripLed();
  });
  
  // Scelta strip sì/no
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
    vaiAllaTipologiaStrip();
  } else {
    // L'utente ha scelto di non includere una strip LED
    configurazione.stripLedSelezionata = 'NO_STRIP';
    
    // Impostiamo i valori necessari per saltare gli step intermedi
    configurazione.alimentazioneSelezionata = 'SENZA_ALIMENTATORE';
    configurazione.tipologiaAlimentatoreSelezionata = null;
    configurazione.dimmerSelezionato = 'NESSUN_DIMMER';
    configurazione.tipoAlimentazioneCavo = 'ALIMENTAZIONE_UNICA';
    configurazione.lunghezzaCavoIngresso = 0;
    configurazione.lunghezzaCavoUscita = 0;
    configurazione.uscitaCavoSelezionata = 'DRITTA';
    
    // Aggiorna la barra di avanzamento all'ultimo step
    updateProgressBar(6);
    
    $("#step2-option-strip").fadeOut(300, function() {
      // Vai direttamente al riepilogo invece che all'alimentazione
      finalizzaConfigurazione();
    });
  }
});
}

// Funzione per andare alla selezione della tipologia strip
export function vaiAllaTipologiaStrip() {
  // Reset delle selezioni
  configurazione.tipologiaStripSelezionata = null;
  configurazione.specialStripSelezionata = null;

  $('#profilo-nome-step2-tipologia-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-tipologia-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);

  $('#special-strip-container').hide();
  
  $('.tipologia-strip-card').removeClass('selected');
  $('.special-strip-card').removeClass('selected');
  $('#btn-continua-tipologia-strip').prop('disabled', true);
  
  $("#step2-option-strip").fadeOut(300, function() {
    $("#step2-tipologia-strip").fadeIn(300);
    // Analizziamo e mostriamo solo le tipologie compatibili
    analizzaEMostraTipologieCompatibili();
  });
}

// Nuova funzione per analizzare e mostrare solo le tipologie compatibili
function analizzaEMostraTipologieCompatibili() {
  // Nascondi tutte le tipologie inizialmente
  $('.tipologia-strip-card').parent().hide();
  
  // Mostra un loader mentre carichiamo i dati
  $('#tipologia-strip-container').prepend(`
    <div id="tipologia-loading" class="text-center">
      <div class="spinner-border" role="status"></div>
      <p class="mt-3">Analisi tipologie compatibili...</p>
    </div>
  `);
  
  // Ottieni le strip compatibili dal backend
  $.ajax({
    url: `/get_profili/${configurazione.categoriaSelezionata}`,
    method: 'GET',
    success: function(data) {
      // Rimuovi il loader
      $('#tipologia-loading').remove();
      
      // Trova il profilo selezionato
      const profiloSelezionato = data.find(p => p.id === configurazione.profiloSelezionato);
      
      if (!profiloSelezionato || !profiloSelezionato.stripLedCompatibili || profiloSelezionato.stripLedCompatibili.length === 0) {
        // Nessuna strip compatibile trovata, mostra un messaggio
        $('#tipologia-strip-container').html(`
          <div class="alert alert-warning">
            <p>Nessuna strip LED compatibile trovata per questo profilo.</p>
          </div>
        `);
        return;
      }
      
      // Controlla quali tipologie sono compatibili
      const hasCOB = profiloSelezionato.stripLedCompatibili.some(id => id.includes('COB'));
      const hasSMD = profiloSelezionato.stripLedCompatibili.some(id => id.includes('SMD'));
      const hasSpecial = profiloSelezionato.stripLedCompatibili.some(id => 
        !id.includes('COB') && !id.includes('SMD') || 
        id.includes('ZIGZAG') || 
        id.includes('XFLEX') || 
        id.includes('RUNNING') || 
        id.includes('XNAKE') || 
        id.includes('XMAGIS'));
      
      // Mostra solo le tipologie compatibili
      if (hasCOB) {
        $('.tipologia-strip-card[data-tipologia-strip="COB"]').parent().show();
      }
      
      if (hasSMD) {
        $('.tipologia-strip-card[data-tipologia-strip="SMD"]').parent().show();
      }
      
      if (hasSpecial) {
        $('.tipologia-strip-card[data-tipologia-strip="SPECIAL"]').parent().show();
      }
      
      // Se c'è solo una tipologia compatibile, selezionala automaticamente
      const tipologieVisibili = $('.tipologia-strip-card').parent(':visible').length;
      
      if (tipologieVisibili === 0) {
        $('#tipologia-strip-container').html(`
          <div class="alert alert-warning">
            <p>Nessuna strip LED compatibile trovata per questo profilo.</p>
          </div>
        `);
      } else if (tipologieVisibili === 1) {
        // Seleziona automaticamente l'unica tipologia disponibile
        const $unica = $('.tipologia-strip-card').parent(':visible').find('.tipologia-strip-card');
        $unica.addClass('selected');
        configurazione.tipologiaStripSelezionata = $unica.data('tipologia-strip');
        
        // Se è "SPECIAL", mostra il container special-strip
        if (configurazione.tipologiaStripSelezionata === 'SPECIAL') {
          $('#special-strip-container').fadeIn(300);
          // Filtriamo anche i tipi di special strip compatibili
          filtraSpecialStripCompatibili(profiloSelezionato.stripLedCompatibili);
        } else {
          // Altrimenti, abilitiamo direttamente il pulsante continua
          $('#btn-continua-tipologia-strip').prop('disabled', false);
        }
      }
      
      // Reimposta i listener per le card
      prepareTipologiaStripListeners();
    },
    error: function(error) {
      // Rimuovi il loader e mostra un errore
      $('#tipologia-loading').remove();
      console.error("Errore nel caricamento delle strip compatibili:", error);
      $('#tipologia-strip-container').html(`
        <div class="alert alert-danger">
          <p>Errore nel caricamento delle strip LED compatibili. Riprova più tardi.</p>
        </div>
      `);
    }
  });
}

// Nuova funzione per filtrare i tipi di special strip compatibili
function filtraSpecialStripCompatibili(stripCompatibili) {
  // Nascondi tutte le special strip inizialmente
  $('.special-strip-card').parent().hide();
  
  // Mappa delle special strip ai rispettivi ID o nomi commerciali
  const specialStripMap = {
    'XFLEX': ['XFLEX', 'FLEX'],
    'RUNNING': ['RUNNING'],
    'ZIG_ZAG': ['ZIGZAG', 'ZIG_ZAG', 'ZIGZAG'],
    'XNAKE': ['XNAKE', 'XSNAKE', 'SNAKE'],
    'XMAGIS': ['XMAGIS', 'MAGIS']
  };
  
  // Verifica quali special strip sono compatibili
  for (const [specialType, keywords] of Object.entries(specialStripMap)) {
    const isCompatible = stripCompatibili.some(stripId => 
      keywords.some(keyword => stripId.toUpperCase().includes(keyword))
    );
    
    if (isCompatible) {
      $(`.special-strip-card[data-special-strip="${specialType}"]`).parent().show();
    }
  }
  
  // Se c'è solo una special strip compatibile, selezionala automaticamente
  const specialVisibili = $('.special-strip-card').parent(':visible').length;
  
  if (specialVisibili === 1) {
    const $unica = $('.special-strip-card').parent(':visible').find('.special-strip-card');
    $unica.addClass('selected');
    configurazione.specialStripSelezionata = $unica.data('special-strip');
    $('#btn-continua-tipologia-strip').prop('disabled', false);
  } else if (specialVisibili === 0) {
    // Nessuna special strip compatibile trovata, mostra un messaggio
    $('#special-strip-container').html(`
      <h3 class="mb-3">Tipo di Special Strip</h3>
      <div class="alert alert-warning">
        <p>Nessuna special strip compatibile trovata per questo profilo.</p>
      </div>
    `);
    // Rimuovi la selezione di SPECIAL come tipologia
    $('.tipologia-strip-card').removeClass('selected');
    configurazione.tipologiaStripSelezionata = null;
    $('#btn-continua-tipologia-strip').prop('disabled', true);
  }
}

export function prepareTipologiaStripListeners() {
  $('.tipologia-strip-card').on('click', function() {
    $('.tipologia-strip-card').removeClass('selected');
    $(this).addClass('selected');
    
    const tipologiaStrip = $(this).data('tipologia-strip');
    configurazione.tipologiaStripSelezionata = tipologiaStrip;
    
    // Resetta la selezione special strip se l'utente cambia tipologia
    if (tipologiaStrip !== 'SPECIAL') {
      configurazione.specialStripSelezionata = null;
      $('#special-strip-container').hide();
      
      // Abilita subito il pulsante continua se non è special strip
      $('#btn-continua-tipologia-strip').prop('disabled', false);
    } else {
      // Mostra il sottomenu per special strip
      $('#special-strip-container').fadeIn(300);
      $('#btn-continua-tipologia-strip').prop('disabled', true);
      
      // Filtra le special strip compatibili quando si seleziona SPECIAL
      $.ajax({
        url: `/get_profili/${configurazione.categoriaSelezionata}`,
        method: 'GET',
        success: function(data) {
          const profiloSelezionato = data.find(p => p.id === configurazione.profiloSelezionato);
          if (profiloSelezionato && profiloSelezionato.stripLedCompatibili) {
            filtraSpecialStripCompatibili(profiloSelezionato.stripLedCompatibili);
          }
        },
        error: function(error) {
          console.error("Errore nel caricamento delle strip compatibili:", error);
        }
      });
    }
  });
  
  $('.special-strip-card').on('click', function() {
    $('.special-strip-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.specialStripSelezionata = $(this).data('special-strip');
    $('#btn-continua-tipologia-strip').prop('disabled', false);
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
    
    const $compatibilityBadge = $('<div class="compatibility-badge mt-2">')
      .append($('<span class="badge bg-success">').text(`Strip LED compatibili: ${stripCount}`));
    
    let tooltipContent = "Strip LED compatibili: ";
    const stripNomi = profilo.stripLedCompatibiliInfo
      .filter(s => s.nomeCommerciale)
      .map(s => s.nomeCommerciale)
      .filter((v, i, a) => a.indexOf(v) === i);
    
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
  caricaFinitureDisponibili(configurazione.profiloSelezionato);
  
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
    checkPersonalizzazioneCompletion();
  });
  
  // RIMOSSO: Listener per i pulsanti delle proposte
  // Non includiamo più questa parte
  
  // NUOVA FUNZIONALITÀ: Verifica se è stato selezionato profilo intero o taglio su misura
  // Se è profilo intero, nascondi la sezione di personalizzazione lunghezza
  console.log("Tipologia selezionata:", configurazione.tipologiaSelezionata);
  togglePersonalizzazioneLunghezza();
  
  updateIstruzioniMisurazione('DRITTO_SEMPLICE');
  checkPersonalizzazioneCompletion();
}

// Nuova funzione per gestire visibilità della sezione di personalizzazione della lunghezza
function togglePersonalizzazioneLunghezza() {
  // Rimuoviamo prima eventuali sezioni informative create in precedenza
  $('#lunghezza-info-container').remove();
  
  // Otteniamo la sezione di personalizzazione lunghezza
  let personalizzazioneLunghezzaContainer = null;
  $('.container.mb-5').each(function() {
    const heading = $(this).find('h3.mb-3').text();
    if (heading === 'Personalizzazione lunghezza') {
      personalizzazioneLunghezzaContainer = $(this);
    }
  });
  
  if (!personalizzazioneLunghezzaContainer) {
    console.error("Impossibile trovare la sezione di personalizzazione lunghezza");
    return;
  }
  
  if (configurazione.tipologiaSelezionata === 'profilo_intero') {
    // Nasconde la sezione di personalizzazione lunghezza
    personalizzazioneLunghezzaContainer.hide();
    
    // Aggiungi un messaggio informativo
    const infoMessage = `
      <div class="container mb-5" id="lunghezza-info-container">
        <h3 class="mb-3">Lunghezza profilo</h3>
        <div class="alert alert-info">
          <p>Hai selezionato un profilo intero che ha una lunghezza standard predefinita.</p>
        </div>
      </div>
    `;
    
    // Inserisci il messaggio dopo la sezione della finitura
    $('#finitura-container').closest('.container').after(infoMessage);
    
    // Impostazione automatica per la lunghezza richiesta per passare la validazione
    configurazione.lunghezzaRichiesta = 3000; // lunghezza standard di default
  } else {
    // Per taglio su misura, mostra la sezione di personalizzazione lunghezza
    personalizzazioneLunghezzaContainer.show();
  }
}

// Modifica della funzione updateIstruzioniMisurazione in static/js/steps/step2.js
export function updateIstruzioniMisurazione(forma) {
  // Se è profilo intero, non fare nulla con la visualizzazione delle istruzioni di misurazione
  if (configurazione.tipologiaSelezionata === 'profilo_intero') {
    return;
  }
  
  const istruzioniContainer = $('#istruzioni-misurazione');
  const misurazioneContainer = $('#misurazione-container');
  
  istruzioniContainer.empty();
  misurazioneContainer.empty();

  $('.lunghezza-personalizzata-container').remove();
  configurazione.lunghezzeMultiple = {};
  
  switch(forma) {
    case 'DRITTO_SEMPLICE':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/dritto_semplice.png" alt="Forma dritta" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      
      misurazioneContainer.html(`
        <div class="form-group mb-4 lunghezza-personalizzata-container">
          <label for="lunghezza-personalizzata">Lunghezza richiesta (mm):</label>
          <input type="number" class="form-control" id="lunghezza-personalizzata" 
                 placeholder="Inserisci la lunghezza in millimetri" min="100">
          <div class="form-text text-muted">
            Nota: verrà aggiunto automaticamente uno spazio di 5mm per i tappi e la saldatura.
          </div>
        </div>
      `);

      $('#lunghezza-personalizzata').on('input', function() {
        configurazione.lunghezzaRichiesta = parseInt($(this).val(), 10) || null;
        checkPersonalizzazioneCompletion();
      });
      
      // RIMOSSO: Non calcoliamo più le proposte qui
      // RIMOSSO: Non mostriamo più il container delle proposte
      
      $('#non-assemblato-warning').hide();
      break;
      
    case 'FORMA_L_DX':
      istruzioniContainer.html(`
        <p>Inserisci le lunghezze per entrambi i lati del profilo a L.</p>
        <img src="/static/img/forma_a_l_dx.png" alt="Forma a L destra" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      
      misurazioneContainer.html(`
        <div class="form-group mb-3 lunghezza-personalizzata-container">
          <label for="lunghezza-lato1">Lunghezza lato orizzontale (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato1" 
                 data-lato="lato1" placeholder="Lato orizzontale" min="100">
        </div>
        <div class="form-group mb-4 lunghezza-personalizzata-container">
          <label for="lunghezza-lato2">Lunghezza lato verticale (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato2" 
                 data-lato="lato2" placeholder="Lato verticale" min="100">
          <div class="form-text text-muted">
            Nota: verrà aggiunto automaticamente uno spazio di 5mm per i tappi e la saldatura.
          </div>
        </div>
      `);
      
      // Mostra l'avviso di non assemblaggio
      mostraNonAssemblatoWarning();
      break;
      
    case 'FORMA_L_SX':
      istruzioniContainer.html(`
        <p>Inserisci le lunghezze per entrambi i lati del profilo a L.</p>
        <img src="/static/img/forma_a_l_sx.png" alt="Forma a L sinistra" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      
      misurazioneContainer.html(`
        <div class="form-group mb-3 lunghezza-personalizzata-container">
          <label for="lunghezza-lato1">Lunghezza lato orizzontale (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato1" 
                 data-lato="lato1" placeholder="Lato orizzontale" min="100">
        </div>
        <div class="form-group mb-4 lunghezza-personalizzata-container">
          <label for="lunghezza-lato2">Lunghezza lato verticale (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato2" 
                 data-lato="lato2" placeholder="Lato verticale" min="100">
          <div class="form-text text-muted">
            Nota: verrà aggiunto automaticamente uno spazio di 5mm per i tappi e la saldatura.
          </div>
        </div>
      `);
      
      // Mostra l'avviso di non assemblaggio
      mostraNonAssemblatoWarning();
      break;
      
    case 'FORMA_C':
      istruzioniContainer.html(`
        <p>Inserisci le lunghezze per tutti i lati del profilo a C.</p>
        <img src="/static/img/forma_a_c.png" alt="Forma a C" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      
      misurazioneContainer.html(`
        <div class="form-group mb-3 lunghezza-personalizzata-container">
          <label for="lunghezza-lato1">Lunghezza lato orizzontale superiore (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato1" 
                 data-lato="lato1" placeholder="Lato orizzontale superiore" min="100">
        </div>
        <div class="form-group mb-3 lunghezza-personalizzata-container">
          <label for="lunghezza-lato2">Lunghezza lato verticale (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato2" 
                 data-lato="lato2" placeholder="Lato verticale" min="100">
        </div>
        <div class="form-group mb-4 lunghezza-personalizzata-container">
          <label for="lunghezza-lato3">Lunghezza lato orizzontale inferiore (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato3" 
                 data-lato="lato3" placeholder="Lato orizzontale inferiore" min="100">
          <div class="form-text text-muted">
            Nota: verrà aggiunto automaticamente uno spazio di 5mm per i tappi e la saldatura.
          </div>
        </div>
      `);
      
      // Mostra l'avviso di non assemblaggio
      mostraNonAssemblatoWarning();
      break;
      
    case 'RETTANGOLO_QUADRATO':
      istruzioniContainer.html(`
        <p>Inserisci le lunghezze per i lati del rettangolo/quadrato.</p>
        <img src="/static/img/forma_a_rettangolo.png" alt="Forma rettangolare" class="img-fluid mb-3" 
             style="width: 100%; max-width: 300px;">
      `);
      
      misurazioneContainer.html(`
        <div class="form-group mb-3 lunghezza-personalizzata-container">
          <label for="lunghezza-lato1">Lunghezza (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato1" 
                 data-lato="lato1" placeholder="Lunghezza" min="100">
        </div>
        <div class="form-group mb-4 lunghezza-personalizzata-container">
          <label for="lunghezza-lato2">Larghezza (mm):</label>
          <input type="number" class="form-control campo-lunghezza-multipla" id="lunghezza-lato2" 
                 data-lato="lato2" placeholder="Larghezza" min="100">
          <div class="form-text text-muted">
            Nota: verrà aggiunto automaticamente uno spazio di 5mm per i tappi e la saldatura.
          </div>
        </div>
      `);
      
      // Mostra l'avviso di non assemblaggio
      mostraNonAssemblatoWarning();
      break;
      
    default:
      istruzioniContainer.html(`<p>Seleziona una forma di taglio per visualizzare le istruzioni.</p>`);
  }
  
  // Aggiunge event listener per i campi di lunghezza multipla
  $('.campo-lunghezza-multipla').on('input', function() {
    const lato = $(this).data('lato');
    const valore = parseInt($(this).val(), 10) || null;
    
    // Aggiorna l'oggetto lunghezzeMultiple nella configurazione
    if (!configurazione.lunghezzeMultiple) {
      configurazione.lunghezzeMultiple = {};
    }
    
    configurazione.lunghezzeMultiple[lato] = valore;
    
    // Per retrocompatibilità, utilizziamo la somma delle lunghezze come lunghezzaRichiesta
    let sommaLunghezze = 0;
    let tuttiValoriPresenti = true;
    
    Object.values(configurazione.lunghezzeMultiple).forEach(val => {
      if (val && val > 0) {
        sommaLunghezze += val;
      } else {
        tuttiValoriPresenti = false;
      }
    });
    
    if (tuttiValoriPresenti) {
      configurazione.lunghezzaRichiesta = sommaLunghezze;
    } else {
      configurazione.lunghezzaRichiesta = null;
    }
    
    checkPersonalizzazioneCompletion();
  });
}

// Funzione per mostrare l'avviso di non assemblaggio
function mostraNonAssemblatoWarning() {
  // Se l'avviso non esiste ancora, lo creiamo
  if ($('#non-assemblato-warning').length === 0) {
    const warningHtml = `
      <div id="non-assemblato-warning" class="assembly-warning mt-3 mb-4">
        <strong>IMPORTANTE:</strong> I profili verranno consegnati non assemblati tra di loro e la strip verrà consegnata non installata.
      </div>
    `;
    
    // Aggiungiamo l'avviso dopo il container di misurazione
    $('#misurazione-container').after(warningHtml);
  } else {
    // Altrimenti lo mostriamo
    $('#non-assemblato-warning').show();
  }
}

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

export function vaiAiParametriStripLed() {
  $('#profilo-nome-step2-parametri').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-parametri').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  // Aggiungiamo le informazioni sulla tipologia strip selezionata
  let tipologiaStripText = configurazione.tipologiaStripSelezionata;
  if (configurazione.tipologiaStripSelezionata === 'SPECIAL' && configurazione.specialStripSelezionata) {
    tipologiaStripText += ` - ${configurazione.specialStripSelezionata}`;
  }
  
  // Se non esiste già, aggiungiamo un badge per la tipologia strip
  if ($('#tipologia-strip-nome-step2-parametri').length === 0) {
    $('.selection-badges').append(`
      <span class="badge bg-warning selection-badge">Tipologia Strip: <span id="tipologia-strip-nome-step2-parametri">${tipologiaStripText}</span></span>
    `);
  } else {
    $('#tipologia-strip-nome-step2-parametri').text(tipologiaStripText);
  }
  
  $("#step2-tipologia-strip").fadeOut(300, function() { 
    $("#step2-parametri").fadeIn(300);
    
    // MODIFICATO: Aggiorna la barra di progresso a 3 (invece di 2)
    updateProgressBar(3);
    caricaOpzioniParametriFiltrate();
  });
}

// Nuova funzione per caricare i parametri filtrati in base alla tipologia strip
export function caricaOpzioniParametriFiltrate() {
  $('#tensione-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni tensione...</p>');
  $('#ip-options').empty();
  $('#temperatura-iniziale-options').empty();
  
  configurazione.tensioneSelezionato = null;
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $('#btn-continua-parametri').prop('disabled', true);

    // Carica tutte le tensioni disponibili per il profilo
    $.ajax({
      url: `/get_opzioni_tensione/${configurazione.profiloSelezionato}/${configurazione.tipologiaStripSelezionata}`,
      method: 'GET',
      success: function(data) {
        if (data.success && data.voltaggi) {
          renderizzaOpzioniTensione(data.voltaggi);
        } else {
          $('#tensione-options').html('<p class="text-danger">Errore nel caricamento delle opzioni tensione.</p>');
        }
      },
      error: function(error) {
        console.error("Errore nel caricamento delle opzioni tensione:", error);
        $('#tensione-options').html('<p class="text-danger">Errore nel caricamento delle opzioni tensione. Riprova più tardi.</p>');
      }
    });
}

// Funzione helper per visualizzare le opzioni tensione
function renderizzaOpzioniTensione(tensioni) {
  $('#tensione-options').empty();
  
  if (!tensioni || tensioni.length === 0) {
    $('#tensione-options').html('<p>Nessuna opzione di tensione disponibile per questa tipologia.</p>');
    return;
  }
  
  tensioni.sort((a, b) => {
    const voltA = parseInt(a.replace('V', ''));
    const voltB = parseInt(b.replace('V', ''));
    return voltA - voltB;  
  });

  tensioni.forEach(function(tensione) {
    $('#tensione-options').append(`
      <div class="col-md-4 mb-3">
        <div class="card option-card tensione-card" data-tensione="${tensione}">
          <div class="card-body text-center">
            <h5 class="card-title">${mappaTensioneVisualizzazione[tensione] || tensione}</h5>
          </div>
        </div>
      </div>
    `);
  });
  
  $('.tensione-card').on('click', function() {
    $('.tensione-card').removeClass('selected');
    $(this).addClass('selected');
    configurazione.tensioneSelezionato = $(this).data('tensione');
    
    caricaOpzioniIP(configurazione.profiloSelezionato, configurazione.tensioneSelezionato);
    checkParametriCompletion();
  });
}

function checkPersonalizzazioneComplete() {
  if (!configurazione.formaDiTaglioSelezionata) {
    alert("Seleziona una forma di taglio prima di continuare");
    return false;
  }
  
  if (!configurazione.finituraSelezionata) {
    alert("Seleziona una finitura prima di continuare");
    return false;
  }
  
  // Se la tipologia è profilo intero, non controlliamo la lunghezza
  if (configurazione.tipologiaSelezionata === 'profilo_intero') {
    return true;
  }
  
  if (configurazione.tipologiaSelezionata === 'taglio_misura') {
    // Per il taglio dritto semplice, controlliamo solo lunghezzaRichiesta
    if (configurazione.formaDiTaglioSelezionata === 'DRITTO_SEMPLICE') {
      if (!configurazione.lunghezzaRichiesta) {
        alert("Inserisci una lunghezza prima di continuare");
        return false;
      }
    } 
    // Per le altre forme, controlliamo che tutte le lunghezze multiple siano inserite
    else if (configurazione.lunghezzeMultiple) {
      const forma = configurazione.formaDiTaglioSelezionata;
      const numLatiRichiesti = {
        'FORMA_L_DX': 2,
        'FORMA_L_SX': 2,
        'FORMA_C': 3,
        'RETTANGOLO_QUADRATO': 2
      }[forma] || 0;
      
      // Conta quanti lati hanno un valore valido
      const latiValidi = Object.values(configurazione.lunghezzeMultiple)
        .filter(val => val && val > 0).length;
      
      if (latiValidi < numLatiRichiesti) {
        alert("Inserisci tutte le misure richieste per questa forma");
        return false;
      }
    } else {
      alert("Inserisci le misure richieste per questa forma");
      return false;
    }
  }
  return true;
}