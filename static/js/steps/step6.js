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

  // Gestione proposte semplici (forme dritte)
  $(document).on('click', '.btn-seleziona-proposta', function() {
    $('.btn-seleziona-proposta').removeClass('active');
    $(this).addClass('active');
    
    const proposta = $(this).data('proposta');
    const valore = parseInt($(this).data('valore'), 10);
    
    if (proposta === 1) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    } else if (proposta === 2) {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    } else if (proposta === 'originale') {
      configurazione.lunghezzaRichiesta = valore;
      $('#step6-lunghezza-finale').text(valore);
    }
    $('#btn-continua-step6').prop('disabled', false);
  });

  // Gestione combinazioni per forme complesse  
  $(document).on('click', '.btn-seleziona-combinazione', function() {
    console.log('Click su combinazione rilevato!');
    
    $('.btn-seleziona-combinazione').removeClass('active');
    $(this).addClass('active');
    
    const combinazioneData = $(this).data('combinazione');
    console.log('Dati raw combinazione:', combinazioneData);
    
    let combinazione;
    if (typeof combinazioneData === 'string') {
      combinazione = JSON.parse(combinazioneData);
    } else {
      combinazione = combinazioneData;
    }
    
    console.log('Combinazione parsata:', combinazione);
    console.log('Lunghezze combinazione:', combinazione.lunghezze);
    
    // Aggiorna le lunghezze multiple nella configurazione
    configurazione.lunghezzeMultiple = Object.assign({}, combinazione.lunghezze);
    configurazione.lunghezzaRichiesta = combinazione.lunghezza_totale;
    
    console.log('Configurazione aggiornata:');
    console.log('- lunghezzeMultiple:', configurazione.lunghezzeMultiple);
    console.log('- lunghezzaRichiesta:', configurazione.lunghezzaRichiesta);
    
    $('#step6-lunghezza-finale').text(combinazione.lunghezza_totale);
    
    // Mostra/nascondi warning per spazio buio
    $('#spazio-buio-warning').remove();
    if (combinazione.ha_spazio_buio) {
      $('.alert.alert-success.mt-4').append(`
        <p id="spazio-buio-warning" class="text-danger mb-0 mt-2" style="font-size: 1rem; color:#e83f34 !important">
          <strong>ATTENZIONE:</strong> Questa combinazione avrà degli spazi bui in alcuni lati
        </p>
      `);
    }
    
    $('#btn-continua-step6').prop('disabled', false);
  });
}

function calcolaProposte(lunghezzaRichiesta) {
  return new Promise((resolve, reject) => {
    const requestData = {
      lunghezzaRichiesta: lunghezzaRichiesta,
      stripLedSelezionata: configurazione.stripLedSelezionata,
      potenzaSelezionata: configurazione.potenzaSelezionata,
      formaDiTaglioSelezionata: configurazione.formaDiTaglioSelezionata
    };

    // Aggiungi lunghezze multiple se non è dritto semplice
    if (configurazione.formaDiTaglioSelezionata !== 'DRITTO_SEMPLICE' && configurazione.lunghezzeMultiple) {
      requestData.lunghezzeMultiple = configurazione.lunghezzeMultiple;
    }

    $.ajax({
      url: '/calcola_lunghezze',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(requestData),
      success: function(data) {
        if (!data.success) {
          reject("Errore nel calcolo delle proposte");
          return;
        }
        
        configurazione.spazioProduzione = data.spazioProduzione || 5;
        
        if (data.tipo === 'semplice') {
          // Comportamento originale
          configurazione.proposta1 = data.proposte.proposta1;
          configurazione.proposta2 = data.proposte.proposta2;
        } else {
          // Nuove combinazioni per forme complesse
          configurazione.propostePerLato = data.proposte_per_lato;
          configurazione.combinazioni = data.combinazioni;
        }
        
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
        if (data.tipo === 'semplice') {
          renderProposteSemplici(data, lunghezzaOriginale);
        } else {
          renderProposteCombinazioni(data);
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

function renderProposteSemplici(data, lunghezzaOriginale) {
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

  if (coincideConProposta1) {
    $('.btn-seleziona-proposta[data-proposta="1"]').addClass('active');
    configurazione.lunghezzaRichiesta = data.proposte.proposta1;
    $('#step6-lunghezza-finale').text(data.proposte.proposta1);
    $('#btn-continua-step6').prop('disabled', false);
  } else if (coincideConProposta2) {
    $('.btn-seleziona-proposta[data-proposta="2"]').addClass('active');
    configurazione.lunghezzaRichiesta = data.proposte.proposta2;
    $('#step6-lunghezza-finale').text(data.proposte.proposta2);
    $('#btn-continua-step6').prop('disabled', false);
  }
}

function renderProposteCombinazioni(data) {
  console.log('Rendering combinazioni:', data.combinazioni);
  
  const etichetteLati = {
    'FORMA_L_DX': {
      'lato1': 'Lato orizzontale',
      'lato2': 'Lato verticale'
    },
    'FORMA_L_SX': {
      'lato1': 'Lato orizzontale',
      'lato2': 'Lato verticale'
    },
    'FORMA_C': {
      'lato1': 'Lato orizzontale superiore',
      'lato2': 'Lato verticale',
      'lato3': 'Lato orizzontale inferiore'
    },
    'RETTANGOLO_QUADRATO': {
      'lato1': 'Lunghezza',
      'lato2': 'Larghezza'
    }
  };

  const etichette = etichetteLati[configurazione.formaDiTaglioSelezionata] || {};
  
  let proposteHTML = `
    <h5>Proposte di combinazioni per forma complessa</h5>
    <p>Il sistema ha calcolato diverse combinazioni ottimali per i tuoi lati. Seleziona la combinazione che preferisci:</p>
  `;

  // Mostra prima un riepilogo dei lati originali
  proposteHTML += `
    <div class="alert alert-info mb-4">
      <h6>Misure originali inserite:</h6>
      <ul class="mb-0">
  `;
  
  Object.entries(configurazione.lunghezzeMultiple).forEach(([lato, valore]) => {
    if (valore) {
      const etichetta = etichette[lato] || `Lato ${lato.replace('lato', '')}`;
      proposteHTML += `<li>${etichetta}: ${valore}mm</li>`;
    }
  });
  
  proposteHTML += `
      </ul>
    </div>
    <div class="row mt-3">
  `;

  data.combinazioni.forEach((combinazione, index) => {
    let cardClass = 'btn-outline-primary';
    let badgeClass = 'bg-success';
    let badgeText = 'Ottimale';
    
    if (combinazione.ha_spazio_buio) {
      cardClass = 'btn-outline-primary';
      badgeClass = 'bg-warning';
      badgeText = 'Spazio buio';
    }

    const combinazioneJson = JSON.stringify(combinazione).replace(/"/g, '&quot;');
    
    proposteHTML += `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-body text-center">
            <h6 class="card-title">
              Combinazione ${index + 1}
              <span class="badge ${badgeClass} ms-2">${badgeText}</span>
            </h6>
            <div class="small text-start mb-2">
    `;
    
    Object.entries(combinazione.lunghezze).forEach(([lato, valore]) => {
      const etichetta = etichette[lato] || `Lato ${lato.replace('lato', '')}`;
      const originale = configurazione.lunghezzeMultiple[lato];
      const isModificato = valore !== originale;
      
      proposteHTML += `
        <div>${etichetta}: ${valore}mm ${isModificato ? `<small class="text-muted">(era ${originale}mm)</small>` : ''}</div>
      `;
    });
    
    proposteHTML += `
            </div>
            <p class="card-text small"><strong>Totale: ${combinazione.lunghezza_totale}mm</strong></p>
            <button class="btn ${cardClass} btn-seleziona-combinazione" 
                    data-combinazione="${combinazioneJson}">
              Seleziona
            </button>
          </div>
        </div>
      </div>
    `;
  });

  proposteHTML += `</div>`;
  
  $('#step6-proposte-container').html(proposteHTML);
  
  console.log('HTML generato per combinazioni. Pulsante continua:', $('#btn-continua-step6').prop('disabled'));
  
  // NON fare nessuna selezione automatica - lascia che sia l'utente a scegliere
  // Il pulsante rimane disabilitato finché l'utente non fa una scelta
}