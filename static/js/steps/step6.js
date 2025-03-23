import { configurazione, mappaTipologieVisualizzazione } from '../config.js';
import { updateProgressBar, checkStep6Completion } from '../utils.js';
import { caricaFinitureDisponibili, calcolaProposte, finalizzaConfigurazione } from '../api.js';

export function initStep6Listeners() {
  $('#btn-torna-step5').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-personalizzazione").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      
      updateProgressBar(5);
    });
  });
  
  $('#btn-finalizza').on('click', function(e) {
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
    
    finalizzaConfigurazione();
  });
}

export function vaiAllaPersonalizzazione() {
  console.log("Passaggio alla personalizzazione");
  
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  updateProgressBar(6);
  
  $("#step5-controllo").fadeOut(300, function() {
    $("#step6-personalizzazione").fadeIn(300);
    
    preparePersonalizzazioneListeners();
  });
}

/* Event Listener */
export function preparePersonalizzazioneListeners() {
  configurazione.formaDiTaglioSelezionata = "DRITTO_SEMPLICE";
  caricaFinitureDisponibili(configurazione.profiloSelezionato);
  $('.forma-taglio-card[data-forma="DRITTO_SEMPLICE"]').addClass('selected');
  
  $('.forma-taglio-card').on('click', function() {
    $('.forma-taglio-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.formaDiTaglioSelezionata = $(this).data('forma');
    
    updateIstruzioniMisurazione(configurazione.formaDiTaglioSelezionata);
    checkStep6Completion();
  });
  
  $('.finitura-card').on('click', function() {
    $('.finitura-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.finituraSelezionata = $(this).data('finitura');
    
    checkStep6Completion();
  });
  
  $('#lunghezza-personalizzata').on('input', function() {
    configurazione.lunghezzaRichiesta = parseInt($(this).val(), 10) || null;
    
    if (configurazione.lunghezzaRichiesta && configurazione.lunghezzaRichiesta > 0) {
      calcolaProposte(configurazione.lunghezzaRichiesta);
    } else {
      $('#proposte-container').hide();
    }
    
    checkStep6Completion();
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
    
    checkStep6Completion();
  });
  
  updateIstruzioniMisurazione('DRITTO_SEMPLICE');
  
  checkStep6Completion();
}

/**
 * Aggiorna le istruzioni di misurazione in base alla forma selezionata
 * @param {string} forma - Forma di taglio selezionata 
 */
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
        <img src="/static/img/forma_a_l_dx.png" alt="Forma dritta" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'FORMA_L_SX':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_l_sx.png" alt="Forma dritta" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'FORMA_C':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_c.png" alt="Forma dritta" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    case 'RETTANGOLO_QUADRATO':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_a_rettangolo.png" alt="Forma dritta" class="img-fluid mb-3" 
            style="width: 100%; max-width: 300px;">
      `);
      break;
    default:
      istruzioniContainer.html(`<p>Seleziona una forma di taglio per visualizzare le istruzioni.</p>`);
  }
}
