import { configurazione, mappaTipologieVisualizzazione, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaCategorieVisualizzazione } from './config.js';
import { formatTemperatura, getTemperaturaColor, checkParametriCompletion, checkStep2Completion, updateProgressBar } from './utils.js';

/**
 * Carica i profili per la categoria selezionata
 * @param {string} categoria - La categoria selezionata
 */
export function caricaProfili(categoria) {
  
  $('#profili-container').empty().html('<div class="text-center mt-5"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento profili...</p></div>');
  
  $.ajax({
    url: `/get_profili/${categoria}`,
    method: 'GET',
    success: function(data) {
      
      $('#profili-container').empty();
      
      if (!data || data.length === 0) {
        $('#profili-container').html('<div class="col-12 text-center"><p>Nessun profilo disponibile per questa categoria.</p></div>');
        return;
      }
      
      let grid = $('<div class="row"></div>');
      $('#profili-container').append(grid);
      
      data.forEach(function(profilo) {
        let profiloCard = $(`
          <div class="col-md-4 col-sm-6 mb-4 profilo-card-row">
            <div class="card profilo-card" data-id="${profilo.id}" data-nome="${profilo.nome}">
              <img src="${profilo.immagine || '/static/img/placeholder.jpg'}" class="card-img-top" alt="${profilo.nome}" onerror="this.src='/static/img/placeholder.jpg'">
              <div class="card-body">
                <h5 class="card-title">${profilo.nome}</h5>
              </div>
            </div>
          </div>
        `);
        
        // Aggiungi badge di compatibilità con strip LED se disponibile
        if (profilo.stripLedCompatibiliInfo && profilo.stripLedCompatibiliInfo.length > 0) {
          const stripCount = profilo.stripLedCompatibiliInfo.length;
          const $cardBody = profiloCard.find('.card-body');
          
          // Crea badge di compatibilità
          const $badge = $('<div class="compatibility-badge mt-2">')
            .append($('<span class="badge bg-success">').text(`Strip LED compatibili: ${stripCount}`));
          
          // Aggiungi tooltip con informazioni sulle strip compatibili
          let tooltipContent = "Strip LED compatibili: ";
          const stripNomi = profilo.stripLedCompatibiliInfo
            .filter(s => s.nomeCommerciale)
            .map(s => s.nomeCommerciale)
            .filter((v, i, a) => a.indexOf(v) === i); // Rimuovi duplicati
          
          if (stripNomi.length > 0) {
            tooltipContent += stripNomi.join(", ");
            $badge.attr('title', tooltipContent)
              .attr('data-bs-toggle', 'tooltip')
              .attr('data-bs-placement', 'top');
          }
          
          $cardBody.append($badge);
        }
        
        grid.append(profiloCard);
      });
      
      $('.profilo-card').on('click', function(e) {
        e.stopPropagation();
        $('.profilo-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.profiloSelezionato = $(this).data('id');
        configurazione.nomeModello = $(this).data('nome');
        
        caricaOpzioniProfilo(configurazione.profiloSelezionato);
      });
      
      // Inizializza i tooltip Bootstrap
      $('[data-bs-toggle="tooltip"]').tooltip();
    },
    error: function(error) {
      console.error("Errore nel caricamento dei profili:", error);
      $('#profili-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento dei profili. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le opzioni per il profilo selezionato
 * @param {string} profiloId - ID del profilo selezionato
 */
export function caricaOpzioniProfilo(profiloId) {
  
  $('#tipologie-options').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni...</p></div>');
  
  $('#btn-continua-step2').prop('disabled', true);
  
  configurazione.tipologiaSelezionata = null;
  configurazione.stripLedSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_profilo/${profiloId}`,
    method: 'GET',
    success: function(data) {
      
      $('#tipologie-options').empty();
      
      $('#tipologia-container').show();
      
      if (!data.tipologie || data.tipologie.length === 0) {
        $('#tipologie-options').html('<div class="col-12 text-center"><p>Nessuna tipologia disponibile per questo profilo.</p></div>');
      } else {
        data.tipologie.forEach(function(tipologia) {
          $('#tipologie-options').append(`
            <div class="col-md-6 mb-3">
              <div class="card option-card tipologia-card" data-id="${tipologia}">
                <div class="card-body text-center">
                  <h5 class="card-title">${mappaTipologieVisualizzazione[tipologia] || tipologia}</h5>
                </div>
              </div>
            </div>
          `);
        });
      }
      
      $('.tipologia-card').on('click', function() {
        $('.tipologia-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.tipologiaSelezionata = $(this).data('id');
        
        checkStep2Completion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni:", error);
      $('#tipologie-options').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le opzioni parametri per il profilo selezionato
 * @param {string} profiloId - ID del profilo selezionato
 */
export function caricaOpzioniParametri(profiloId) {
  
  $('#tensione-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni tensione...</p>');
  $('#ip-options').empty();
  $('#temperatura-iniziale-options').empty();
  
  configurazione.tensioneSelezionato = null;
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $('#btn-continua-parametri').prop('disabled', true);
  
  $.ajax({
    url: `/get_opzioni_tensione/${profiloId}`,
    method: 'GET',
    success: function(data) {
      
      $('#tensione-options').empty();
      
      if (!data.success) {
        $('#tensione-options').html('<p class="text-danger">Errore nel caricamento delle opzioni tensione.</p>');
        return;
      }
      
      if (!data.voltaggi || data.voltaggi.length === 0) {
        $('#tensione-options').html('<p>Nessuna opzione di tensione disponibile per questo profilo.</p>');
        return;
      }
      
      data.voltaggi.sort((a, b) => {
        const voltA = parseInt(a.replace('V', ''));
        const voltB = parseInt(b.replace('V', ''));
        return voltA - voltB;  
      });

      data.voltaggi.forEach(function(tensione) {
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
        
        caricaOpzioniIP(profiloId, configurazione.tensioneSelezionato);
        checkParametriCompletion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni tensione:", error);
      $('#tensione-options').html('<p class="text-danger">Errore nel caricamento delle opzioni tensione. Riprova più tardi.</p>');
    }
  });
}

/**
 * Carica le opzioni IP per il profilo e tensione selezionati
 * @param {string} profiloId - ID del profilo
 * @param {string} tensione - Tensione selezionato
 */
export function caricaOpzioniIP(profiloId, tensione) {
  
  $('#ip-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni IP...</p>');
  $('#temperatura-iniziale-options').empty();
  
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_ip/${profiloId}/${tensione}`,
    method: 'GET',
    success: function(data) {
      
      $('#ip-options').empty();
      
      if (!data.success) {
        $('#ip-options').html('<p class="text-danger">Errore nel caricamento delle opzioni IP.</p>');
        return;
      }
      
      if (!data.ip || data.ip.length === 0) {
        $('#ip-options').html('<p>Nessuna opzione IP disponibile per questa combinazione.</p>');
        return;
      }
      
      data.ip.forEach(function(ip) {
        $('#ip-options').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card ip-card" data-ip="${ip}">
              <div class="card-body text-center">
                <h5 class="card-title">${mappaIPVisualizzazione[ip] || ip}</h5>
              </div>
            </div>
          </div>
        `);
      });
      
      $('.ip-card').on('click', function() {
        $('.ip-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.ipSelezionato = $(this).data('ip');
        
        caricaOpzioniTemperaturaIniziale(profiloId, configurazione.tensioneSelezionato, configurazione.ipSelezionato);
        checkParametriCompletion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni IP:", error);
      $('#ip-options').html('<p class="text-danger">Errore nel caricamento delle opzioni IP. Riprova più tardi.</p>');
    }
  });
}

/**
 * Carica le opzioni temperatura iniziale per il profilo, tensione e IP selezionati
 * @param {string} profiloId - ID del profilo
 * @param {string} tensione - Tensione selezionato
 * @param {string} ip - IP selezionato
 */
export function caricaOpzioniTemperaturaIniziale(profiloId, tensione, ip) {
  
  $('#temperatura-iniziale-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni temperatura...</p>');
  
  configurazione.temperaturaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_temperatura_iniziale/${profiloId}/${tensione}/${ip}`,
    method: 'GET',
    success: function(data) {
      
      $('#temperatura-iniziale-options').empty();
      
      if (!data.success) {
        $('#temperatura-iniziale-options').html('<p class="text-danger">Errore nel caricamento delle opzioni temperatura.</p>');
        return;
      }
      
      if (!data.temperature || data.temperature.length === 0) {
        $('#temperatura-iniziale-options').html('<p>Nessuna opzione di temperatura disponibile per questa combinazione.</p>');
        return;
      }
      
      data.temperature.forEach(function(temperatura) {
        $('#temperatura-iniziale-options').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card temperatura-iniziale-card" data-temperatura="${temperatura}">
              <div class="card-body text-center">
                <h5 class="card-title">${formatTemperatura(temperatura)}</h5>
                <div class="temperatura-color-preview mt-2 mb-3" style="background: ${getTemperaturaColor(temperatura)};"></div>
              </div>
            </div>
          </div>
        `);
      });
      
      $('<style>').text(`
        .temperatura-color-preview {
          width: 100%;
          height: 30px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
      `).appendTo('head');
      
      $('.temperatura-iniziale-card').on('click', function() {
        $('.temperatura-iniziale-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.temperaturaSelezionata = $(this).data('temperatura');
        
        checkParametriCompletion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni temperatura:", error);
      $('#temperatura-iniziale-options').html('<p class="text-danger">Errore nel caricamento delle opzioni temperatura. Riprova più tardi.</p>');
    }
  });
}

/**
 * Carica le strip LED filtrate in base ai parametri selezionati
 * @param {string} profiloId - ID del profilo
 * @param {string} tensione - Tensione selezionato
 * @param {string} ip - IP selezionato
 * @param {string} temperatura - Temperatura selezionata
 */
export function caricaStripLedFiltrate(profiloId, tensione, ip, temperatura) {
  
  $('#strip-led-filtrate-options').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni strip LED...</p></div>');
  
  configurazione.stripLedSelezionata = null;
  configurazione.nomeCommercialeStripLed = null;
  configurazione.codiciProdottoStripLed = null;
  
  $('#btn-continua-strip').prop('disabled', true);
  
  $.ajax({
    url: `/get_strip_led_filtrate/${profiloId}/${tensione}/${ip}/${temperatura}`,
    method: 'GET',
    success: function(data) {
      
      $('#strip-led-filtrate-options').empty();
      
      if (!data.success) {
        $('#strip-led-filtrate-options').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle strip LED filtrate.</p></div>');
        return;
      }
      
      if (!data.strip_led || data.strip_led.length === 0) {
        $('#strip-led-filtrate-options').html('<div class="col-12 text-center"><p>Nessuna strip LED disponibile per questa combinazione di parametri.</p></div>');
        return;
      }
      
      data.strip_led.forEach(function(strip) {
        // Usa il nome commerciale se disponibile
        const nomeVisualizzato = strip.nomeCommerciale || strip.nome;
        
        $('#strip-led-filtrate-options').append(`
          <div class="col-md-6 mb-3">
            <div class="card option-card strip-led-filtrata-card" data-strip="${strip.id}" data-nome-commerciale="${strip.nomeCommerciale || ''}">
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
      
      if (data.strip_led_opzionale) {
        $('#strip-led-filtrate-options').prepend(`
          <div class="col-md-6 mb-3">
            <div class="card option-card strip-led-filtrata-card" data-strip="NO_STRIP">
              <div class="card-body text-center">
                <h5 class="card-title">Senza Strip LED</h5>
                <p class="card-text small text-muted">Configura il profilo senza illuminazione</p>
              </div>
            </div>
          </div>
        `);
      }
      
      $('.strip-led-filtrata-card').on('click', function() {
        $('.strip-led-filtrata-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.stripLedSelezionata = $(this).data('strip');
        
        // Memorizza il nome commerciale se disponibile
        const nomeCommerciale = $(this).data('nome-commerciale');
        if (nomeCommerciale) {
          configurazione.nomeCommercialeStripLed = nomeCommerciale;
          
          // Chiama l'API per ottenere i codici prodotto
          $.ajax({
            url: `/get_nomi_commerciali/${configurazione.stripLedSelezionata}`,
            method: 'GET',
            success: function(response) {
              if (response.success) {
                configurazione.codiciProdottoStripLed = response.codiciProdotto;
              }
            }
          });
        }
        
        $('#btn-continua-strip').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle strip LED filtrate:", error);
      $('#strip-led-filtrate-options').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle strip LED filtrate. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le opzioni di potenza per la strip e temperatura selezionate
 * @param {string} stripId - ID della strip LED
 * @param {string} temperatura - Temperatura selezionata
 */
export function caricaOpzioniPotenza(stripId, temperatura) {
  
  $('#potenza-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni potenza...</p></div>');
  
  $('#btn-continua-step3').prop('disabled', true);
  
  configurazione.potenzaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_potenza/${stripId}/${temperatura}`,
    method: 'GET',
    success: function(data) {
      
      $('#potenza-container').empty();
      
      if (!data.success) {
        $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza.</p></div>');
        return;
      }
      
      if (!data.potenze || data.potenze.length === 0) {
        $('#potenza-container').html('<div class="col-12 text-center"><p>Nessuna opzione di potenza disponibile per questa combinazione.</p></div>');
        return;
      }
      
      data.potenze.forEach(function(potenza) {
        $('#potenza-container').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card potenza-card" data-potenza="${potenza.id}" data-codice="${potenza.codice}">
              <div class="card-body">
                <h5 class="card-title">${potenza.nome}</h5>
                <p class="card-text small text-muted">${potenza.specifiche}</p>
                <p class="card-text small">Codice: <strong>${potenza.codice}</strong></p>
              </div>
            </div>
          </div>
        `);
      });
      
      $('.potenza-card').on('click', function() {
        $('.potenza-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.potenzaSelezionata = $(this).data('potenza');
        configurazione.codicePotenza = $(this).data('codice');
        
        $('#btn-continua-step3').prop('disabled', false);
        
        // Calcola potenza consigliata per l'alimentatore
        if (configurazione.lunghezzaRichiesta || configurazione.lunghezzaSelezionata) {
          calcolaPotenzaAlimentatoreConsigliata();
        }
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni potenza:", error);
      $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Calcola la potenza dell'alimentatore consigliata
 */
function calcolaPotenzaAlimentatoreConsigliata() {
  // Se non c'è una strip LED o non c'è una potenza selezionata, non fare nulla
  if (configurazione.stripLedSelezionata === 'NO_STRIP' || 
      !configurazione.potenzaSelezionata) {
    return;
  }

  // Estrai il valore numerico della potenza dalla stringa (es. "14W/m" -> 14)
  let potenzaPerMetro = 0;
  const potenzaMatch = configurazione.potenzaSelezionata.match(/(\d+(\.\d+)?)/);
  if (potenzaMatch && potenzaMatch[1]) {
    potenzaPerMetro = parseFloat(potenzaMatch[1]);
  }

  // Calcola la lunghezza in metri
  let lunghezzaMetri = 0;
  if (configurazione.lunghezzaRichiesta) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaRichiesta) / 1000;
  } else if (configurazione.lunghezzaSelezionata) {
    lunghezzaMetri = parseFloat(configurazione.lunghezzaSelezionata) / 1000;
  }

  // Se abbiamo sia potenza che lunghezza, chiamiamo l'API
  if (potenzaPerMetro > 0 && lunghezzaMetri > 0) {
    $.ajax({
      url: '/calcola_potenza_alimentatore',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        potenzaPerMetro: potenzaPerMetro,
        lunghezzaMetri: lunghezzaMetri
      }),
      success: function(response) {
        if (response.success) {
          // Memorizza la potenza consigliata nella configurazione
          configurazione.potenzaConsigliataAlimentatore = response.potenzaConsigliata;
        }
      },
      error: function(error) {
        console.error("Errore nel calcolo della potenza dell'alimentatore:", error);
      }
    });
  }
}

/**
 * Carica le opzioni alimentatore in base al tipo di alimentazione
 * @param {string} tipoAlimentazione - Tipo di alimentazione selezionato
 */
export function caricaOpzioniAlimentatore(tipoAlimentazione) {
  
  $('#alimentatore-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni alimentatore...</p></div>');
  
  $('#btn-continua-step4').prop('disabled', true);
  
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_alimentatore/${tipoAlimentazione}`,
    method: 'GET',
    success: function(data) {
      
      $('#alimentatore-container').empty();
      
      if (!data.success) {
        $('#alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni alimentatore.</p></div>');
        return;
      }
      
      const alimentatori = data.alimentatori;
      
      if (!alimentatori || alimentatori.length === 0) {
        $('#alimentatore-container').html('<div class="col-12 text-center"><p>Nessun alimentatore disponibile per questo tipo di alimentazione.</p></div>');
        return;
      }
      
      // Mostra la potenza consigliata
      if (configurazione.potenzaConsigliataAlimentatore) {
        $('#potenza-consigliata').text(configurazione.potenzaConsigliataAlimentatore);
        $('#potenza-consigliata-section').show();
      }
      
      alimentatori.forEach(function(alimentatore) {
        // Evidenzia gli alimentatori che supportano la potenza consigliata
        let supportaPotenzaConsigliata = '';
        if (configurazione.potenzaConsigliataAlimentatore && 
            alimentatore.potenze.includes(configurazione.potenzaConsigliataAlimentatore)) {
          supportaPotenzaConsigliata = '<div class="alert alert-success mt-2">Supporta la potenza consigliata</div>';
        }
        
        $('#alimentatore-container').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card alimentatore-card" data-alimentatore="${alimentatore.id}">
              <div class="card-body">
                <h5 class="card-title">${alimentatore.nome}</h5>
                <p class="card-text small text-muted">${alimentatore.descrizione}</p>
                <p class="card-text small">Potenze disponibili: ${alimentatore.potenze.join(', ')}W</p>
                ${supportaPotenzaConsigliata}
              </div>
            </div>
          </div>
        `);
      });
      
      $('.alimentatore-card').on('click', function() {
        $('.alimentatore-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.tipologiaAlimentatoreSelezionata = $(this).data('alimentatore');
        
        $('#btn-continua-step4').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni alimentatore:", error);
      $('#alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni alimentatore. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le finiture disponibili per il profilo
 * @param {string} profiloId - ID del profilo selezionato
 */
export function caricaFinitureDisponibili(profiloId) {
  
  $('.finitura-card').removeClass('selected');
  configurazione.finituraSelezionata = null;
  
  $.ajax({
    url: `/get_finiture/${profiloId}`,
    method: 'GET',
    success: function(data) {
      
      if (!data.success) {
        $('.finitura-card').parent().show();
        return;
      }
      
      const finitureDisponibili = data.finiture.map(f => f.id);
      
      $('.finitura-card').parent().hide();
      
      finitureDisponibili.forEach(function(finituraId) {
        $(`.finitura-card[data-finitura="${finituraId}"]`).parent().show();
      });
      
      if (finitureDisponibili.length === 0) {
        $('.finitura-card').parent().show();
      }
    },
    error: function(error) {
      console.error("Errore nel caricamento delle finiture:", error);
      $('.finitura-card').parent().show();
    }
  });
}

/**
 * Calcola le proposte di lunghezza
 * @param {number} lunghezzaRichiesta - Lunghezza richiesta dall'utente
 */
export function calcolaProposte(lunghezzaRichiesta) {
  $.ajax({
    url: '/calcola_lunghezze',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      lunghezzaRichiesta: lunghezzaRichiesta
    }),
    success: function(data) {
      
      if (!data.success) {
        $('#proposte-container').hide();
        return;
      }
      
      configurazione.proposta1 = data.proposte.proposta1;
      configurazione.proposta2 = data.proposte.proposta2;
      configurazione.spazioProduzione = data.spazioProduzione || 5;
      
      $('#proposta1-valore').text(data.proposte.proposta1 + 'mm');
      $('#proposta2-valore').text(data.proposte.proposta2 + 'mm');
      $('#spazio-produzione').text(data.spazioProduzione);
      
      $('.btn-seleziona-proposta[data-proposta="1"]').data('valore', data.proposte.proposta1);
      $('.btn-seleziona-proposta[data-proposta="2"]').data('valore', data.proposte.proposta2);
      
      $('#proposte-container').show();
      
      // Ricalcola la potenza consigliata dell'alimentatore quando la lunghezza cambia
      calcolaPotenzaAlimentatoreConsigliata();
    },
    error: function(error) {
      console.error("Errore nel calcolo delle proposte:", error);
      $('#proposte-container').hide();
    }
  });
}

/**
 * Finalizza la configurazione e genera il riepilogo
 */
export function finalizzaConfigurazione() {
  
  $('#riepilogo-container').html('<div class="text-center my-5"><div class="spinner-border" role="status"></div><p class="mt-3">Generazione riepilogo...</p></div>');
  
  $("#step6-personalizzazione").fadeOut(300, function() {
    $("#step7-riepilogo").fadeIn(300);
    
    updateProgressBar(7);
    
    $.ajax({
      url: '/finalizza_configurazione',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(configurazione),
      success: function(data) {
        
        if (!data.success) {
          $('#riepilogo-container').html('<div class="alert alert-danger">Errore nella finalizzazione della configurazione. Riprova più tardi.</div>');
          return;
        }
        
        const riepilogo = data.riepilogo;
        const potenzaTotale = data.potenzaTotale;
        const codiceProdotto = data.codiceProdotto;
        
        let riepilogoHtml = `
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4>Riepilogo della configurazione</h4>
              <h6>Codice prodotto: ${codiceProdotto}</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-striped">
                    <tbody>
                      <tr>
                        <th scope="row">Categoria</th>
                        <td>${mappaCategorieVisualizzazione[riepilogo.categoriaSelezionata] || riepilogo.categoriaSelezionata}</td>
                      </tr>
                      <tr>
                        <th scope="row">Modello</th>
                        <td>${riepilogo.nomeModello}</td>
                      </tr>
                      <tr>
                        <th scope="row">Tipologia</th>
                        <td>${mappaTipologieVisualizzazione[riepilogo.tipologiaSelezionata] || riepilogo.tipologiaSelezionata}</td>
                      </tr>
                      <tr>
                        <th scope="row">Tensione</th>
                        <td>${mappaTensioneVisualizzazione[riepilogo.tensioneSelezionato] || riepilogo.tensioneSelezionato}</td>
                      </tr>
                      <tr>
                        <th scope="row">Grado IP</th>
                        <td>${mappaIPVisualizzazione[riepilogo.ipSelezionato] || riepilogo.ipSelezionato}</td>
                      </tr>
                      <tr>
                        <th scope="row">Temperatura</th>
                        <td>${formatTemperatura(riepilogo.temperaturaSelezionata)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Strip LED</th>
                        <td>${riepilogo.stripLedSelezionata === 'NO_STRIP' ? 'Senza Strip LED' : 
                             (riepilogo.nomeCommercialeStripLed || 
                              mappaStripLedVisualizzazione[riepilogo.stripLedSelezionata] || 
                              riepilogo.stripLedSelezionata)}</td>
                      </tr>
        `;
        
        if (riepilogo.stripLedSelezionata !== 'NO_STRIP' && riepilogo.stripLedSelezionata !== 'senza_strip') {
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Potenza</th>
                        <td>${riepilogo.potenzaSelezionata} - ${riepilogo.codicePotenza}</td>
                      </tr>
          `;
        }
        
        riepilogoHtml += `
                      <tr>
                        <th scope="row">Alimentazione</th>
                        <td>${riepilogo.alimentazioneSelezionata === 'SENZA_ALIMENTATORE' ? 'Senza alimentatore' : (riepilogo.alimentazioneSelezionata === 'ON-OFF' ? 'ON-OFF' : 'Dimmerabile TRIAC')}</td>
                      </tr>
        `;
        
        if (riepilogo.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE') {
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Alimentatore</th>
                        <td>${riepilogo.tipologiaAlimentatoreSelezionata}</td>
                      </tr>
          `;
          
          if (riepilogo.potenzaConsigliataAlimentatore) {
            riepilogoHtml += `
                      <tr>
                        <th scope="row">Potenza consigliata</th>
                        <td>${riepilogo.potenzaConsigliataAlimentatore}W</td>
                      </tr>
            `;
          }
        }
        
        riepilogoHtml += `
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-striped">
                    <tbody>
                      <tr>
                        <th scope="row">Dimmer</th>
                        <td>${riepilogo.dimmerSelezionato === 'NESSUN_DIMMER' ? 'Nessun dimmer' : riepilogo.dimmerSelezionato.replace(/_/g, ' ')}</td>
                      </tr>
                      <tr>
                        <th scope="row">Alimentazione cavo</th>
                        <td>${riepilogo.tipoAlimentazioneCavo === 'ALIMENTAZIONE_UNICA' ? 'Alimentazione unica' : 'Alimentazione doppia'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Lunghezza cavo ingresso</th>
                        <td>${riepilogo.lunghezzaCavoIngresso}mm</td>
                      </tr>
        `;
        
        if (riepilogo.tipoAlimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Lunghezza cavo uscita</th>
                        <td>${riepilogo.lunghezzaCavoUscita}mm</td>
                      </tr>
          `;
        }
        
        riepilogoHtml += `
                      <tr>
                        <th scope="row">Uscita cavo</th>
                        <td>${riepilogo.uscitaCavoSelezionata}</td>
                      </tr>
                      <tr>
                        <th scope="row">Forma di taglio</th>
                        <td>${mappaFormeTaglio[riepilogo.formaDiTaglioSelezionata] || riepilogo.formaDiTaglioSelezionata}</td>
                      </tr>
                      <tr>
                        <th scope="row">Finitura</th>
                        <td>${mappaFiniture[riepilogo.finituraSelezionata] || riepilogo.finituraSelezionata}</td>
                      </tr>
                      <tr>
                        <th scope="row">Lunghezza richiesta</th>
                        <td>${riepilogo.lunghezzaRichiesta}mm</td>
                      </tr>
        `;
        
        if (riepilogo.stripLedSelezionata !== 'NO_STRIP' && riepilogo.stripLedSelezionata !== 'senza_strip') {
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Potenza totale</th>
                        <td>${potenzaTotale}W</td>
                      </tr>
          `;
        }
        
        riepilogoHtml += `
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="text-center mt-4">
                <div class="alert alert-info">
                  <strong>Note:</strong> Lo spazio necessario per tappi e saldatura è di ${riepilogo.spazioProduzione || 5}mm.
                </div>
                <button class="btn btn-success btn-lg me-2" id="btn-salva-configurazione">Salva configurazione</button>
                <button class="btn btn-primary btn-lg" id="btn-preventivo">Richiedi preventivo</button>
              </div>
            </div>
          </div>
        `;
        
        $('#riepilogo-container').html(riepilogoHtml);
        
        $('#btn-salva-configurazione').on('click', function() {
          salvaConfigurazione(codiceProdotto);
        });
        
        $('#btn-preventivo').on('click', function() {
          richiedPreventivo(codiceProdotto);
        });
      },
      error: function(error) {
        console.error("Errore nella finalizzazione della configurazione:", error);
        $('#riepilogo-container').html('<div class="alert alert-danger">Errore nella finalizzazione della configurazione. Riprova più tardi.</div>');
      }
    });
  });
}

/**
 * Salva la configurazione come file JSON
 * @param {string} codiceProdotto - Codice prodotto finale
 */
export function salvaConfigurazione(codiceProdotto) {
  const configurazioneDaScaricare = {
    codiceProdotto: codiceProdotto,
    configurazione: configurazione,
    dataCreazione: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(configurazioneDaScaricare, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `configurazione_${codiceProdotto}_${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  alert("Configurazione salvata con successo!");
}

/**
 * Richiede un preventivo per il prodotto configurato
 * @param {string} codiceProdotto - Codice prodotto finale
 */
export function richiedPreventivo(codiceProdotto) {
  alert(`La richiesta di preventivo per il prodotto ${codiceProdotto} è stata inviata al nostro team. Verrai contattato al più presto.`);
}
