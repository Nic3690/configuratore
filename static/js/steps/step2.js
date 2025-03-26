import { configurazione, mappaTipologieVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep2Completion, checkPersonalizzazioneCompletion, formatTemperatura, checkParametriCompletion } from '../utils.js';
import { caricaOpzioniParametri, caricaStripLedFiltrate, caricaFinitureDisponibili, calcolaProposte, finalizzaConfigurazione, caricaOpzioniIP } from '../api.js';
import { vaiAllaTemperaturaEPotenza } from './step3.js';
import { vaiAllAlimentazione } from './step4.js';

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
  
  // Continua dai parametri alla selezione della strip
  $('#btn-continua-parametri').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.tensioneSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
      vaiAllaSelezioneDiStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.tensioneSelezionato) messaggi.push("una tensione");
      if (!configurazione.ipSelezionato) messaggi.push("un grado IP");
      if (!configurazione.temperaturaSelezionata) messaggi.push("una temperatura");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  // Torna dalla selezione strip ai parametri
  $('#btn-torna-parametri-strip').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-strip").fadeOut(300, function() {
      $("#step2-parametri").fadeIn(300);
    });
  });
  
  // Continua dalla selezione strip all'alimentazione
  $('#btn-continua-strip').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.stripLedSelezionata) {
      // Vai direttamente all'alimentazione
      vaiAllAlimentazione();
    } else {
      alert("Seleziona una strip LED prima di continuare");
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
  
  // Continua dopo scelta strip sì/no
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
      $("#step2-option-strip").fadeOut(300, function() {
        // Vai direttamente all'alimentazione
        vaiAllAlimentazione();
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
    prepareTipologiaStripListeners();
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

// Modifica della funzione updateIstruzioniMisurazione in static/js/steps/step2.js
export function updateIstruzioniMisurazione(forma) {
  const istruzioniContainer = $('#istruzioni-misurazione');
  const misurazioneContainer = $('#misurazione-container');
  
  istruzioniContainer.empty();
  misurazioneContainer.empty();

  $('.lunghezza-personalizzata-container').remove();
  configurazione.lunghezzaMultiple = {};
  
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
        
        if (configurazione.lunghezzaRichiesta && configurazione.lunghezzaRichiesta > 0) {
          calcolaProposte(configurazione.lunghezzaRichiesta);
        } else {
          $('#proposte-container').hide();
        }
        
        checkPersonalizzazioneCompletion();
      });
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
      // Non mostriamo più le proposte per le forme complesse
      $('#proposte-container').hide();
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
      <div id="non-assemblato-warning" class="alert alert-warning mt-3 mb-4">
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
    
    updateProgressBar(2);
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
  
  // Definiamo le tensioni disponibili in base alla tipologia di strip
  let tensioniDisponibili = [];
  
  switch(configurazione.tipologiaStripSelezionata) {
    case 'COB':
      tensioniDisponibili = ['24V', '220V'];
      break;
    case 'SMD':
      tensioniDisponibili = ['24V', '48V'];
      break;
    case 'SPECIAL':
      // Per Special Strip, dipende dal tipo specifico
      switch(configurazione.specialStripSelezionata) {
        case 'XFLEX':
        case 'RUNNING':
        case 'XNAKE':
        case 'XMAGIS':
          tensioniDisponibili = ['24V'];
          break;
        case 'ZIG_ZAG':
          tensioniDisponibili = ['24V', '48V'];
          break;
        default:
          tensioniDisponibili = ['24V']; // Fallback
      }
      break;
    default:
      // Carica tutte le tensioni disponibili per il profilo
      $.ajax({
        url: `/get_opzioni_tensione/${configurazione.profiloSelezionato}`,
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
      return;
  }
  
  // Renderizziamo le tensioni disponibili
  renderizzaOpzioniTensione(tensioniDisponibili);
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
      $('.special-strip-card').removeClass('selected');
      
      // Abilita subito il pulsante continua se non è special strip
      $('#btn-continua-tipologia-strip').prop('disabled', false);
    } else {
      // Mostra il sottomenu per special strip
      $('#special-strip-container').fadeIn(300);
      $('#btn-continua-tipologia-strip').prop('disabled', true);
    }
  });
  
  $('.special-strip-card').on('click', function() {
    $('.special-strip-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.specialStripSelezionata = $(this).data('special-strip');
    $('#btn-continua-tipologia-strip').prop('disabled', false);
  });
}

export function vaiAllaSelezioneDiStripLed() {
  $('#profilo-nome-step2-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#tensione-nome-step2-strip').text(mappaTensioneVisualizzazione[configurazione.tensioneSelezionato] || configurazione.tensioneSelezionato);
  $('#ip-nome-step2-strip').text(mappaIPVisualizzazione[configurazione.ipSelezionato] || configurazione.ipSelezionato);
  $('#temperatura-nome-step2-strip').text(formatTemperatura(configurazione.temperaturaSelezionata));
  
  // Aggiunta della tipologia strip solo se non esiste già
  if ($('#tipologia-strip-badge-step2-strip').length === 0) {
    let tipologiaStripText = configurazione.tipologiaStripSelezionata;
    if (configurazione.tipologiaStripSelezionata === 'SPECIAL' && configurazione.specialStripSelezionata) {
      tipologiaStripText += ` - ${configurazione.specialStripSelezionata}`;
    }
    
    // Aggiungi badge con ID univoco per facilitare la gestione
    $('.selection-badges').append(`
      <span class="badge bg-warning selection-badge" id="tipologia-strip-badge-step2-strip">
        Tipologia Strip: <span id="tipologia-strip-nome-step2-strip">${tipologiaStripText}</span>
      </span>
    `);
  } else {
    // Aggiorna il testo se il badge esiste già
    let tipologiaStripText = configurazione.tipologiaStripSelezionata;
    if (configurazione.tipologiaStripSelezionata === 'SPECIAL' && configurazione.specialStripSelezionata) {
      tipologiaStripText += ` - ${configurazione.specialStripSelezionata}`;
    }
    $('#tipologia-strip-nome-step2-strip').text(tipologiaStripText);
  }
  
  $("#step2-parametri").fadeOut(300, function() {
    $("#step2-strip").fadeIn(300);
    
    // Richiama la funzione ottimizzata
    caricaStripLedFiltratePerTipologia();
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

function checkPersonalizzazioneComplete() {
  if (!configurazione.formaDiTaglioSelezionata) {
    alert("Seleziona una forma di taglio prima di continuare");
    return false;
  }
  
  if (!configurazione.finituraSelezionata) {
    alert("Seleziona una finitura prima di continuare");
    return false;
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

export function caricaStripLedFiltratePerTipologia() {
  // Mostra il loader durante il caricamento
  $('#strip-led-filtrate-options').empty().html(`
    <div class="col-12 text-center">
      <div class="spinner-border" role="status"></div>
      <p class="mt-3">Caricamento opzioni strip LED...</p>
    </div>
  `);
  
  // Reset delle selezioni
  configurazione.stripLedSelezionata = null;
  configurazione.nomeCommercialeStripLed = null;
  $('#btn-continua-strip').prop('disabled', true);
  
  // Costruisci l'URL per il filtro corretto
  const url = `/get_strip_led_filtrate/${configurazione.profiloSelezionato}/${configurazione.tensioneSelezionato}/${configurazione.ipSelezionato}/${configurazione.temperaturaSelezionata}`;
  
  // Chiama l'API per ottenere le strip LED filtrate
  $.ajax({
    url: url,
    method: 'GET',
    success: function(data) {
      if (!data.success || !data.strip_led || data.strip_led.length === 0) {
        // Nessuna strip trovata
        $('#strip-led-filtrate-options').html(`
          <div class="col-12 text-center">
            <p>Nessuna strip LED disponibile per questa combinazione di parametri.</p>
          </div>
        `);
        return;
      }
      
      // Genera le card per le strip trovate
      $('#strip-led-filtrate-options').empty();
      data.strip_led.forEach(function(strip) {
        const nomeVisualizzato = strip.nomeCommerciale || strip.nome;
        
        $('#strip-led-filtrate-options').append(`
          <div class="col-md-6 mb-3">
            <div class="card option-card strip-led-filtrata-card" 
                 data-strip="${strip.id}" 
                 data-nome-commerciale="${strip.nomeCommerciale || ''}">
              <div class="card-body">
                <h5 class="card-title">${nomeVisualizzato}</h5>
                ${strip.nomeCommerciale ? `<p class="card-subtitle mb-2 text-muted strip-led-nome-tecnico">${strip.nome}</p>` : ''}
                <p class="card-text small text-muted">${strip.descrizione || ''}</p>
                <p class="card-text small">
                  Tensione: ${strip.tensione}, 
                  IP: ${strip.ip}, 
                  Temperatura: ${formatTemperatura(strip.temperatura)}
                </p>
                ${strip.codiciProdotto && strip.codiciProdotto.length > 0 ? 
                  `<p class="card-text small">Codici prodotto: ${strip.codiciProdotto.join(', ')}</p>` : ''}
              </div>
            </div>
          </div>
        `);
      });
      
      // Aggiungi event listener alle card
      $('.strip-led-filtrata-card').on('click', function() {
        $('.strip-led-filtrata-card').removeClass('selected');
        $(this).addClass('selected');
        
        // Memorizza i dati della strip selezionata
        configurazione.stripLedSelezionata = $(this).data('strip');
        configurazione.nomeCommercialeStripLed = $(this).data('nome-commerciale');
        
        // Abilita il pulsante continua
        $('#btn-continua-strip').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle strip LED:", error);
      $('#strip-led-filtrate-options').html(`
        <div class="col-12 text-center">
          <p class="text-danger">Errore nel caricamento delle strip LED. Riprova più tardi.</p>
        </div>
      `);
    }
  });
}
