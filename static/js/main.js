let configurazione;
let mappaCategorieVisualizzazione;
let mappaTipologieVisualizzazione;
let mappaStripLedVisualizzazione;
let mappaFormeTaglio;
let mappaFiniture;
let mappaVoltaggioVisualizzazione;
let mappaIPVisualizzazione;

$(document).ready(function() {
  console.log("Document ready - Configuratore inizializzato");
  
  configurazione = {
    categoriaSelezionata: null,
    profiloSelezionato: null,
    tipologiaSelezionata: null,
    voltaggioSelezionato: null,
    ipSelezionato: null,
    temperaturaSelezionata: null,
    stripLedSelezionata: null,
    temperaturaColoreSelezionata: null,
    potenzaSelezionata: null,
    alimentazioneSelezionata: null,
    tipologiaAlimentatoreSelezionata: null,
    dimmerSelezionato: null,
    tipoAlimentazioneCavo: null,
    lunghezzaCavoIngresso: 1800,
    lunghezzaCavoUscita: 1800,
    uscitaCavoSelezionata: null,
    formaDiTaglioSelezionata: "DRITTO_SEMPLICE",
    finituraSelezionata: null,
    lunghezzaRichiesta: null,
    proposta1: null,
    proposta2: null,
    codiceModello: null,
    nomeModello: null
  };

  mappaCategorieVisualizzazione = {
    'nanoprofili': 'Nanoprofili',
    'incasso': 'Profili a Incasso',
    'sospensione': 'Profili a Sospensione',
    'plafone': 'Profili a Plafone',
    'parete': 'Profili a Parete',
    'particolari': 'Profili Particolari'
  };
  
  mappaTipologieVisualizzazione = {
    'taglio_misura': 'Taglio su misura',
    'profilo_intero': 'Profilo intero'
  };
  
  mappaStripLedVisualizzazione = {
    'senza_strip': 'Senza Strip LED',
    'STRIP_24V_SMD_IP20': 'STRIP 24V SMD (IP20)',
    'STRIP_24V_SMD_IP66': 'STRIP 24V SMD (IP66)',
    'STRIP_24V_COB_IP20': 'STRIP 24V COB (IP20)',
    'STRIP_24V_COB_IP66': 'STRIP 24V COB (IP66)',
    'STRIP_48V_SMD_IP20': 'STRIP 48V SMD (IP20)',
    'STRIP_48V_SMD_IP66': 'STRIP 48V SMD (IP66)',
    'STRIP_24V_RGB_SMD_IP20': 'STRIP 24V RGB SMD (IP20)',
    'STRIP_24V_RGB_SMD_IP66': 'STRIP 24V RGB SMD (IP66)',
    'STRIP_24V_RGB_COB_IP20': 'STRIP 24V RGB COB (IP20)',
    'STRIP_24V_RGB_COB_IP66': 'STRIP 24V RGB COB (IP66)',
    'STRIP_220V_COB_IP20': 'STRIP 220V COB (IP20)',
    'STRIP_220V_COB_IP66': 'STRIP 220V COB (IP66)'
  };
  
  mappaFormeTaglio = {
    'DRITTO_SEMPLICE': 'Dritto semplice',
    'FORMA_L_DX': 'Forma a L DX',
    'FORMA_L_SX': 'Forma a L SX',
    'FORMA_C': 'Forma a C',
    'FORMA_A': 'Forma a A',
    'RETTANGOLO_QUADRATO': 'Rettangolo/Quadrato'
  };
  
  mappaFiniture = {
    'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
    'BIANCO': 'Bianco',
    'NERO': 'Nero',
    'ALLUMINIO': 'Alluminio'
  };
  
  mappaVoltaggioVisualizzazione = {
    '24V': '24V',
    '48V': '48V',
    '220V': '220V'
  };
  
  mappaIPVisualizzazione = {
    'IP20': 'IP20 (Interni)',
    'IP65': 'IP65 (Resistente all\'umidità)',
    'IP66': 'IP66 (Resistente all\'acqua)'
  };

  $(".step-section").hide();
  $("#step1-tipologia").show();
  
  $('.hotspot').on('click', function() {
    const categoria = $(this).data('categoria');
    
    if (!categoria) {
      console.error("Nessuna categoria trovata per questo hotspot");
      return;
    }
    
    configurazione.categoriaSelezionata = categoria;
    
    $('.categoria-selezionata').text(`Categoria: ${mappaCategorieVisualizzazione[categoria] || categoria}`);
    
    updateProgressBar(2);
    
    $("#step1-tipologia").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      caricaProfili(categoria);
    });
  });
  
  $('.btn-torna-indietro').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    $("#step2-modello").fadeOut(300, function() {
      $("#step1-tipologia").fadeIn(300);
      configurazione.categoriaSelezionata = null;
      configurazione.profiloSelezionato = null;
      configurazione.tipologiaSelezionata = null;
      configurazione.stripLedSelezionata = null;
      
      $('#tipologia-container').hide();
      
      updateProgressBar(1);
    });
  });
  
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
      vaiAiParametriStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.profiloSelezionato) messaggi.push("un profilo");
      if (!configurazione.tipologiaSelezionata) messaggi.push("una tipologia");
      
      alert("Seleziona " + messaggi.join(", ") + " prima di continuare");
    }
  });
  
  $('#btn-torna-step2-parametri').on('click', function(e) {
    e.preventDefault();
    
    $("#step2-parametri").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      updateProgressBar(2);
    });
  });
  
  $('#btn-continua-parametri').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.voltaggioSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
      vaiAllaSelezioneDiStripLed();
    } else {
      let messaggi = [];
      if (!configurazione.voltaggioSelezionato) messaggi.push("un voltaggio");
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
      if (configurazione.stripLedSelezionata === 'senza_strip') {
        vaiAllAlimentazione();
      } else {
        vaiAllaTemperaturaEPotenza();
      }
    } else {
      alert("Seleziona una strip LED prima di continuare");
    }
  });
  
  $('#btn-torna-step2').on('click', function(e) {
    e.preventDefault();
    
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step2-strip").fadeIn(300);
      
      updateProgressBar(2);
    });
  });
  
  $('#btn-continua-step3').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.potenzaSelezionata) {
      vaiAllAlimentazione();
    } else {
      alert("Seleziona temperatura e potenza prima di continuare");
    }
  });
  
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-alimentazione").fadeOut(300, function() {
      if (configurazione.stripLedSelezionata !== 'senza_strip') {
        $("#step3-temperatura-potenza").fadeIn(300);
        updateProgressBar(3);
      } else {
        $("#step2-strip").fadeIn(300);
        updateProgressBar(2);
      }
    });
  });
  
  $('#btn-continua-step4').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.alimentazioneSelezionata) {
      alert("Seleziona il tipo di alimentazione prima di continuare");
      return;
    }
    
    if (configurazione.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE' && !configurazione.tipologiaAlimentatoreSelezionata) {
      alert("Seleziona la tipologia di alimentatore prima di continuare");
      return;
    }
    
    vaiAlControllo();
  });
  
  $('#btn-torna-step4').on('click', function(e) {
    e.preventDefault();
    
    $("#step5-controllo").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      updateProgressBar(4);
    });
  });
  
  $('#btn-continua-step5').on('click', function(e) {
    e.preventDefault();
    
    if (!configurazione.dimmerSelezionato) {
      alert("Seleziona un'opzione dimmer prima di continuare");
      return;
    }
    
    if (!configurazione.tipoAlimentazioneCavo) {
      alert("Seleziona il tipo di alimentazione cavo prima di continuare");
      return;
    }
    
    if (!configurazione.uscitaCavoSelezionata) {
      alert("Seleziona l'uscita cavo prima di continuare");
      return;
    }
    
    vaiAllaPersonalizzazione();
  });
  
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
  
  $('#btn-torna-step6').on('click', function(e) {
    e.preventDefault();
    
    $("#step7-riepilogo").fadeOut(300, function() {
      $("#step6-personalizzazione").fadeIn(300);
      
      updateProgressBar(6);
    });
  });
});

function updateProgressBar(step) {
  $('.step-item').removeClass('active completed');
  
  $(`#progress-step${step}`).addClass('active');
  
  for (let i = 1; i < step; i++) {
    $(`#progress-step${i}`).addClass('completed');
  }
}

function caricaProfili(categoria) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-profilo">Seleziona</button>
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
      
      $('.btn-seleziona-profilo').on('click', function(e) {
        e.stopPropagation();
        
        const profiloCard = $(this).closest('.profilo-card');
        $('.profilo-card').removeClass('selected');
        profiloCard.addClass('selected');
        
        configurazione.profiloSelezionato = profiloCard.data('id');
        configurazione.nomeModello = profiloCard.data('nome');
        
        caricaOpzioniProfilo(configurazione.profiloSelezionato);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento dei profili:", error);
      $('#profili-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento dei profili. Riprova più tardi.</p></div>');
    }
  });
}

function caricaOpzioniProfilo(profiloId) {
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
                  <button class="btn btn-sm btn-primary mt-2 btn-seleziona-tipologia">Seleziona</button>
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
      
      $('.btn-seleziona-tipologia').on('click', function(e) {
        e.stopPropagation();
        
        const tipologiaCard = $(this).closest('.tipologia-card');
        $('.tipologia-card').removeClass('selected');
        tipologiaCard.addClass('selected');
        
        configurazione.tipologiaSelezionata = tipologiaCard.data('id');
        
        checkStep2Completion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni:", error);
      $('#tipologie-options').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni. Riprova più tardi.</p></div>');
    }
  });
}

function checkStep2Completion() {
  if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
    $('#btn-continua-step2').prop('disabled', false);
  } else {
    $('#btn-continua-step2').prop('disabled', true);
  }
}

function vaiAiParametriStripLed() {
  console.log("Passaggio ai parametri della strip LED");
  
  $('#profilo-nome-step2-parametri').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-parametri').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  $("#step2-modello").fadeOut(300, function() {
    $("#step2-parametri").fadeIn(300);
    
    caricaOpzioniParametri(configurazione.profiloSelezionato);
  });
}

function caricaOpzioniParametri(profiloId) {
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
      
      data.voltaggi.forEach(function(voltaggio) {
        $('#voltaggio-options').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card voltaggio-card" data-voltaggio="${voltaggio}">
              <div class="card-body text-center">
                <h5 class="card-title">${mappaVoltaggioVisualizzazione[voltaggio] || voltaggio}</h5>
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-voltaggio">Seleziona</button>
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
      
      $('.btn-seleziona-voltaggio').on('click', function(e) {
        e.stopPropagation();
        
        const voltaggioCard = $(this).closest('.voltaggio-card');
        $('.voltaggio-card').removeClass('selected');
        voltaggioCard.addClass('selected');
        
        configurazione.voltaggioSelezionato = voltaggioCard.data('voltaggio');
        
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

function caricaOpzioniIP(profiloId, voltaggio) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-ip">Seleziona</button>
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
      
      $('.btn-seleziona-ip').on('click', function(e) {
        e.stopPropagation();
        
        const ipCard = $(this).closest('.ip-card');
        $('.ip-card').removeClass('selected');
        ipCard.addClass('selected');
        
        configurazione.ipSelezionato = ipCard.data('ip');
        
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

function caricaOpzioniTemperaturaIniziale(profiloId, voltaggio, ip) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-temperatura-iniziale">Seleziona</button>
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
      
      $('.btn-seleziona-temperatura-iniziale').on('click', function(e) {
        e.stopPropagation();
        
        const temperaturaCard = $(this).closest('.temperatura-iniziale-card');
        $('.temperatura-iniziale-card').removeClass('selected');
        temperaturaCard.addClass('selected');
        
        configurazione.temperaturaSelezionata = temperaturaCard.data('temperatura');
        
        checkParametriCompletion();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni temperatura:", error);
      $('#temperatura-iniziale-options').html('<p class="text-danger">Errore nel caricamento delle opzioni temperatura. Riprova più tardi.</p>');
    }
  });
}

function checkParametriCompletion() {
  if (configurazione.voltaggioSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
    $('#btn-continua-parametri').prop('disabled', false);
  } else {
    $('#btn-continua-parametri').prop('disabled', true);
  }
}

function vaiAllaSelezioneDiStripLed() {
  console.log("Passaggio alla selezione della strip LED");
  
  $('#profilo-nome-step2-strip').text(configurazione.nomeModello);
  $('#tipologia-nome-step2-strip').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#voltaggio-nome-step2-strip').text(mappaVoltaggioVisualizzazione[configurazione.voltaggioSelezionato] || configurazione.voltaggioSelezionato);
  $('#ip-nome-step2-strip').text(mappaIPVisualizzazione[configurazione.ipSelezionato] || configurazione.ipSelezionato);
  $('#temperatura-nome-step2-strip').text(formatTemperatura(configurazione.temperaturaSelezionata));
  
  $("#step2-parametri").fadeOut(300, function() {
    $("#step2-strip").fadeIn(300);
    
    caricaStripLedFiltrate(
      configurazione.profiloSelezionato, 
      configurazione.voltaggioSelezionato, 
      configurazione.ipSelezionato, 
      configurazione.temperaturaSelezionata
    );
  });
}

function caricaStripLedFiltrate(profiloId, voltaggio, ip, temperatura) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-strip-filtrata">Seleziona</button>
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-strip-filtrata">Seleziona</button>
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
      
      $('.btn-seleziona-strip-filtrata').on('click', function(e) {
        e.stopPropagation();
        
        const stripCard = $(this).closest('.strip-led-filtrata-card');
        $('.strip-led-filtrata-card').removeClass('selected');
        stripCard.addClass('selected');
        
        configurazione.stripLedSelezionata = stripCard.data('strip');
        
        $('#btn-continua-strip').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle strip LED filtrate:", error);
      $('#strip-led-filtrate-options').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle strip LED filtrate. Riprova più tardi.</p></div>');
    }
  });
}

function vaiAllaTemperaturaEPotenza() {
  console.log("Passaggio alla temperatura e potenza");
  
  $('#profilo-nome-step3').text(configurazione.nomeModello);
  $('#tipologia-nome-step3').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#strip-nome-step3').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  
  updateProgressBar(3);
  
  $("#step2-strip").fadeOut(300, function() {
    $("#step3-temperatura-potenza").fadeIn(300);
    
    caricaOpzioniPotenza(configurazione.stripLedSelezionata, "3000K"); // qui
  });
}

function caricaOpzioniPotenza(stripId, temperatura) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-potenza">Seleziona</button>
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
      
      $('.btn-seleziona-potenza').on('click', function(e) {
        e.stopPropagation();
        
        const potenzaCard = $(this).closest('.potenza-card');
        $('.potenza-card').removeClass('selected');
        potenzaCard.addClass('selected');
        
        configurazione.potenzaSelezionata = potenzaCard.data('potenza');
        configurazione.codicePotenza = potenzaCard.data('codice');
        
        $('#btn-continua-step3').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni potenza:", error);
      $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza. Riprova più tardi.</p></div>');
    }
  });
}

function vaiAllAlimentazione() {
  console.log("Passaggio all'alimentazione");
  
  $('#profilo-nome-step4').text(configurazione.nomeModello);
  $('#tipologia-nome-step4').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step4').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
    
    if (configurazione.potenzaSelezionata) {
      $('#potenza-nome-step4').text(configurazione.potenzaSelezionata);
      $('#badge-potenza-step4').show();
    } else {
      $('#badge-potenza-step4').hide();
    }
  } else {
    $('#strip-nome-step4').text('Senza Strip LED');
    $('#badge-temperatura-step4').hide();
    $('#badge-potenza-step4').hide();
  }
  
  updateProgressBar(4);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $("#step3-temperatura-potenza").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      prepareAlimentazioneListeners();
    });
  } else {
    $("#step2-strip").fadeOut(300, function() {
      $("#step4-alimentazione").fadeIn(300);
      
      prepareAlimentazioneListeners();
    });
  }
}

function prepareAlimentazioneListeners() {
  configurazione.alimentazioneSelezionata = null;
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  $('#alimentatore-section').hide();
  
  $('#btn-continua-step4').prop('disabled', true);
  
  $('.alimentazione-card').removeClass('selected');
  
  $('.alimentazione-card').on('click', function() {
    $('.alimentazione-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazione = $(this).data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
    }
  });
  
  $('.btn-seleziona-alimentazione').on('click', function(e) {
    e.stopPropagation();
    
    const alimentazioneCard = $(this).closest('.alimentazione-card');
    $('.alimentazione-card').removeClass('selected');
    alimentazioneCard.addClass('selected');
    
    const alimentazione = alimentazioneCard.data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      $('#alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      
      $('#btn-continua-step4').prop('disabled', false);
    } else {
      caricaOpzioniAlimentatore(alimentazione);
      
      $('#alimentatore-section').show();
    }
  });
}

function caricaOpzioniAlimentatore(tipoAlimentazione) {
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
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-alimentatore">Seleziona</button>
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
      
      $('.btn-seleziona-alimentatore').on('click', function(e) {
        e.stopPropagation();
        
        const alimentatoreCard = $(this).closest('.alimentatore-card');
        $('.alimentatore-card').removeClass('selected');
        alimentatoreCard.addClass('selected');
        
        configurazione.tipologiaAlimentatoreSelezionata = alimentatoreCard.data('alimentatore');
        
        $('#btn-continua-step4').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni alimentatore:", error);
      $('#alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni alimentatore. Riprova più tardi.</p></div>');
    }
  });
}

function vaiAlControllo() {
  console.log("Passaggio al controllo (dimmer e cavi)");
  
  $('#profilo-nome-step5').text(configurazione.nomeModello);
  $('#tipologia-nome-step5').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step5').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  } else {
    $('#strip-nome-step5').text('Senza Strip LED');
  }
  
  if (configurazione.alimentazioneSelezionata === 'SENZA_ALIMENTATORE') {
    $('#alimentazione-nome-step5').text('Senza alimentatore');
  } else {
    let alimentazioneText = configurazione.alimentazioneSelezionata === 'ON/OFF' ? 'ON/OFF' : 'Dimmerabile TRIAC';
    $('#alimentazione-nome-step5').text(alimentazioneText);
  }
  
  updateProgressBar(5);
  
  $("#step4-alimentazione").fadeOut(300, function() {
    $("#step5-controllo").fadeIn(300);
    
    prepareControlloListeners();
  });
}

function prepareControlloListeners() {
  configurazione.dimmerSelezionato = null;
  configurazione.tipoAlimentazioneCavo = null;
  configurazione.uscitaCavoSelezionata = null;
  
  $('#dimmer-warning').hide();
  $('#lunghezza-cavo-uscita-container').hide();
  
  $('#lunghezza-cavo-ingresso').val(1800);
  $('#lunghezza-cavo-uscita').val(1800);
  configurazione.lunghezzaCavoIngresso = 1800;
  configurazione.lunghezzaCavoUscita = 1800;
  
  $('#btn-continua-step5').prop('disabled', true);
  
  $('.dimmer-card, .alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');
  
  $('.dimmer-card').on('click', function() {
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
  
  $('.btn-seleziona-dimmer').on('click', function(e) {
    e.stopPropagation();
    
    const dimmerCard = $(this).closest('.dimmer-card');
    $('.dimmer-card').removeClass('selected');
    dimmerCard.addClass('selected');
    
    const dimmer = dimmerCard.data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep5Completion();
  });
  
  $('.alimentazione-cavo-card').on('click', function() {
    $('.alimentazione-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazioneCavo = $(this).data('alimentazione-cavo');
    configurazione.tipoAlimentazioneCavo = alimentazioneCavo;
    
    if (alimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      $('#lunghezza-cavo-uscita-container').hide();
    }
    
    checkStep5Completion();
  });
  
  $('.btn-seleziona-alimentazione-cavo').on('click', function(e) {
    e.stopPropagation();
    
    const alimentazioneCavoCard = $(this).closest('.alimentazione-cavo-card');
    $('.alimentazione-cavo-card').removeClass('selected');
    alimentazioneCavoCard.addClass('selected');
    
    const alimentazioneCavo = alimentazioneCavoCard.data('alimentazione-cavo');
    configurazione.tipoAlimentazioneCavo = alimentazioneCavo;
    
    if (alimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      $('#lunghezza-cavo-uscita-container').hide();
    }
    
    checkStep5Completion();
  });
  
  $('.uscita-cavo-card').on('click', function() {
    $('.uscita-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.uscitaCavoSelezionata = $(this).data('uscita-cavo');
    
    checkStep5Completion();
  });
  
  $('.btn-seleziona-uscita-cavo').on('click', function(e) {
    e.stopPropagation();
    
    const uscitaCavoCard = $(this).closest('.uscita-cavo-card');
    $('.uscita-cavo-card').removeClass('selected');
    uscitaCavoCard.addClass('selected');
    
    configurazione.uscitaCavoSelezionata = uscitaCavoCard.data('uscita-cavo');
    
    checkStep5Completion();
  });
  
  $('#lunghezza-cavo-ingresso, #lunghezza-cavo-uscita').on('change', function() {
    const campo = $(this).attr('id');
    const valore = parseInt($(this).val(), 10) || 0;
    
    if (campo === 'lunghezza-cavo-ingresso') {
      configurazione.lunghezzaCavoIngresso = valore;
    } else if (campo === 'lunghezza-cavo-uscita') {
      configurazione.lunghezzaCavoUscita = valore;
    }
  });
}

function checkStep5Completion() {
  let isComplete = true;
  
  if (!configurazione.dimmerSelezionato) {
    isComplete = false;
  }
  
  if (!configurazione.tipoAlimentazioneCavo) {
    isComplete = false;
  }
  
  if (!configurazione.uscitaCavoSelezionata) {
    isComplete = false;
  }
  
  $('#btn-continua-step5').prop('disabled', !isComplete);
}

function vaiAllaPersonalizzazione() {
  console.log("Passaggio alla personalizzazione");
  
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  updateProgressBar(6);
  
  $("#step5-controllo").fadeOut(300, function() {
    $("#step6-personalizzazione").fadeIn(300);
    
    preparePersonalizzazioneListeners();
  });
}

function preparePersonalizzazioneListeners() {
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
  
  $('.btn-seleziona-forma').on('click', function(e) {
    e.stopPropagation();
    
    const formaCard = $(this).closest('.forma-taglio-card');
    $('.forma-taglio-card').removeClass('selected');
    formaCard.addClass('selected');
    
    configurazione.formaDiTaglioSelezionata = formaCard.data('forma');
    
    updateIstruzioniMisurazione(configurazione.formaDiTaglioSelezionata);
    
    checkStep6Completion();
  });
  
  $('.finitura-card').on('click', function() {
    $('.finitura-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.finituraSelezionata = $(this).data('finitura');
    
    checkStep6Completion();
  });
  
  $('.btn-seleziona-finitura').on('click', function(e) {
    e.stopPropagation();
    
    const finituraCard = $(this).closest('.finitura-card');
    $('.finitura-card').removeClass('selected');
    finituraCard.addClass('selected');
    
    configurazione.finituraSelezionata = finituraCard.data('finitura');
    
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

function updateIstruzioniMisurazione(forma) {
  const istruzioniContainer = $('#istruzioni-misurazione');
  istruzioniContainer.empty();
  
  switch(forma) {
    case 'DRITTO_SEMPLICE':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza desiderata in millimetri.</p>
        <img src="/static/img/forma_dritto.png" alt="Forma dritta" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    case 'FORMA_L_DX':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza dei due lati (A e B) in millimetri separati da 'x'.</p>
        <p>Esempio: 1000x500 (dove 1000mm è il lato A e 500mm è il lato B)</p>
        <img src="/static/img/forma_l_dx.png" alt="Forma L destra" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    case 'FORMA_L_SX':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza dei due lati (A e B) in millimetri separati da 'x'.</p>
        <p>Esempio: 1000x500 (dove 1000mm è il lato A e 500mm è il lato B)</p>
        <img src="/static/img/forma_l_sx.png" alt="Forma L sinistra" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    case 'FORMA_C':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza dei tre lati (A, B e C) in millimetri separati da 'x'.</p>
        <p>Esempio: 500x1000x500 (dove 500mm sono i lati verticali e 1000mm è il lato orizzontale)</p>
        <img src="/static/img/forma_c.png" alt="Forma C" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    case 'FORMA_A':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza dei quattro lati (A, B, C e D) in millimetri separati da 'x'.</p>
        <p>Esempio: 500x1000x500x1000 (dove 500mm sono i lati verticali e 1000mm sono i lati orizzontali)</p>
        <img src="/static/img/forma_a.png" alt="Forma A" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    case 'RETTANGOLO_QUADRATO':
      istruzioniContainer.html(`
        <p>Inserisci la lunghezza dei lati (A e B) in millimetri separati da 'x'.</p>
        <p>Esempio: 1000x1000 per un quadrato o 1200x800 per un rettangolo</p>
        <img src="/static/img/forma_rettangolo.png" alt="Rettangolo/Quadrato" class="img-fluid mb-3" style="max-height: 120px;" onerror="this.src='/static/img/placeholder.jpg'; this.style.height='120px'">
      `);
      break;
    default:
      istruzioniContainer.html(`<p>Seleziona una forma di taglio per visualizzare le istruzioni.</p>`);
  }
}

function calcolaProposte(lunghezzaRichiesta) {
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

function checkStep6Completion() {
  let isComplete = true;
  
  if (!configurazione.formaDiTaglioSelezionata) {
    isComplete = false;
  }
  
  if (!configurazione.finituraSelezionata) {
    isComplete = false;
  }
  
  if (configurazione.tipologiaSelezionata === 'taglio_misura' && !configurazione.lunghezzaRichiesta) {
    isComplete = false;
  }
  
  $('#btn-finalizza').prop('disabled', !isComplete);
}

function caricaFinitureDisponibili(profiloId) {
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

function finalizzaConfigurazione() {
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
                        <td>${riepilogo.alimentazioneSelezionata === 'SENZA_ALIMENTATORE' ? 'Senza alimentatore' : (riepilogo.alimentazioneSelezionata === 'ON/OFF' ? 'ON/OFF' : 'Dimmerabile TRIAC')}</td>
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

function salvaConfigurazione(codiceProdotto) {
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

function richiedPreventivo(codiceProdotto) {
  alert(`La richiesta di preventivo per il prodotto ${codiceProdotto} è stata inviata al nostro team. Verrai contattato al più presto.`);
}

function formatTemperatura(temperatura) {
  if (temperatura === 'CCT') {
    return 'Temperatura Dinamica (CCT)';
  } else if (temperatura === 'RGB') {
    return 'RGB Multicolore';
  } else if (temperatura === 'RGBW') {
    return 'RGBW (RGB + Bianco)';
  } else {
    return temperatura;
  }
}

function getTemperaturaColor(temperatura) {
  switch(temperatura) {
    case '2700K':
      return '#FFE9C0';
    case '3000K':
      return '#FFF1D9';
    case '6500K':
      return '#F5FBFF';
    case 'CCT':
      return 'linear-gradient(to right, #FFE9C0, #F5FBFF)';
    case 'RGB':
      return 'linear-gradient(to right, red, green, blue)';
    case 'RGBW':
      return 'linear-gradient(to right, red, green, blue, white)';
    default:
      return '#FFFFFF';
  }
}