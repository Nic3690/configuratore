import { configurazione, mappaTipologieVisualizzazione, mappaStripLedVisualizzazione } from '../config.js';
import { updateProgressBar } from '../utils.js';
import { finalizzaConfigurazione } from '../api.js';

export function initStep6Listeners() {
  // Torna da proposte a controllo (step 5)
  $('#btn-torna-step5-from-proposte').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-proposte").fadeOut(300, function() {
      $("#step5-controllo").fadeIn(300);
      updateProgressBar(5);
    });
  });
  
  // Continua dalle proposte al riepilogo (step 7)
  $('#btn-continua-step6').on('click', function(e) {
    e.preventDefault();
    
    // Passiamo al riepilogo
    finalizzaConfigurazione();
  });

  // Gestione delle proposte di lunghezza standard
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
    
    // Abilita il pulsante per continuare
    $('#btn-continua-step6').prop('disabled', false);
  });
}

// Funzione per calcolare le proposte di lunghezza
function calcolaProposte(lunghezzaRichiesta) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/calcola_lunghezze',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        lunghezzaRichiesta: lunghezzaRichiesta
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
  // Popola i badge con le informazioni correnti
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip' && configurazione.stripLedSelezionata !== 'NO_STRIP') {
    // Usa il nome commerciale se disponibile
    const nomeStripLed = configurazione.nomeCommercialeStripLed || 
                         mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || 
                         configurazione.stripLedSelezionata;
    
    $('#strip-nome-step6').text(nomeStripLed);
  } else {
    $('#strip-nome-step6').text('Senza Strip LED');
  }
  
  $('#lunghezza-attuale').text(configurazione.lunghezzaRichiesta || 0);
  $('#step6-lunghezza-finale').text(configurazione.lunghezzaRichiesta || 0);

  if (configurazione.lunghezzaRichiesta && configurazione.lunghezzaRichiesta > 0) {
    $('#step6-proposte-container').html(`
      <div class="text-center mt-3 mb-3">
        <div class="spinner-border" role="status"></div>
        <p class="mt-3">Calcolo proposte di lunghezza...</p>
      </div>
    `);

    calcolaProposte(configurazione.lunghezzaRichiesta)
      .then(data => {
        $('#step6-proposte-container').html(`
          <h5>Proposte di lunghezza standard</h5>
          <p>Il sistema ha calcolato delle proposte di lunghezza standard più adatte per la tua installazione.</p>
          <p><strong style="color:#ff0000;">ATTENZIONE:</strong> se viene utilizzata la lunghezza personalizzata si verificherà uno spazio buio di <span id="step6-spazio-produzione">${data.spazioProduzione || 5}</span>mm.</p>
          
          <div class="row mt-3">
            <div class="col-md-6 mb-2">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Proposta 1</h5>
                  <p class="card-text"><span id="step6-proposta1-valore">${data.proposte.proposta1}mm</span></p>
                  <button class="btn btn-outline-primary btn-seleziona-proposta" data-proposta="1" data-valore="${data.proposte.proposta1}">Seleziona</button>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-2">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Proposta 2</h5>
                  <p class="card-text"><span id="step6-proposta2-valore">${data.proposte.proposta2}mm</span></p>
                  <button class="btn btn-outline-primary btn-seleziona-proposta" data-proposta="2" data-valore="${data.proposte.proposta2}">Seleziona</button>
                </div>
              </div>
            </div>
          </div>
        `);

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
      })
      .catch(error => {
        $('#step6-proposte-container').html(`
          <div class="alert alert-danger">
            <p>Non è stato possibile calcolare le proposte di lunghezza. Verrà utilizzata la lunghezza originale.</p>
          </div>
        `);
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