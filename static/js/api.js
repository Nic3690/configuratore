import { configurazione, mappaTipologieVisualizzazione, mappaVoltaggioVisualizzazione, mappaIPVisualizzazione, mappaStripLedVisualizzazione, mappaFormeTaglio, mappaFiniture, mappaCategorieVisualizzazione } from './config.js';
import { formatTemperatura, getTemperaturaColor, checkParametriCompletion, checkStep2Completion, updateProgressBar } from './utils.js';

/**
 * Carica i profili per la categoria selezionata
 * @param {string} categoria - La categoria selezionata
 */
export function caricaProfili(categoria) {
  console.log("Caricamento profili per la categoria:", categoria);
  
  $('#profili-container').empty().html('<div class="text-center mt-5"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento profili...</p></div>');
  
  $.ajax({
    url: `/get_profili/${categoria}`,
    method: 'GET',
    success: function(data) {
      console.log("Profili ricevuti:", data);
      
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
        
        grid.append(profiloCard);
      });
      
      $('.profilo-card').on('click', function(e) {
        e.stopPropagation();
        console.log("Profilo selezionato:", $(this).data('id'));
        $('.profilo-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.profiloSelezionato = $(this).data('id');
        configurazione.nomeModello = $(this).data('nome');
        
        caricaOpzioniProfilo(configurazione.profiloSelezionato);
      });
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
  console.log("Caricamento opzioni per profilo:", profiloId);
  
  $('#tipologie-options').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni...</p></div>');
  
  $('#btn-continua-step2').prop('disabled', true);
  
  configurazione.tipologiaSelezionata = null;
  configurazione.stripLedSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_profilo/${profiloId}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni profilo ricevute:", data);
      
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
  console.log("Caricamento opzioni parametri per profilo:", profiloId);
  
  $('#voltaggio-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni voltaggio...</p>');
  $('#ip-options').empty();
  $('#temperatura-iniziale-options').empty();
  
  configurazione.voltaggioSelezionato = null;
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $('#btn-continua-parametri').prop('disabled', true);
  
  $.ajax({
    url: `/get_opzioni_voltaggio/${profiloId}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni voltaggio ricevute:", data);
      
      $('#voltaggio-options').empty();
      
      if (!data.success) {
        $('#voltaggio-options').html('<p class="text-danger">Errore nel caricamento delle opzioni voltaggio.</p>');
        return;
      }
      
      if (!data.voltaggi || data.voltaggi.length === 0) {
        $('#voltaggio-options').html('<p>Nessuna opzione di voltaggio disponibile per questo profilo.</p>');
        return;
      }
      
      data.voltaggi.sort((a, b) => {
        const voltA = parseInt(a.replace('V', ''));
        const voltB = parseInt(b.replace('V', ''));
        return voltA - voltB;  
      });

      data.voltaggi.forEach(function(voltaggio) {
        $('#voltaggio-options').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card voltaggio-card" data-voltaggio="${voltaggio}">
              <div class="card-body text-center">
                <h5 class="card-title">${mappaVoltaggioVisualizzazione[voltaggio] || voltaggio}</h5>
              </div>
            </div>
          </div>
        `);
      });
      
      $('.voltaggio-card').on('click', function() {
        $('.voltaggio-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.voltaggioSelezionato = $(this).data('voltaggio');
        
        caricaOpzioniIP(profiloId, configurazione.voltaggioSelezionato);
        checkParametriCompletion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni voltaggio:", error);
      $('#voltaggio-options').html('<p class="text-danger">Errore nel caricamento delle opzioni voltaggio. Riprova più tardi.</p>');
    }
  });
}

/**
 * Carica le opzioni IP per il profilo e voltaggio selezionati
 * @param {string} profiloId - ID del profilo
 * @param {string} voltaggio - Voltaggio selezionato
 */
export function caricaOpzioniIP(profiloId, voltaggio) {
  console.log("Caricamento opzioni IP per profilo:", profiloId, "e voltaggio:", voltaggio);
  
  $('#ip-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni IP...</p>');
  $('#temperatura-iniziale-options').empty();
  
  configurazione.ipSelezionato = null;
  configurazione.temperaturaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_ip/${profiloId}/${voltaggio}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni IP ricevute:", data);
      
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
        
        caricaOpzioniTemperaturaIniziale(profiloId, configurazione.voltaggioSelezionato, configurazione.ipSelezionato);
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
 * Carica le opzioni temperatura iniziale per il profilo, voltaggio e IP selezionati
 * @param {string} profiloId - ID del profilo
 * @param {string} voltaggio - Voltaggio selezionato
 * @param {string} ip - IP selezionato
 */
export function caricaOpzioniTemperaturaIniziale(profiloId, voltaggio, ip) {
  console.log("Caricamento opzioni temperatura iniziale per profilo:", profiloId, "voltaggio:", voltaggio, "e IP:", ip);
  
  $('#temperatura-iniziale-options').empty().html('<div class="spinner-border" role="status"></div><p>Caricamento opzioni temperatura...</p>');
  
  configurazione.temperaturaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_temperatura_iniziale/${profiloId}/${voltaggio}/${ip}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni temperatura iniziale ricevute:", data);
      
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
 * @param {string} voltaggio - Voltaggio selezionato
 * @param {string} ip - IP selezionato
 * @param {string} temperatura - Temperatura selezionata
 */
export function caricaStripLedFiltrate(profiloId, voltaggio, ip, temperatura) {
  console.log("Caricamento strip LED filtrate per profilo:", profiloId, "voltaggio:", voltaggio, "IP:", ip, "e temperatura:", temperatura);
  
  $('#strip-led-filtrate-options').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni strip LED...</p></div>');
  
  configurazione.stripLedSelezionata = null;
  
  $('#btn-continua-strip').prop('disabled', true);
  
  $.ajax({
    url: `/get_strip_led_filtrate/${profiloId}/${voltaggio}/${ip}/${temperatura}`,
    method: 'GET',
    success: function(data) {
      console.log("Strip LED filtrate ricevute:", data);
      
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
        $('#strip-led-filtrate-options').append(`
          <div class="col-md-6 mb-3">
            <div class="card option-card strip-led-filtrata-card" data-strip="${strip.id}">
              <div class="card-body">
                <h5 class="card-title">${strip.nome}</h5>
                <p class="card-text small text-muted">${strip.descrizione || ''}</p>
                <p class="card-text small">
                  Voltaggio: ${strip.voltaggio}, 
                  IP: ${strip.ip}, 
                  Temperatura: ${formatTemperatura(strip.temperatura)}
                </p>
              </div>
            </div>
          </div>
        `);
      });
      
      if (data.strip_led_opzionale) {
        $('#strip-led-filtrate-options').prepend(`
          <div class="col-md-6 mb-3">
            <div class="card option-card strip-led-filtrata-card" data-strip="senza_strip">
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
  console.log("Caricamento opzioni potenza per strip:", stripId, "e temperatura:", temperatura);
  
  $('#potenza-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni potenza...</p></div>');
  
  $('#btn-continua-step3').prop('disabled', true);
  
  configurazione.potenzaSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_potenza/${stripId}/${temperatura}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni potenza ricevute:", data);
      
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
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni potenza:", error);
      $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza. Riprova più tardi.</p></div>');
    }
  });
}

/**
 * Carica le opzioni alimentatore in base al tipo di alimentazione
 * @param {string} tipoAlimentazione - Tipo di alimentazione selezionato
 */
export function caricaOpzioniAlimentatore(tipoAlimentazione) {
  console.log("Caricamento opzioni alimentatore per tipo:", tipoAlimentazione);
  
  $('#alimentatore-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni alimentatore...</p></div>');
  
  $('#btn-continua-step4').prop('disabled', true);
  
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  $.ajax({
    url: `/get_opzioni_alimentatore/${tipoAlimentazione}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni alimentatore ricevute:", data);
      
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
      
      alimentatori.forEach(function(alimentatore) {
        $('#alimentatore-container').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card alimentatore-card" data-alimentatore="${alimentatore.id}">
              <div class="card-body">
                <h5 class="card-title">${alimentatore.nome}</h5>
                <p class="card-text small text-muted">${alimentatore.descrizione}</p>
                <p class="card-text small">Potenze disponibili: ${alimentatore.potenze.join(', ')}W</p>
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
  console.log("Caricamento finiture disponibili per profilo:", profiloId);
  
  $('.finitura-card').removeClass('selected');
  configurazione.finituraSelezionata = null;
  
  $.ajax({
    url: `/get_finiture/${profiloId}`,
    method: 'GET',
    success: function(data) {
      console.log("Finiture ricevute:", data);
      
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
      console.log("Proposte di lunghezza ricevute:", data);
      
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
  console.log("Finalizzazione della configurazione:", configurazione);
  
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
        console.log("Riepilogo ricevuto:", data);
        
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
                        <th scope="row">Voltaggio</th>
                        <td>${mappaVoltaggioVisualizzazione[riepilogo.voltaggioSelezionato] || riepilogo.voltaggioSelezionato}</td>
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
                        <td>${riepilogo.stripLedSelezionata === 'senza_strip' ? 'Senza Strip LED' : (mappaStripLedVisualizzazione[riepilogo.stripLedSelezionata] || riepilogo.stripLedSelezionata)}</td>
                      </tr>
        `;
        
        if (riepilogo.stripLedSelezionata !== 'senza_strip') {
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
        
        if (riepilogo.stripLedSelezionata !== 'senza_strip') {
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
