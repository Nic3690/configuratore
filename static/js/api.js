import { configurazione, mappaTipologieVisualizzazione, mappaTensioneVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaCategorieVisualizzazione, mappaTipologiaStripVisualizzazione, mappaSpecialStripVisualizzazione } from './config.js';
import { formatTemperatura, getTemperaturaColor, checkParametriCompletion, checkStep2Completion, updateProgressBar } from './utils.js';
import { initRiepilogoOperationsListeners } from './steps/step7.js';

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
              <img src="${profilo.immagine || '/static/img/placeholder_logo.jpg'}" class="card-img-top" alt="${profilo.nome}" onerror="this.src='/static/img/placeholder_logo.jpg'">
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
export function caricaOpzioniParametri(profiloId, potenza = null) {
  
  $('#tensione-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni tensione...</p>');
  $('#ip-options').empty();
  $('#temperatura-iniziale-options').empty();
  
  configurazione.tensioneSelezionato = null;
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $('#btn-continua-parametri').prop('disabled', true);
  
  let url = `/get_opzioni_tensione/${profiloId}`;
  if (configurazione.tipologiaStripSelezionata) {
    url += `/${configurazione.tipologiaStripSelezionata}`;
  }

  $.ajax({
    url: url,
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
    url: `/get_opzioni_ip/${profiloId}/${tensione}/${configurazione.tipologiaStripSelezionata}`,
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

      data.ip.sort((a, b) => {
        const ipNumA = parseInt(a.replace('IP', ''));
        const ipNumB = parseInt(b.replace('IP', ''));
        return ipNumA - ipNumB;
      });
      
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
// Sostituire la funzione caricaOpzioniTemperaturaIniziale con questa versione aggiornata:
export function caricaOpzioniTemperaturaIniziale(profiloId, tensione, ip) {
  
  $('#temperatura-iniziale-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni temperatura...</p>');
  
  configurazione.temperaturaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_temperatura_iniziale/${profiloId}/${tensione}/${ip}/${configurazione.tipologiaStripSelezionata}`,
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
      
      // Ordina le temperature: prima i valori numerici (in ordine crescente), poi CCT, poi RGB e RGBW
      data.temperature.sort((a, b) => {
        // Funzione helper per ottenere un valore numerico per ordinamento
        const getOrderValue = (temp) => {
          if (temp.includes('K')) {
            return parseInt(temp.replace('K', ''));
          } else if (temp === 'CCT') {
            return 10000; // CCT dopo tutte le temperature fisse
          } else if (temp === 'RGB') {
            return 20000; // RGB dopo CCT
          } else if (temp === 'RGBW') {
            return 30000; // RGBW alla fine
          }
          return 0;
        };
        
        return getOrderValue(a) - getOrderValue(b);
      });
      
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
      
      // Filtra le strip in base alla tipologia selezionata
      let stripFiltrate = data.strip_led;
      
      if (configurazione.tipologiaStripSelezionata) {
        stripFiltrate = filterStripsByType(data.strip_led);
      }
      
      if (stripFiltrate.length === 0) {
        $('#strip-led-filtrate-options').html('<div class="col-12 text-center"><p>Nessuna strip LED disponibile con la tipologia selezionata.</p></div>');
        return;
      }
      
      stripFiltrate.forEach(function(strip) {
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
              </div>
            </div>
          </div>
        `);
      });
      
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

// Aggiungere questa funzione helper per filtrare le strip per tipo
function filterStripsByType(strips) {
  return strips.filter(strip => {
    // Per le strip COB
    if (configurazione.tipologiaStripSelezionata === 'COB') {
      return strip.id.includes('COB');
    }
    // Per le strip SMD
    else if (configurazione.tipologiaStripSelezionata === 'SMD') {
      return strip.id.includes('SMD');
    }
    // Per le special strip
    else if (configurazione.tipologiaStripSelezionata === 'SPECIAL') {
      // Mappa delle special strip ai rispettivi ID o nomi commerciali
      if (!configurazione.specialStripSelezionata) {
        const allSpecialKeywords = ['XMAGIS', 'ZIGZAG', 'XFLEX', 'XSNAKE', 'RUNNING'];
        return allSpecialKeywords.some(keyword => 
          (strip.nomeCommerciale && strip.nomeCommerciale.toUpperCase().includes(keyword)) ||
          (strip.id && strip.id.toUpperCase().includes(keyword))
        );
      }

      const specialStripMap = {
        'XFLEX': ['XFLEX'],
        'RUNNING': ['RUNNING'],
        'ZIG_ZAG': ['ZIG_ZAG'],
        'XSNAKE': ['XSNAKE'],
        'XMAGIS': ['XMAGIS']
      };
      
      const specialStripIds = specialStripMap[configurazione.specialStripSelezionata] || [];
      
      // Controlla se il nome commerciale della strip contiene uno degli ID corrispondenti
      return specialStripIds.some(id => 
        (strip.nomeCommerciale && strip.nomeCommerciale.toUpperCase().includes(id)) ||
        (strip.id && strip.id.toUpperCase().includes(id))
      );
    }
    
    return true; // Se non c'è filtro di tipologia, mostra tutte
  });
}

/**
 * Carica le opzioni di potenza per la strip e temperatura selezionate
 * @param {string} stripId - ID della strip LED
 * @param {string} temperatura - Temperatura selezionata
 */
export function caricaOpzioniPotenza(profiloId, temperatura) {
  $('#potenza-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni potenza...</p></div>');
  
  $('#btn-continua-step3').prop('disabled', true);
  
  configurazione.potenzaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_potenza/${profiloId}/${configurazione.tensioneSelezionato}/${configurazione.ipSelezionato}/${temperatura}/${configurazione.tipologiaStripSelezionata}`,
    method: 'GET',
    success: function(data) {
      $('#potenza-container').empty();
      
      if (!data.success) {
        $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza 1.</p></div>');
        return;
      }
      
      if (!data.potenze || data.potenze.length === 0) {
        $('#potenza-container').html('<div class="col-12 text-center"><p>Nessuna opzione di potenza disponibile per questa combinazione.</p></div>');
        return;
      }

      data.potenze.sort((a, b) => {
        const getWattValue = (potenza) => {
          const match = potenza.id.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        };
        return getWattValue(a) - getWattValue(b);
      });
      
      data.potenze.forEach(function(potenza) {
        $('#potenza-container').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card potenza-card" data-potenza="${potenza.id}" data-codice="${potenza.codice}">
              <div class="card-body">
                <h5 class="card-title">${potenza.nome}</h5>
                <p class="card-text small text-muted">${potenza.specifiche}</p>
              </div>
            </div>
          </div>
        `);
      });
      
      $(document).off('click', '.potenza-card').on('click', '.potenza-card', function() {
        $('.potenza-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.potenzaSelezionata = $(this).data('potenza');
        configurazione.codicePotenza = $(this).data('codice');
        
        // Abilita il pulsante continua
        $('#btn-continua-step3').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni potenza:", error);
      $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza 2. Riprova più tardi.</p></div>');
    }
  });
}

export function caricaStripLedCompatibili(profiloId, tensione, ip, temperatura, potenza, tipologia_strip) {
  
  // Verifica che tutti i parametri siano definiti
  if (!profiloId || !tensione || !ip || !temperatura || !potenza) {
    console.error("Parametri mancanti per caricaStripLedCompatibili:", {
      profiloId, tensione, ip, temperatura, potenza
    });
    $('#strip-led-compatibili-container').html('<div class="col-12 text-center"><p class="text-danger">Errore: parametri mancanti. Verifica di aver selezionato tutti i valori necessari.</p></div>');
    return;
  }
  
  $('#strip-led-compatibili-container').empty().html('<div class="text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento modelli di strip LED compatibili...</p></div>');
  
  configurazione.stripLedSceltaFinale = null;
  $('#btn-continua-step3-strip').prop('disabled', true);
  var potenzaNew = potenza.replace(' ', '-');
  var potenzaFinale = potenzaNew.replace('/', '_');
  
  $.ajax({
    url: `/get_strip_led_filtrate/${profiloId}/${tensione}/${ip}/${temperatura}/${potenzaFinale}/${tipologia_strip}`,
    method: 'GET',
    success: function(data) {
      
      if (!data.success) {
        $('#strip-led-compatibili-container').html(`<div class="col-12 text-center"><p class="text-danger">Errore: ${data.message || 'Errore sconosciuto'}</p></div>`);
        return;
      }
      
      if (!data.strip_led || data.strip_led.length === 0) {
        $('#strip-led-compatibili-container').html('<div class="col-12 text-center"><p>Nessuna strip LED disponibile per questa combinazione di parametri.</p></div>');
        return;
      }
      
      let stripHtml = '<div class="row">';
      
      data.strip_led.forEach(function(strip, index) {
        // Usa il nome commerciale se disponibile
        const nomeVisualizzato = strip.nomeCommerciale || strip.nome;
        
        // Percorso immagine per il modello di strip LED
        const imgPath = `/static/img/strip/${strip.id}.jpg`;
        
        stripHtml += `
          <div class="col-md-4 mb-3">
            <div class="card option-card strip-led-compatibile-card" 
                data-strip-id="${strip.id}" 
                data-nome-commerciale="${strip.nomeCommerciale || ''}">
              <img src="${imgPath}" class="card-img-top" alt="${nomeVisualizzato}" 
                  style="height: 180px; object-fit: cover;" 
                  onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px';">
              <div class="card-body">
                <h5 class="card-title">${nomeVisualizzato}</h5>
                ${strip.nomeCommerciale ? `<p class="card-subtitle mb-2 text-muted">${strip.nome}</p>` : ''}
                <p class="card-text small">
                  Tensione: ${strip.tensione}, 
                  IP: ${strip.ip}, 
                  Temperatura: ${formatTemperatura ? formatTemperatura(strip.temperatura) : strip.temperatura}
                </p>
                <p class="card-text small">Potenza: ${potenza}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      stripHtml += '</div>';
      
      $('#strip-led-compatibili-container').html(stripHtml);
      
      // Se c'è una sola strip compatibile, selezionala automaticamente
      if (data.strip_led.length === 1) {
        const stripId = data.strip_led[0].id;
        const nomeCommerciale = data.strip_led[0].nomeCommerciale || '';
        configurazione.stripLedSceltaFinale = stripId;
        configurazione.nomeCommercialeStripLed = nomeCommerciale;
        configurazione.stripLedSelezionata = stripId;
        
        $('.strip-led-compatibile-card').addClass('selected');
        $('#btn-continua-step3-strip').prop('disabled', false);
      }
      
      // Aggiunge i listener per la selezione delle card
      $('.strip-led-compatibile-card').on('click', function() {
        $('.strip-led-compatibile-card').removeClass('selected');
        $(this).addClass('selected');
        
        const stripId = $(this).data('strip-id');
        const nomeCommerciale = $(this).data('nome-commerciale') || '';
        
        configurazione.stripLedSceltaFinale = stripId;
        configurazione.nomeCommercialeStripLed = nomeCommerciale;
        configurazione.stripLedSelezionata = stripId;
        
        $('#btn-continua-step3-strip').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore dettagliato:", error);
      $('#strip-led-compatibili-container').html(`
        <div class="col-12 text-center">
          <p class="text-danger">Errore nel caricamento delle strip LED compatibili.</p>
          <p>URL: /get_strip_led_filtrate/${profiloId}/${tensione}/${ip}/${temperatura}/${encodeURIComponent(potenza)}</p>
          <p>Status: ${error.status} - ${error.statusText}</p>
        </div>`);
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
  configurazione.potenzaAlimentatoreSelezionata = null;
  
  // Nascondi la sezione delle potenze (verrà mostrata solo quando viene selezionato un alimentatore)
  $('#potenza-alimentatore-section').hide();
  
  // Mappa dei tipi di alimentazione da interfaccia a formato backend
  const tipoAlimentazioneBackend = {
    'ON-OFF': 'ON-OFF',
    'DIMMERABILE_TRIAC': 'DIMMERABILE_TRIAC',
    'SENZA_ALIMENTATORE': 'SENZA_ALIMENTATORE'
  }[tipoAlimentazione] || tipoAlimentazione;
  
  $.ajax({
    url: `/get_opzioni_alimentatore/${tipoAlimentazioneBackend}`,
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
        // Percorso immagine per il tipo di alimentatore (usa placeholder se non disponibile)
        const imgPath = `/static/img/${alimentatore.id.toLowerCase()}.jpg`;
        
        $('#alimentatore-container').append(`
          <div class="col-md-4 mb-3 alimentatore-column">
            <div class="card option-card alimentatore-card" data-alimentatore="${alimentatore.id}">
              <img src="${imgPath}" class="card-img-top" alt="${alimentatore.nome}" 
                   style="height: 180px; object-fit: cover;" 
                   onerror="this.src='/static/img/placeholder_logo.jpg'; this.style.height='180px';">
              <div class="card-body">
                <h5 class="card-title">${alimentatore.nome}</h5>
                <p class="card-text small text-muted">${alimentatore.descrizione}</p>
              </div>
            </div>
          </div>
        `);
      });
      
      $('.alimentatore-card').on('click', function() {
        $('.alimentatore-card').removeClass('selected');
        $(this).addClass('selected');
        
        const alimentatoreId = $(this).data('alimentatore');
        configurazione.tipologiaAlimentatoreSelezionata = alimentatoreId;
        
        // Carica le potenze disponibili per questo alimentatore
        caricaPotenzeAlimentatore(alimentatoreId);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni alimentatore:", error);
      $('#alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni alimentatore. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le potenze disponibili per un alimentatore
 * @param {string} alimentatoreId - ID dell'alimentatore selezionato
 */
export function caricaPotenzeAlimentatore(alimentatoreId) {
  
  $('#potenza-alimentatore-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento potenze disponibili...</p></div>');
  
  // Mostra la sezione delle potenze
  $('#potenza-alimentatore-section').show();
  
  configurazione.potenzaAlimentatoreSelezionata = null;
  
  // Disabilita il pulsante continua finché non viene selezionata una potenza
  $('#btn-continua-step4').prop('disabled', true);
  
  $.ajax({
    url: `/get_potenze_alimentatore/${alimentatoreId}`,
    method: 'GET',
    success: function(data) {
      
      $('#potenza-alimentatore-container').empty();
      
      if (!data.success) {
        $('#potenza-alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle potenze disponibili.</p></div>');
        return;
      }
      
      const potenze = data.potenze;
      
      if (!potenze || potenze.length === 0) {
        $('#potenza-alimentatore-container').html('<div class="col-12 text-center"><p>Nessuna potenza disponibile per questo alimentatore.</p></div>');
        return;
      }
      
      // Potenza consigliata (se disponibile)
      const potenzaConsigliata = configurazione.potenzaConsigliataAlimentatore;
      
      // Ordina le potenze in ordine crescente
      const potenzeOrdinate = [...potenze].sort((a, b) => a - b);
      
      potenzeOrdinate.forEach(function(potenza) {
        // Verifica se questa potenza è quella consigliata
        if (potenza >= configurazione.potenzaConsigliataAlimentatore)
        {
          const isConsigliata = potenzaConsigliata && parseInt(potenzaConsigliata) === potenza;
          const consigliataBadge = isConsigliata ? '<span class="badge bg-success ms-2">Consigliata</span>' : '';
          
          $('#potenza-alimentatore-container').append(`
            <div class="col-md-3 mb-3">
              <div class="card option-card potenza-alimentatore-card" data-potenza="${potenza}">
                <div class="card-body text-center">
                  <h5 class="card-title">${potenza}W ${consigliataBadge}</h5>
                </div>
              </div>
            </div>
          `);
        }
      });
      
      // Aggiungi i listener per la selezione della potenza
      $('.potenza-alimentatore-card').on('click', function() {
        $('.potenza-alimentatore-card').removeClass('selected');
        $(this).addClass('selected');
        
        configurazione.potenzaAlimentatoreSelezionata = $(this).data('potenza');
        
        // Abilita il pulsante continua
        $('#btn-continua-step4').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle potenze disponibili:", error);
      $('#potenza-alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle potenze disponibili. Riprova più tardi.</p></div>');
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
 * Finalizza la configurazione e genera il riepilogo
 */
export function finalizzaConfigurazione() {
  
  $('#riepilogo-container').html('<div class="text-center my-5"><div class="spinner-border" role="status"></div><p class="mt-3">Generazione riepilogo...</p></div>');
  
  $("#step6-proposte").fadeOut(300, function() {
    $("#step7-riepilogo").fadeIn(300);
    
    updateProgressBar(7);
    
    // Assicurati che dimmer e alimentazione siano correttamente formattati per il riepilogo
    if (configurazione.dimmerSelezionato) {
      const mappaDimmerText = {
        'NESSUN_DIMMER': 'Nessun dimmer',
        'TOUCH_SU_PROFILO': 'Touch su profilo',
        'CON_TELECOMANDO': 'Con telecomando',
        'CENTRALINA_TUYA': 'Centralina TUYA',
        'DIMMER_A_PULSANTE_SEMPLICE': 'Dimmer a pulsante semplice',
        'DIMMERABILE_PWM': 'Dimmerabile PWM',
        'DIMMERABILE_DALI': 'Dimmerabile DALI'
      };
      configurazione.dimmerText = mappaDimmerText[configurazione.dimmerSelezionato] || configurazione.dimmerSelezionato;
    }
    
    if (configurazione.alimentazioneSelezionata) {
      const mappaAlimentazioneText = {
        'ON-OFF': 'ON/OFF',
        'DIMMERABILE_TRIAC': 'Dimmerabile TRIAC',
        'SENZA_ALIMENTATORE': 'Senza alimentatore'
      };
      configurazione.alimentazioneText = mappaAlimentazioneText[configurazione.alimentazioneSelezionata] || configurazione.alimentazioneSelezionata;
    }
    
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
        `;

        if (riepilogo.formaDiTaglioSelezionata === 'DRITTO_SEMPLICE') {
          if (riepilogo.lunghezzaRichiesta) {
            riepilogoHtml += `
                      <tr>
                        <th scope="row">Lunghezza richiesta</th>
                        <td>${riepilogo.lunghezzaRichiesta}mm</td>
                      </tr>
            `;
          }
        } else {
          // Per forme diverse dal taglio dritto, mostriamo le lunghezze multiple
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
          
          const etichette = etichetteLati[riepilogo.formaDiTaglioSelezionata] || {};
          
          if (riepilogo.lunghezzeMultiple) {
            Object.entries(riepilogo.lunghezzeMultiple).forEach(([lato, valore]) => {
              if (valore) {
                const etichetta = etichette[lato] || `Lato ${lato.replace('lato', '')}`;
                riepilogoHtml += `
                        <tr>
                          <th scope="row">${etichetta}</th>
                          <td>${valore}mm</td>
                        </tr>
                `;
              }
            });
          }
          
          // Aggiungi una nota sul non-assemblaggio nel riepilogo
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Nota</th>
                        <td class="text-danger">I profili verranno consegnati non assemblati tra di loro e la strip verrà consegnata non installata.</td>
                      </tr>
          `;
        }
        
        // Informazioni sulla strip LED
        if (riepilogo.stripLedSelezionata === 'NO_STRIP' || !riepilogo.includeStripLed) {
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Strip LED</th>
                        <td>Senza Strip LED</td>
                      </tr>
          `;
        } else {
          const nomeStripLed = riepilogo.nomeCommercialeStripLed || 
                             mappaStripLedVisualizzazione[riepilogo.stripLedSelezionata] || 
                             riepilogo.stripLedSelezionata;
          
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Strip LED</th>
                        <td>${nomeStripLed}</td>
                      </tr>
          `;

          if (riepilogo.tipologiaStripSelezionata) {
            let tipologiaStripText = mappaTipologiaStripVisualizzazione[riepilogo.tipologiaStripSelezionata] || riepilogo.tipologiaStripSelezionata;
            if (riepilogo.tipologiaStripSelezionata === 'SPECIAL' && riepilogo.specialStripSelezionata) {
            tipologiaStripText += ` - ${mappaSpecialStripVisualizzazione[riepilogo.specialStripSelezionata] || riepilogo.specialStripSelezionata}`;
            }
            
            riepilogoHtml += `
            <tr>
            <th scope="row">Tipologia Strip</th>
            <td>${tipologiaStripText}</td>
            </tr>
            `;
            }
          
          if (riepilogo.potenzaSelezionata) {
            riepilogoHtml += `
                      <tr>
                        <th scope="row">Potenza</th>
                        <td>${riepilogo.potenzaSelezionata}</td>
                      </tr>
            `;
          }
        }
        
        // Informazioni sull'alimentazione
        if (riepilogo.alimentazioneSelezionata) {
          // Usa il testo formattato se disponibile
          const alimentazioneText = riepilogo.alimentazioneText || 
                                  (riepilogo.alimentazioneSelezionata === 'SENZA_ALIMENTATORE' ? 'Senza alimentatore' : 
                                   riepilogo.alimentazioneSelezionata.replace('_', ' '));
          
          riepilogoHtml += `
                      <tr>
                        <th scope="row">Alimentazione</th>
                        <td>${alimentazioneText}</td>
                      </tr>
          `;
          
          if (riepilogo.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE' && riepilogo.tipologiaAlimentatoreSelezionata) {
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
        }
        
        riepilogoHtml += `
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-striped">
        `;
        
        // Dimmer e cavi
        if (riepilogo.dimmerSelezionato) {
          // Usa il testo formattato se disponibile
          const dimmerText = riepilogo.dimmerText || 
                           (riepilogo.dimmerSelezionato === 'NESSUN_DIMMER' ? 'Nessun dimmer' : 
                            riepilogo.dimmerSelezionato.replace(/_/g, ' '));
          
          riepilogoHtml += `
                    <tr>
                      <th scope="row">Dimmer</th>
                      <td>${dimmerText}</td>
                    </tr>
          `;
          
          // Se è TOUCH_SU_PROFILO, aggiungi la nota sullo spazio non illuminato
          if (riepilogo.dimmerSelezionato === 'TOUCH_SU_PROFILO') {
            riepilogoHtml += `
                    <tr>
                      <th scope="row">Nota dimmer</th>
                      <td class="text-warning">Spazio non illuminato di 50mm per touch su profilo</td>
                    </tr>
            `;
          }
        }
        
        if (riepilogo.tipoAlimentazioneCavo) {
          riepilogoHtml += `
                    <tr>
                      <th scope="row">Alimentazione cavo</th>
                      <td>${riepilogo.tipoAlimentazioneCavo === 'ALIMENTAZIONE_UNICA' ? 'Alimentazione unica' : 'Alimentazione doppia'}</td>
                    </tr>
          `;
          
          if (riepilogo.lunghezzaCavoIngresso) {
            riepilogoHtml += `
                    <tr>
                      <th scope="row">Lunghezza cavo ingresso</th>
                      <td>${riepilogo.lunghezzaCavoIngresso}mm</td>
                    </tr>
            `;
          }
          
          if (riepilogo.tipoAlimentazioneCavo === 'ALIMENTAZIONE_DOPPIA' && riepilogo.lunghezzaCavoUscita) {
            riepilogoHtml += `
                    <tr>
                      <th scope="row">Lunghezza cavo uscita</th>
                      <td>${riepilogo.lunghezzaCavoUscita}mm</td>
                    </tr>
            `;
          }
          
          if (riepilogo.uscitaCavoSelezionata) {
            // Formatta l'uscita cavo per una migliore visualizzazione
            let uscitaCavoText = riepilogo.uscitaCavoSelezionata;
            if (uscitaCavoText === 'DRITTA') uscitaCavoText = 'Dritta';
            else if (uscitaCavoText === 'LATERALE_DX') uscitaCavoText = 'Laterale destra';
            else if (uscitaCavoText === 'LATERALE_SX') uscitaCavoText = 'Laterale sinistra';
            else if (uscitaCavoText === 'RETRO') uscitaCavoText = 'Retro';
            
            riepilogoHtml += `
                    <tr>
                      <th scope="row">Uscita cavo</th>
                      <td>${uscitaCavoText}</td>
                    </tr>
            `;
          }
        }
        
        // Forma, finitura e lunghezza
        riepilogoHtml += `
                    <tr>
                      <th scope="row">Forma di taglio</th>
                      <td>${mappaFormeTaglio[riepilogo.formaDiTaglioSelezionata] || riepilogo.formaDiTaglioSelezionata}</td>
                    </tr>
                    <tr>
                      <th scope="row">Finitura</th>
                      <td>${mappaFiniture[riepilogo.finituraSelezionata] || riepilogo.finituraSelezionata}</td>
                    </tr>
        `;
        
        if (riepilogo.lunghezzaRichiesta) {
          riepilogoHtml += `
                    <tr>
                      <th scope="row">Lunghezza richiesta</th>
                      <td>${riepilogo.lunghezzaRichiesta}mm</td>
                    </tr>
          `;
        }
        
        // Potenza totale (solo se c'è una strip LED)
        if (riepilogo.stripLedSelezionata !== 'NO_STRIP' && riepilogo.includeStripLed && potenzaTotale) {
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
        
        // Inizializza i listener per i pulsanti delle operazioni finali
        initRiepilogoOperationsListeners(codiceProdotto);
      },
      error: function(error) {
        console.error("Errore nella finalizzazione della configurazione:", error);
        $('#riepilogo-container').html('<div class="alert alert-danger">Errore nella finalizzazione della configurazione. Riprova più tardi.</div>');
      }
    });
  });
}


/**
 * Richiede un preventivo per il prodotto configurato
 * @param {string} codiceProdotto - Codice prodotto finale
 */
export function richiediPreventivo(codiceProdotto) {
  alert(`La richiesta di preventivo per il prodotto ${codiceProdotto} è stata inviata al nostro team. Verrai contattato al più presto.`);
}
