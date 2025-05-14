import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { finalizzaConfigurazione } from '../api.js';

export function initStep6Listeners() {
  $('#btn-torna-step5-from-proposte').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-proposte").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      updateProgressBar(5);
    });
  });

  $('#btn-continua-step6').on('click', function(e) {
    e.preventDefault();
    finalizzaConfigurazione();
  });

  $('.btn-seleziona-proposta').on('click', function() {
    const proposta = $(this).data('proposta');
    const valore = parseInt($(this).data('valore'), 10);
    
    if (proposta === 1) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    } else if (proposta === 2) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    }
    $('#btn-continua-step6').prop('disabled', false);
  });
}

function calcolaProposte(lunghezzaRichiesta) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/calcola_lunghezze',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        lunghezzaRichiesta: lunghezzaRichiesta,
        stripLedSelezionata: configurazione.stripLedSelezionata,
        potenzaSelezionata: configurazione.potenzaSelezionata
      }),
      success: function(data) {
        if (!data.success) {
          reject("Errore nel calcolo delle proposte");
          return;
        }
        
        configurazione.proposta1 = data.proposte.proposta1;
        configurazione.proposta2 = data.proposte.proposta2;
        configurazione.spazioProduzione = data.spazioProduzione || 5;
        
        resolve(data);
      },
      error: function(error) {
        console.error("Errore nel calcolo delle proposte:", error);
        reject(error);
      }
    });
  });
}

export function vaiAlleProposte() {
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                         mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                         configurazione.stripLedSelezionata;
    
    $('#strip-nome-step6').text(nomeStripLed);
  } else {
    $('#strip-nome-step6').text('Senza Strip LED');
  }

  const lunghezzaOriginale = configurazione.lunghezzaRichiesta || 0;
  $('#lunghezza-attuale').text(lunghezzaOriginale);
  $('#step6-lunghezza-finale').text(lunghezzaOriginale);
  $('#spazio-buio-warning').remove();

  if (configurazione.tipologiaSelezionata === 'profilo_intero') {
    $('#step6-proposte-container').html(`
      <div class="alert alert-info">
        <h5>Profilo intero con lunghezza standard</h5>
        <p>Hai selezionato un profilo intero con una lunghezza standard di ${configurazione.lunghezzaSelezionata ? configurazione.lunghezzaSelezionata : configurazione.lunghezzaRichiesta}mm.</p>
        <p>Non sono necessarie proposte di lunghezza per i profili interi.</p>
      </div>
    `);

    $('#step6-lunghezza-finale').text(lunghezzaOriginale);
    $('#btn-continua-step6').prop('disabled', false);
  } 
  else if (lunghezzaOriginale && lunghezzaOriginale > 0) {
    $('#step6-proposte-container').html(`
      <div class="text-center mt-3 mb-3">
        <div class="spinner-border" role="status"></div>
        <p class="mt-3">Calcolo proposte di lunghezza...</p>
      </div>
    `);

    calcolaProposte(lunghezzaOriginale)
      .then(data => {
        const spazioProduzione = data.spazioProduzione || 5;
        const coincideConProposta1 = lunghezzaOriginale === data.proposte.proposta1;
        const coincideConProposta2 = lunghezzaOriginale === data.proposte.proposta2;
        const coincideConProposte = coincideConProposta1 || coincideConProposta2;
        const spazioBuio = lunghezzaOriginale - data.proposte.proposta1;

        if (spazioBuio > 0) {
          let warningElement = $(`<p id="spazio-buio-warning" class="text-danger mb-0 mt-2" style="display: none; font-size: 1rem; color:#e83f34 !important">
            <strong>ATTENZIONE:</strong> se si sceglie questa misura si verificherà uno spazio buio nel profilo di ${spazioBuio}mm
          </p>`);

          $('.alert.alert-success.mt-4').append(warningElement);
        }

        const numeroCols = coincideConProposte ? 6 : 4;
        
        let proposteHTML = `
          <h5>Proposte di lunghezza standard</h5>
          <p>Il sistema ha calcolato delle proposte di lunghezza standard più adatte per la tua installazione.</p>
          <div class="row mt-3">
            <div class="col-md-${numeroCols} mb-2">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Proposta 1</h5>
                  <p class="card-text"><span id="step6-proposta1-valore">${data.proposte.proposta1}mm</span></p>
                  <button class="btn btn-outline-primary btn-seleziona-proposta" data-proposta="1" data-valore="${data.proposte.proposta1}">Seleziona</button>
                </div>
              </div>
            </div>
            
            <div class="col-md-${numeroCols} mb-2">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Proposta 2</h5>
                  <p class="card-text"><span id="step6-proposta2-valore">${data.proposte.proposta2}mm</span></p>
                  <button class="btn btn-outline-primary btn-seleziona-proposta" data-proposta="2" data-valore="${data.proposte.proposta2}">Seleziona</button>
                </div>
              </div>
            </div>`;

        if (!coincideConProposte) {
          proposteHTML += `
            <div class="col-md-${numeroCols} mb-2">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Lunghezza Originale</h5>
                  <p class="card-text"><span id="step6-lunghezza-originale">${lunghezzaOriginale}mm</span></p>
                  <button class="btn btn-outline-danger btn-seleziona-proposta" data-proposta="originale" data-valore="${lunghezzaOriginale}">Seleziona</button>
                </div>
              </div>
            </div>`;
        }
        
        proposteHTML += `</div>`;
        
        $('#step6-proposte-container').html(proposteHTML);

        $('.btn-seleziona-proposta').on('click', function() {
          $('.btn-seleziona-proposta').removeClass('active');
          $(this).addClass('active');
          
          const proposta = $(this).data('proposta');
          const valore = parseInt($(this).data('valore'), 10);
          
          configurazione.lunghezzaRichiesta = valore;
          $('#step6-lunghezza-finale').text(valore);
          $('#spazio-buio-warning').hide();

          if (proposta === 'originale' && spazioBuio > 0) {
            $('#spazio-buio-warning').show();
          }
          $('#btn-continua-step6').prop('disabled', false);
        });

        if (coincideConProposta1) {
          $('.btn-seleziona-proposta[data-proposta="1"]').addClass('active').trigger('click');
        } else if (coincideConProposta2) {
          $('.btn-seleziona-proposta[data-proposta="2"]').addClass('active').trigger('click');
        }
      })
      .catch(error => {
        console.error("Errore nel calcolo delle proposte:", error);
        $('#step6-proposte-container').html(`
          <div class="alert alert-danger">
            <p>Non è stato possibile calcolare le proposte di lunghezza. Verrà utilizzata la lunghezza originale.</p>
          </div>
        `);
        $('#btn-continua-step6').prop('disabled', false);
      });
  } else {
    $('#step6-proposte-container').html(`
      <div class="alert alert-warning">
        <p>Non è stata impostata una lunghezza valida nello step di personalizzazione.</p>
        <p>Per procedere, torna indietro e imposta una lunghezza valida.</p>
      </div>
    `);
    $('#btn-continua-step6').prop('disabled', true);
  }
  updateProgressBar(6);

  $(".step-section").hide();
  $("#step6-proposte").fadeIn(300);
}