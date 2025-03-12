// Dichiarazioni globali
let configurazione;
let mappaCategorieVisualizzazione;
let mappaTipologieVisualizzazione;
let mappaStripLedVisualizzazione;
let mappaFormeTaglio;
let mappaFiniture;

$(document).ready(function() {
  console.log("Document ready - Configuratore inizializzato");
  
  // Inizializza la configurazione
  configurazione = {
    categoriaSelezionata: null,
    profiloSelezionato: null,
    tipologiaSelezionata: null,
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

  // Mappatura categorie per visualizzazione
  mappaCategorieVisualizzazione = {
    'nanoprofili': 'Nanoprofili',
    'incasso': 'Profili a Incasso',
    'sospensione': 'Profili a Sospensione',
    'plafone': 'Profili a Plafone',
    'parete': 'Profili a Parete',
    'particolari': 'Profili Particolari'
  };
  
  // Mappatura tipologie per visualizzazione
  mappaTipologieVisualizzazione = {
    'taglio_misura': 'Taglio su misura',
    'profilo_intero': 'Profilo intero'
  };
  
  // Mappatura strip LED per visualizzazione
  mappaStripLedVisualizzazione = {
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
  
  // Mappatura forme di taglio
  mappaFormeTaglio = {
    'DRITTO_SEMPLICE': 'Dritto semplice',
    'FORMA_L_DX': 'Forma a L DX',
    'FORMA_L_SX': 'Forma a L SX',
    'FORMA_C': 'Forma a C',
    'FORMA_A': 'Forma a A',
    'RETTANGOLO_QUADRATO': 'Rettangolo/Quadrato'
  };
  
  // Mappatura finiture
  mappaFiniture = {
    'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
    'BIANCO': 'Bianco',
    'NERO': 'Nero',
    'ALLUMINIO': 'Alluminio'
  };

  // Mostra solo la prima pagina e nascondi tutte le altre
  $(".step-section").hide();
  $("#step1-tipologia").show();
  
  // Gestione click sugli hotspot (punti cliccabili)
  $('.hotspot').on('click', function() {
    const categoria = $(this).data('categoria');
    
    if (!categoria) {
      console.error("Nessuna categoria trovata per questo hotspot");
      return;
    }
    
    configurazione.categoriaSelezionata = categoria;
    
    // Aggiorna il testo della categoria selezionata
    $('.categoria-selezionata').text(`Categoria: ${mappaCategorieVisualizzazione[categoria] || categoria}`);
    
    // Aggiorna la progress bar
    updateProgressBar(2);
    
    // Cambia pagina con una dissolvenza graduale invece di nascondere/mostrare direttamente
    $("#step1-tipologia").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      // Carica i profili per questa categoria
      caricaProfili(categoria);
    });
  });
  
  // Pulsante per tornare alla pagina delle categorie
  $('.btn-torna-indietro').on('click', function(e) {
    e.preventDefault(); // Previene comportamento di default
    e.stopPropagation(); // Previene bubbling dell'evento
    
    $("#step2-modello").fadeOut(300, function() {
      $("#step1-tipologia").fadeIn(300);
      // Reset della selezione
      configurazione.categoriaSelezionata = null;
      configurazione.profiloSelezionato = null;
      
      // Aggiorna la progress bar
      updateProgressBar(1);
    });
  });
  
  // Pulsante "Continua" per passare al passo successivo
  $('#btn-continua-step2').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.profiloSelezionato) {
      vaiAllaSceltaTipologia();
    } else {
      alert("Seleziona un profilo prima di continuare");
    }
  });
  
  // Pulsante per tornare dalla tipologia al modello
  $('#btn-torna-step2').on('click', function(e) {
    e.preventDefault();
    
    $("#step3-tipologia").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(2);
    });
  });
  
  // Pulsante per continuare alla selezione della strip LED
  $('#btn-continua-step3').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.tipologiaSelezionata) {
      vaiAllaSceltaStripLed();
    } else {
      alert("Seleziona una tipologia prima di continuare");
    }
  });
  
  // Pulsante per tornare dalla strip LED alla tipologia
  $('#btn-torna-step3').on('click', function(e) {
    e.preventDefault();
    
    $("#step4-strip").fadeOut(300, function() {
      $("#step3-tipologia").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(3);
    });
  });
  
  // Pulsante per continuare alla fase successiva
  $('#btn-continua-step4').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.stripLedSelezionata) {
      if (configurazione.stripLedSelezionata === 'senza_strip') {
        // Se l'utente ha selezionato "Senza strip" vai direttamente all'alimentazione
        vaiAllAlimentazione();
      } else {
        // Altrimenti vai alla configurazione della temperatura e potenza
        vaiAllaTemperaturaEPotenza();
      }
    } else {
      alert("Seleziona una strip LED prima di continuare");
    }
  });
  
  // Pulsante per tornare dalla temperatura e potenza alla strip LED
  $('#btn-torna-step4').on('click', function(e) {
    e.preventDefault();
    
    $("#step5-temperatura-potenza").fadeOut(300, function() {
      $("#step4-strip").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(4);
    });
  });
  
  // Pulsante per continuare all'alimentazione
  $('#btn-continua-step5').on('click', function(e) {
    e.preventDefault();
    
    if (configurazione.temperaturaColoreSelezionata && configurazione.potenzaSelezionata) {
      vaiAllAlimentazione();
    } else {
      alert("Seleziona temperatura e potenza prima di continuare");
    }
  });
  
  // Pulsante per tornare dall'alimentazione alla temperatura e potenza
  $('#btn-torna-step5').on('click', function(e) {
    e.preventDefault();
    
    $("#step6-alimentazione").fadeOut(300, function() {
      // Se è stata selezionata una strip LED senza "senza_strip", vai allo step 5
      if (configurazione.stripLedSelezionata !== 'senza_strip') {
        $("#step5-temperatura-potenza").fadeIn(300);
        // Aggiorna la progress bar
        updateProgressBar(5);
      } else {
        // Altrimenti torna allo step 4
        $("#step4-strip").fadeIn(300);
        // Aggiorna la progress bar
        updateProgressBar(4);
      }
    });
  });
  
  // Pulsante per continuare al controllo (step 7)
  $('#btn-continua-step6').on('click', function(e) {
    e.preventDefault();
    
    // Verifica che sia stata selezionata un'alimentazione
    if (!configurazione.alimentazioneSelezionata) {
      alert("Seleziona il tipo di alimentazione prima di continuare");
      return;
    }
    
    // Se è stata selezionata un'alimentazione diversa da "Senza alimentatore", verifica che sia stato selezionato un alimentatore
    if (configurazione.alimentazioneSelezionata !== 'SENZA_ALIMENTATORE' && !configurazione.tipologiaAlimentatoreSelezionata) {
      alert("Seleziona la tipologia di alimentatore prima di continuare");
      return;
    }
    
    // Tutto a posto, prosegui al passaggio successivo
    vaiAlControllo();
  });
  
  // Pulsante per tornare dal controllo all'alimentazione
  $('#btn-torna-step6').on('click', function(e) {
    e.preventDefault();
    
    $("#step7-controllo").fadeOut(300, function() {
      $("#step6-alimentazione").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(6);
    });
  });
  
  // Pulsante per continuare alla personalizzazione (step 8)
  $('#btn-continua-step7').on('click', function(e) {
    e.preventDefault();
    
    // Verifica che tutte le opzioni necessarie siano state selezionate
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
    
    // Tutto a posto, prosegui al passaggio successivo
    vaiAllaPersonalizzazione();
  });
  
  // Pulsante per tornare alla pagina controllo
  $('#btn-torna-step7').on('click', function(e) {
    e.preventDefault();
    
    $("#step8-personalizzazione").fadeOut(300, function() {
      $("#step7-controllo").fadeIn(300);
      
      // Aggiorna la progress bar
      updateProgressBar(7);
    });
  });
  
  // Pulsante per finalizzare la configurazione
  $('#btn-finalizza').on('click', function(e) {
    e.preventDefault();
    
    // Verifica che tutti i campi necessari siano stati inseriti
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
});

// Funzioni comuni

// Aggiorna la progress bar
function updateProgressBar(step) {
  // Reset di tutti gli step
  $('.step-item').removeClass('active completed');
  
  // Imposta lo step corrente come attivo
  $(`#progress-step${step}`).addClass('active');
  
  // Imposta gli step precedenti come completati
  for (let i = 1; i < step; i++) {
    $(`#progress-step${i}`).addClass('completed');
  }
}

// Funzione per caricare i profili
function caricaProfili(categoria) {
  console.log("Caricamento profili per la categoria:", categoria);
  
  // Svuota il container e mostra il loader
  $('#profili-container').empty().html('<div class="text-center mt-5"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento profili...</p></div>');
  
  // Chiamata AJAX per ottenere i profili
  $.ajax({
    url: `/get_profili/${categoria}`,
    method: 'GET',
    success: function(data) {
      console.log("Profili ricevuti:", data);
      
      // Svuota il container
      $('#profili-container').empty();
      
      // Se non ci sono profili
      if (!data || data.length === 0) {
        $('#profili-container').html('<div class="col-12 text-center"><p>Nessun profilo disponibile per questa categoria.</p></div>');
        return;
      }
      
      // Crea un container per la griglia
      let grid = $('<div class="row"></div>');
      $('#profili-container').append(grid);
      
      // Mostra i profili
      data.forEach(function(profilo) {
        let profiloCard = $(`
          <div class="col-md-4 col-sm-6 mb-4 profilo-card-row">
            <div class="card profilo-card" data-id="${profilo.id}" data-nome="${profilo.nome}">
              <img src="${profilo.immagine || '/static/img/placeholder.jpg'}" class="card-img-top" alt="${profilo.nome}" onerror="this.src='/static/img/placeholder.jpg'">
              <div class="card-body">
                <h5 class="card-title">${profilo.nome}</h5>
                <p class="card-text small">${profilo.descrizione || 'Nessuna descrizione disponibile'}</p>
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-profilo">Seleziona</button>
              </div>
            </div>
          </div>
        `);
        
        grid.append(profiloCard);
      });
      
      // Aggiungi event listener alle card e ai pulsanti "Seleziona"
      $('.profilo-card').on('click', function(e) {
        e.stopPropagation(); // Previene bubbling dell'evento
        console.log("Profilo selezionato:", $(this).data('id'));
        $('.profilo-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.profiloSelezionato = $(this).data('id');
        configurazione.nomeModello = $(this).data('nome');
        
        // Abilita il pulsante "Continua"
        $('#btn-continua-step2').prop('disabled', false);
      });
      
      // Aggiungi event listener specifico al pulsante "Seleziona"
      $('.btn-seleziona-profilo').on('click', function(e) {
        e.stopPropagation(); // Previene bubbling dell'evento
        
        // Seleziona il profilo corrispondente
        const profiloCard = $(this).closest('.profilo-card');
        $('.profilo-card').removeClass('selected');
        profiloCard.addClass('selected');
        
        configurazione.profiloSelezionato = profiloCard.data('id');
        configurazione.nomeModello = profiloCard.data('nome');
        
        console.log("Profilo selezionato e avanzamento:", configurazione.profiloSelezionato);
        
        // Avanza allo step successivo
        vaiAllaSceltaTipologia();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento dei profili:", error);
      $('#profili-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento dei profili. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per passare alla scelta della tipologia (Step 3)
function vaiAllaSceltaTipologia() {
  console.log("Passaggio al terzo step");
  
  // Prepara lo step 3
  $('#profilo-nome-step3').text(configurazione.nomeModello);
  
  // Aggiorna la progress bar
  updateProgressBar(3);
  
  // Cambia pagina
  $("#step2-modello").fadeOut(300, function() {
    $("#step3-tipologia").fadeIn(300);
    
    // Carica le opzioni di tipologia per il profilo selezionato
    caricaOpzioniTipologia(configurazione.profiloSelezionato);
  });
}

// Funzione per caricare le opzioni di tipologia
function caricaOpzioniTipologia(profiloId) {
  console.log("Caricamento opzioni tipologia per profilo:", profiloId);
  
  // Svuota il container delle opzioni
  $('#tipologie-container').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni...</p></div>');
  
  // Chiamata AJAX per caricare le opzioni
  $.ajax({
    url: `/get_opzioni_profilo/${profiloId}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni profilo ricevute:", data);
      $('#tipologie-container').empty();
      
      if (!data.tipologie || data.tipologie.length === 0) {
        $('#tipologie-container').html('<div class="col-12 text-center"><p>Nessuna tipologia disponibile per questo profilo.</p></div>');
        return;
      }
      
      // Mostra le tipologie disponibili
      data.tipologie.forEach(function(tipologia) {
        $('#tipologie-container').append(`
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
      
      // Aggiungi event listener alle opzioni
      $('.tipologia-card').on('click', function() {
        $('.tipologia-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.tipologiaSelezionata = $(this).data('id');
        
        // Abilita il pulsante continua
        $('#btn-continua-step3').prop('disabled', false);
      });
      
      // Event listener per il pulsante seleziona
      $('.btn-seleziona-tipologia').on('click', function(e) {
        e.stopPropagation();
        
        // Seleziona la tipologia corrispondente
        const tipologiaCard = $(this).closest('.tipologia-card');
        $('.tipologia-card').removeClass('selected');
        tipologiaCard.addClass('selected');
        
        configurazione.tipologiaSelezionata = tipologiaCard.data('id');
        
        // Abilita il pulsante continua
        $('#btn-continua-step3').prop('disabled', false);
        
        // Procedi automaticamente alla selezione della strip LED
        vaiAllaSceltaStripLed();
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni:", error);
      $('#tipologie-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per passare alla scelta della strip LED (Step 4)
function vaiAllaSceltaStripLed() {
  console.log("Passaggio al quarto step");
  
  // Prepara lo step 4
  $('#profilo-nome-step4').text(configurazione.nomeModello);
  $('#tipologia-nome-step4').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  // Aggiorna la progress bar
  updateProgressBar(4);
  
  // Cambia pagina
  $("#step3-tipologia").fadeOut(300, function() {
    $("#step4-strip").fadeIn(300);
    
    // Carica le opzioni di strip LED per il profilo selezionato
    caricaOpzioniStripLed(configurazione.profiloSelezionato);
  });
}

// Funzione per caricare le opzioni di strip LED
function caricaOpzioniStripLed(profiloId) {
  console.log("Caricamento opzioni strip LED per profilo:", profiloId);
  
  // Svuota il container delle opzioni
  $('#strip-led-container').empty().html('<div class="text-center mt-3"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni strip LED...</p></div>');
  
  // Chiamata AJAX per caricare le opzioni
  $.ajax({
    url: `/get_opzioni_profilo/${profiloId}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni profilo ricevute:", data);
      $('#strip-led-container').empty();
      
      if (!data.strip_led || data.strip_led.length === 0) {
        $('#strip-led-container').html('<div class="col-12 text-center"><p>Nessuna strip LED disponibile per questo profilo.</p></div>');
        return;
      }
      
      // Aggiungi l'opzione "Senza strip LED"
      $('#strip-led-container').append(`
        <div class="col-md-4 mb-3">
          <div class="card option-card strip-led-card" data-id="senza_strip">
            <div class="card-body text-center">
              <h5 class="card-title">Senza Strip LED</h5>
              <button class="btn btn-sm btn-primary mt-2 btn-seleziona-strip">Seleziona</button>
            </div>
          </div>
        </div>
      `);
      
      // Mostra le strip LED disponibili
      data.strip_led.forEach(function(strip) {
        $('#strip-led-container').append(`
          <div class="col-md-4 mb-3">
            <div class="card option-card strip-led-card" data-id="${strip}">
              <div class="card-body text-center">
                <h5 class="card-title">${mappaStripLedVisualizzazione[strip] || strip}</h5>
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-strip">Seleziona</button>
              </div>
            </div>
          </div>
        `);
      });
      
      // Aggiungi event listener alle opzioni
      $('.strip-led-card').on('click', function() {
        $('.strip-led-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.stripLedSelezionata = $(this).data('id');
        
        // Abilita il pulsante continua
        $('#btn-continua-step4').prop('disabled', false);
      });
      
      // Event listener per il pulsante seleziona
      $('.btn-seleziona-strip').on('click', function(e) {
        e.stopPropagation();
        
        // Seleziona la strip LED corrispondente
        const stripCard = $(this).closest('.strip-led-card');
        $('.strip-led-card').removeClass('selected');
        stripCard.addClass('selected');
        
        configurazione.stripLedSelezionata = stripCard.data('id');
        
        // Abilita il pulsante continua
        $('#btn-continua-step4').prop('disabled', false);
        
        // Procedi automaticamente alla fase successiva (temperatura e potenza)
        if (configurazione.stripLedSelezionata === 'senza_strip') {
          // Se l'utente ha selezionato "Senza strip" vai direttamente all'alimentazione
          vaiAllAlimentazione();
        } else {
          // Altrimenti vai alla configurazione della temperatura e potenza
          vaiAllaTemperaturaEPotenza();
        }
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni strip LED:", error);
      $('#strip-led-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per passare alla temperatura e potenza
function vaiAllaTemperaturaEPotenza() {
  console.log("Passaggio alla temperatura e potenza");
  
  // Prepara lo step 5
  $('#profilo-nome-step5').text(configurazione.nomeModello);
  $('#tipologia-nome-step5').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  $('#strip-nome-step5').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  
  // Aggiorna la progress bar
  updateProgressBar(5);
  
  // Cambia pagina
  $("#step4-strip").fadeOut(300, function() {
    $("#step5-temperatura-potenza").fadeIn(300);
    
    // Carica le opzioni di temperatura per la strip LED selezionata
    caricaOpzioniTemperatura(configurazione.stripLedSelezionata);
  });
}

// Funzione per caricare le opzioni di temperatura
function caricaOpzioniTemperatura(stripId) {
  console.log("Caricamento opzioni temperatura per strip:", stripId);
  
  // Svuota il container delle opzioni
  $('#temperatura-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni temperatura...</p></div>');
  
  // Svuota anche il container delle potenze
  $('#potenza-container').empty();
  
  // Disabilita il pulsante Continua
  $('#btn-continua-step5').prop('disabled', true);
  
  // Reset delle opzioni selezionate
  configurazione.temperaturaColoreSelezionata = null;
  configurazione.potenzaSelezionata = null;
  
  // Chiamata AJAX per ottenere le opzioni di temperatura
  $.ajax({
    url: `/get_opzioni_temperatura/${stripId}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni temperatura ricevute:", data);
      
      // Svuota il container
      $('#temperatura-container').empty();
      
      if (!data.success) {
        $('#temperatura-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni temperatura. Riprova più tardi.</p></div>');
        return;
      }
      
      if (!data.temperature || data.temperature.length === 0) {
        $('#temperatura-container').html('<div class="col-12 text-center"><p>Nessuna opzione di temperatura disponibile per questa strip LED.</p></div>');
        return;
      }
      
      // Visualizza le opzioni di temperatura
      data.temperature.forEach(function(temperatura) {
        $('#temperatura-container').append(`
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="card option-card temperatura-card" data-temperatura="${temperatura}">
              <div class="card-body text-center">
                <h5 class="card-title">${formatTemperatura(temperatura)}</h5>
                <div class="temperatura-color-preview mt-2 mb-3" style="background: ${getTemperaturaColor(temperatura)};"></div>
                <button class="btn btn-sm btn-primary mt-2 btn-seleziona-temperatura">Seleziona</button>
              </div>
            </div>
          </div>
        `);
      });
      
      // Stile per il preview del colore
      $('<style>').text(`
        .temperatura-color-preview {
          width: 100%;
          height: 30px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
      `).appendTo('head');
      
      // Aggiungi event listener alle opzioni
      $('.temperatura-card').on('click', function() {
        $('.temperatura-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.temperaturaColoreSelezionata = $(this).data('temperatura');
        
        // Carica le opzioni di potenza
        caricaOpzioniPotenza(configurazione.stripLedSelezionata, configurazione.temperaturaColoreSelezionata);
      });
      
      // Event listener per il pulsante seleziona
      $('.btn-seleziona-temperatura').on('click', function(e) {
        e.stopPropagation();
        
        // Seleziona la temperatura corrispondente
        const temperaturaCard = $(this).closest('.temperatura-card');
        $('.temperatura-card').removeClass('selected');
        temperaturaCard.addClass('selected');
        
        configurazione.temperaturaColoreSelezionata = temperaturaCard.data('temperatura');
        
        // Carica le opzioni di potenza
        caricaOpzioniPotenza(configurazione.stripLedSelezionata, configurazione.temperaturaColoreSelezionata);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni temperatura:", error);
      $('#temperatura-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni temperatura. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per caricare le opzioni di potenza
function caricaOpzioniPotenza(stripId, temperatura) {
  console.log("Caricamento opzioni potenza per strip:", stripId, "e temperatura:", temperatura);
  
  // Svuota il container delle opzioni
  $('#potenza-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni potenza...</p></div>');
  
  // Disabilita il pulsante Continua
  $('#btn-continua-step5').prop('disabled', true);
  
  // Reset dell'opzione selezionata
  configurazione.potenzaSelezionata = null;
  
  // Chiamata AJAX per ottenere le opzioni di potenza
  $.ajax({
    url: `/get_opzioni_potenza/${stripId}/${temperatura}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni potenza ricevute:", data);
      
      // Svuota il container
      $('#potenza-container').empty();
      
      if (!data.success) {
        $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza.</p></div>');
        return;
      }
      
      if (!data.potenze || data.potenze.length === 0) {
        $('#potenza-container').html('<div class="col-12 text-center"><p>Nessuna opzione di potenza disponibile per questa combinazione.</p></div>');
        return;
      }
      
      // Visualizza le opzioni di potenza
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
      
      // Aggiungi event listener alle opzioni
      $('.potenza-card').on('click', function() {
        $('.potenza-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.potenzaSelezionata = $(this).data('potenza');
        configurazione.codicePotenza = $(this).data('codice');
        
        // Abilita il pulsante continua
        $('#btn-continua-step5').prop('disabled', false);
      });
      
      // Event listener per il pulsante seleziona
      $('.btn-seleziona-potenza').on('click', function(e) {
        e.stopPropagation();
        
        // Seleziona la potenza corrispondente
        const potenzaCard = $(this).closest('.potenza-card');
        $('.potenza-card').removeClass('selected');
        potenzaCard.addClass('selected');
        
        configurazione.potenzaSelezionata = potenzaCard.data('potenza');
        configurazione.codicePotenza = potenzaCard.data('codice');
        
        // Abilita il pulsante continua
        $('#btn-continua-step5').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni potenza:", error);
      $('#potenza-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni potenza. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per passare all'alimentazione
function vaiAllAlimentazione() {
  console.log("Passaggio all'alimentazione");
  
  // Prepara lo step 6
  $('#profilo-nome-step6').text(configurazione.nomeModello);
  $('#tipologia-nome-step6').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  // Se è stata selezionata una strip LED, mostra le informazioni
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step6').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
    
    // Mostra i badge di temperatura e potenza solo se sono state selezionate
    if (configurazione.temperaturaColoreSelezionata) {
      $('#temperatura-nome-step6').text(formatTemperatura(configurazione.temperaturaColoreSelezionata));
      $('#badge-temperatura-step6').show();
    } else {
      $('#badge-temperatura-step6').hide();
    }
    
    if (configurazione.potenzaSelezionata) {
      $('#potenza-nome-step6').text(configurazione.potenzaSelezionata);
      $('#badge-potenza-step6').show();
    } else {
      $('#badge-potenza-step6').hide();
    }
  } else {
    // Se non c'è strip LED, nascondi i badge relativi
    $('#strip-nome-step6').text('Senza Strip LED');
    $('#badge-temperatura-step6').hide();
    $('#badge-potenza-step6').hide();
  }
  
  // Aggiorna la progress bar
  updateProgressBar(6);
  
  // Cambia pagina
  $("#step5-temperatura-potenza").fadeOut(300, function() {
    $("#step6-alimentazione").fadeIn(300);
    
    // Prepara l'interfaccia e i listener per le opzioni di alimentazione
    prepareAlimentazioneListeners();
  });
}

// Funzione per preparare i listener degli elementi di alimentazione
function prepareAlimentazioneListeners() {
  // Resetta le selezioni
  configurazione.alimentazioneSelezionata = null;
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  // Nascondi la sezione alimentatore
  $('#alimentatore-section').hide();
  
  // Disabilita il pulsante continua
  $('#btn-continua-step6').prop('disabled', true);
  
  // Rimuovi la classe selected da tutte le opzioni
  $('.alimentazione-card').removeClass('selected');
  
  // Aggiungi event listener alle opzioni di alimentazione
  $('.alimentazione-card').on('click', function() {
    $('.alimentazione-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazione = $(this).data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      // Nascondi la sezione dell'alimentatore
      $('#alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      
      // Abilita il pulsante continua
      $('#btn-continua-step6').prop('disabled', false);
    } else {
      // Carica le opzioni di alimentatore
      caricaOpzioniAlimentatore(alimentazione);
      
      // Mostra la sezione dell'alimentatore
      $('#alimentatore-section').show();
    }
  });
  
  // Event listener per il pulsante seleziona alimentazione
  $('.btn-seleziona-alimentazione').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona l'alimentazione corrispondente
    const alimentazioneCard = $(this).closest('.alimentazione-card');
    $('.alimentazione-card').removeClass('selected');
    alimentazioneCard.addClass('selected');
    
    const alimentazione = alimentazioneCard.data('alimentazione');
    configurazione.alimentazioneSelezionata = alimentazione;
    
    if (alimentazione === 'SENZA_ALIMENTATORE') {
      // Nascondi la sezione dell'alimentatore
      $('#alimentatore-section').hide();
      configurazione.tipologiaAlimentatoreSelezionata = null;
      
      // Abilita il pulsante continua
      $('#btn-continua-step6').prop('disabled', false);
    } else {
      // Carica le opzioni di alimentatore
      caricaOpzioniAlimentatore(alimentazione);
      
      // Mostra la sezione dell'alimentatore
      $('#alimentatore-section').show();
    }
  });
}

// Funzione per caricare le opzioni di alimentatore
function caricaOpzioniAlimentatore(tipoAlimentazione) {
  console.log("Caricamento opzioni alimentatore per tipo:", tipoAlimentazione);
  
  // Svuota il container delle opzioni
  $('#alimentatore-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Caricamento opzioni alimentatore...</p></div>');
  
  // Disabilita il pulsante continua
  $('#btn-continua-step6').prop('disabled', true);
  
  // Reset dell'opzione selezionata
  configurazione.tipologiaAlimentatoreSelezionata = null;
  
  // Chiamata AJAX per ottenere le opzioni di alimentatore
  $.ajax({
    url: `/get_opzioni_alimentatore/${tipoAlimentazione}`,
    method: 'GET',
    success: function(data) {
      console.log("Opzioni alimentatore ricevute:", data);
      
      // Svuota il container
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
      
      // Visualizza le opzioni di alimentatore
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
      
      // Aggiungi event listener alle opzioni
      $('.alimentatore-card').on('click', function() {
        $('.alimentatore-card').removeClass('selected');
        $(this).addClass('selected');
        configurazione.tipologiaAlimentatoreSelezionata = $(this).data('alimentatore');
        
        // Abilita il pulsante continua
        $('#btn-continua-step6').prop('disabled', false);
      });
      
      // Event listener per il pulsante seleziona
      $('.btn-seleziona-alimentatore').on('click', function(e) {
        e.stopPropagation();
        
        // Seleziona l'alimentatore corrispondente
        const alimentatoreCard = $(this).closest('.alimentatore-card');
        $('.alimentatore-card').removeClass('selected');
        alimentatoreCard.addClass('selected');
        
        configurazione.tipologiaAlimentatoreSelezionata = alimentatoreCard.data('alimentatore');
        
        // Abilita il pulsante continua
        $('#btn-continua-step6').prop('disabled', false);
      });
    },
    error: function(error) {
      console.error("Errore nel caricamento delle opzioni alimentatore:", error);
      $('#alimentatore-container').html('<div class="col-12 text-center"><p class="text-danger">Errore nel caricamento delle opzioni alimentatore. Riprova più tardi.</p></div>');
    }
  });
}

// Funzione per passare al controllo (step 7 - dimmer e cavi)
function vaiAlControllo() {
  console.log("Passaggio al controllo (dimmer e cavi)");
  
  // Prepara lo step 7
  $('#profilo-nome-step7').text(configurazione.nomeModello);
  $('#tipologia-nome-step7').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  // Adatta l'interfaccia in base alla selezione della strip LED
  if (configurazione.stripLedSelezionata !== 'senza_strip') {
    $('#strip-nome-step7').text(mappaStripLedVisualizzazione[configurazione.stripLedSelezionata] || configurazione.stripLedSelezionata);
  } else {
    $('#strip-nome-step7').text('Senza Strip LED');
  }
  
  // Mostra l'alimentazione selezionata
  if (configurazione.alimentazioneSelezionata === 'SENZA_ALIMENTATORE') {
    $('#alimentazione-nome-step7').text('Senza alimentatore');
  } else {
    let alimentazioneText = configurazione.alimentazioneSelezionata === 'ON/OFF' ? 'ON/OFF' : 'Dimmerabile TRIAC';
    $('#alimentazione-nome-step7').text(alimentazioneText);
  }
  
  // Aggiorna la progress bar
  updateProgressBar(7);
  
  // Cambia pagina
  $("#step6-alimentazione").fadeOut(300, function() {
    $("#step7-controllo").fadeIn(300);
    
    // Prepara l'interfaccia e i listener per le opzioni di controllo
    prepareControlloListeners();
  });
}

// Funzione per preparare i listener degli elementi di controllo
function prepareControlloListeners() {
  // Resetta le selezioni
  configurazione.dimmerSelezionato = null;
  configurazione.tipoAlimentazioneCavo = null;
  configurazione.uscitaCavoSelezionata = null;
  
  // Nascondi gli avvisi inizialmente
  $('#dimmer-warning').hide();
  $('#lunghezza-cavo-uscita-container').hide();
  
  // Imposta i valori di default per i campi di lunghezza
  $('#lunghezza-cavo-ingresso').val(1800);
  $('#lunghezza-cavo-uscita').val(1800);
  configurazione.lunghezzaCavoIngresso = 1800;
  configurazione.lunghezzaCavoUscita = 1800;
  
  // Disabilita il pulsante continua
  $('#btn-continua-step7').prop('disabled', true);
  
  // Rimuovi la classe selected da tutte le opzioni
  $('.dimmer-card, .alimentazione-cavo-card, .uscita-cavo-card').removeClass('selected');
  
  // Aggiungi event listener alle opzioni di dimmer
  $('.dimmer-card').on('click', function() {
    $('.dimmer-card').removeClass('selected');
    $(this).addClass('selected');
    
    const dimmer = $(this).data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    // Mostra l'avviso per lo spazio non illuminato se necessario
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep7Completion();
  });
  
  // Event listener per il pulsante seleziona dimmer
  $('.btn-seleziona-dimmer').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona il dimmer corrispondente
    const dimmerCard = $(this).closest('.dimmer-card');
    $('.dimmer-card').removeClass('selected');
    dimmerCard.addClass('selected');
    
    const dimmer = dimmerCard.data('dimmer');
    configurazione.dimmerSelezionato = dimmer;
    
    // Mostra l'avviso per lo spazio non illuminato se necessario
    if (dimmer === 'TOUCH_SU_PROFILO') {
      $('#dimmer-warning').show();
    } else {
      $('#dimmer-warning').hide();
    }
    
    checkStep7Completion();
  });
  
  // Aggiungi event listener alle opzioni di alimentazione cavo
  $('.alimentazione-cavo-card').on('click', function() {
    $('.alimentazione-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    const alimentazioneCavo = $(this).data('alimentazione-cavo');
    configurazione.tipoAlimentazioneCavo = alimentazioneCavo;
    
    // Mostra/nascondi il campo per la lunghezza del cavo in uscita
    if (alimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      $('#lunghezza-cavo-uscita-container').hide();
    }
    
    checkStep7Completion();
  });
  
  // Event listener per il pulsante seleziona alimentazione cavo
  $('.btn-seleziona-alimentazione-cavo').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona l'alimentazione cavo corrispondente
    const alimentazioneCavoCard = $(this).closest('.alimentazione-cavo-card');
    $('.alimentazione-cavo-card').removeClass('selected');
    alimentazioneCavoCard.addClass('selected');
    
    const alimentazioneCavo = alimentazioneCavoCard.data('alimentazione-cavo');
    configurazione.tipoAlimentazioneCavo = alimentazioneCavo;
    
    // Mostra/nascondi il campo per la lunghezza del cavo in uscita
    if (alimentazioneCavo === 'ALIMENTAZIONE_DOPPIA') {
      $('#lunghezza-cavo-uscita-container').show();
    } else {
      $('#lunghezza-cavo-uscita-container').hide();
    }
    
    checkStep7Completion();
  });
  
  // Aggiungi event listener alle opzioni di uscita cavo
  $('.uscita-cavo-card').on('click', function() {
    $('.uscita-cavo-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.uscitaCavoSelezionata = $(this).data('uscita-cavo');
    
    checkStep7Completion();
  });
  
  // Event listener per il pulsante seleziona uscita cavo
  $('.btn-seleziona-uscita-cavo').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona l'uscita cavo corrispondente
    const uscitaCavoCard = $(this).closest('.uscita-cavo-card');
    $('.uscita-cavo-card').removeClass('selected');
    uscitaCavoCard.addClass('selected');
    
    configurazione.uscitaCavoSelezionata = uscitaCavoCard.data('uscita-cavo');
    
    checkStep7Completion();
  });
  
  // Aggiungi event listener ai campi di lunghezza cavo
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

// Funzione per verificare se tutte le selezioni del step 7 sono complete
function checkStep7Completion() {
  let isComplete = true;
  
  // Verifica che tutte le opzioni necessarie siano state selezionate
  if (!configurazione.dimmerSelezionato) {
    isComplete = false;
  }
  
  if (!configurazione.tipoAlimentazioneCavo) {
    isComplete = false;
  }
  
  if (!configurazione.uscitaCavoSelezionata) {
    isComplete = false;
  }
  
  // Abilita/disabilita il pulsante continua
  $('#btn-continua-step7').prop('disabled', !isComplete);
}

// Funzione per passare alla personalizzazione (step 8)
function vaiAllaPersonalizzazione() {
  console.log("Passaggio alla personalizzazione");
  
  // Prepara lo step 8
  $('#profilo-nome-step8').text(configurazione.nomeModello);
  $('#tipologia-nome-step8').text(mappaTipologieVisualizzazione[configurazione.tipologiaSelezionata] || configurazione.tipologiaSelezionata);
  
  // Aggiorna la progress bar
  updateProgressBar(8);
  
  // Cambia pagina
  $("#step7-controllo").fadeOut(300, function() {
    $("#step8-personalizzazione").fadeIn(300);
    
    // Prepara l'interfaccia e i listener per le opzioni di personalizzazione
    preparePersonalizzazioneListeners();
  });
}

// Funzione per preparare i listener degli elementi di personalizzazione
function preparePersonalizzazioneListeners() {
  // Resetta le selezioni per la forma di taglio
  configurazione.formaDiTaglioSelezionata = "DRITTO_SEMPLICE";
  // Carica le finiture disponibili per il profilo selezionato
  caricaFinitureDisponibili(configurazione.profiloSelezionato);
  // Imposta la selezione predefinita per la forma di taglio
  $('.forma-taglio-card[data-forma="DRITTO_SEMPLICE"]').addClass('selected');
  
  // Aggiungi event listener alle opzioni di forma taglio
  $('.forma-taglio-card').on('click', function() {
    $('.forma-taglio-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.formaDiTaglioSelezionata = $(this).data('forma');
    
    // Aggiorna le istruzioni di misurazione in base alla forma selezionata
    updateIstruzioniMisurazione(configurazione.formaDiTaglioSelezionata);
    checkStep8Completion();
  });
  
  // Event listener per il pulsante seleziona forma taglio
  $('.btn-seleziona-forma').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona la forma corrispondente
    const formaCard = $(this).closest('.forma-taglio-card');
    $('.forma-taglio-card').removeClass('selected');
    formaCard.addClass('selected');
    
    configurazione.formaDiTaglioSelezionata = formaCard.data('forma');
    
    // Aggiorna le istruzioni di misurazione in base alla forma selezionata
    updateIstruzioniMisurazione(configurazione.formaDiTaglioSelezionata);
    
    checkStep8Completion();
  });
  
  // Aggiungi event listener alle opzioni di finitura
  $('.finitura-card').on('click', function() {
    $('.finitura-card').removeClass('selected');
    $(this).addClass('selected');
    
    configurazione.finituraSelezionata = $(this).data('finitura');
    
    checkStep8Completion();
  });
  
  // Event listener per il pulsante seleziona finitura
  $('.btn-seleziona-finitura').on('click', function(e) {
    e.stopPropagation();
    
    // Seleziona la finitura corrispondente
    const finituraCard = $(this).closest('.finitura-card');
    $('.finitura-card').removeClass('selected');
    finituraCard.addClass('selected');
    
    configurazione.finituraSelezionata = finituraCard.data('finitura');
    
    checkStep8Completion();
  });
  
  // Aggiungi event listener al campo lunghezza personalizzata
  $('#lunghezza-personalizzata').on('input', function() {
    configurazione.lunghezzaRichiesta = parseInt($(this).val(), 10) || null;
    
    // Se è stata inserita una lunghezza valida, calcola le proposte
    if (configurazione.lunghezzaRichiesta && configurazione.lunghezzaRichiesta > 0) {
      calcolaProposte(configurazione.lunghezzaRichiesta);
    } else {
      // Nascondi le proposte se la lunghezza non è valida
      $('#proposte-container').hide();
    }
    
    checkStep8Completion();
  });
  
  // Event listener per le opzioni di proposta
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
  });
  
  // Inizializza con le opzioni predefinite
  updateIstruzioniMisurazione('DRITTO_SEMPLICE');
  
  // Disabilita il pulsante finalizza se non tutte le opzioni sono selezionate
  checkStep8Completion();
}

// Funzione per aggiornare le istruzioni di misurazione in base alla forma selezionata
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

// Funzione per calcolare le proposte di lunghezza
function calcolaProposte(lunghezzaRichiesta) {
  // Chiamata AJAX per calcolare le proposte
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
      
      // Memorizza le proposte nella configurazione
      configurazione.proposta1 = data.proposte.proposta1;
      configurazione.proposta2 = data.proposte.proposta2;
      configurazione.spazioProduzione = data.spazioProduzione || 5;
      
      // Aggiorna il markup delle proposte
      $('#proposta1-valore').text(data.proposte.proposta1 + 'mm');
      $('#proposta2-valore').text(data.proposte.proposta2 + 'mm');
      $('#spazio-produzione').text(data.spazioProduzione);
      
      // Aggiorna i valori dei pulsanti
      $('.btn-proposta1').data('valore', data.proposte.proposta1);
      $('.btn-proposta2').data('valore', data.proposte.proposta2);
      
      // Mostra il container delle proposte
      $('#proposte-container').show();
    },
    error: function(error) {
      console.error("Errore nel calcolo delle proposte:", error);
      $('#proposte-container').hide();
    }
  });
}

// Funzione per verificare se tutte le selezioni del step 8 sono complete
function checkStep8Completion() {
  let isComplete = true;
  
  // Verifica che tutte le opzioni necessarie siano state selezionate
  if (!configurazione.formaDiTaglioSelezionata) {
    isComplete = false;
  }
  
  if (!configurazione.finituraSelezionata) {
    isComplete = false;
  }
  
  if (configurazione.tipologiaSelezionata === 'taglio_misura' && !configurazione.lunghezzaRichiesta) {
    isComplete = false;
  }
  
  // Abilita/disabilita il pulsante finalizza
  $('#btn-finalizza').prop('disabled', !isComplete);
}

// Funzione per caricare le finiture disponibili per un profilo
function caricaFinitureDisponibili(profiloId) {
	console.log("Caricamento finiture disponibili per profilo:", profiloId);
	
	// Reset delle selezioni
	$('.finitura-card').removeClass('selected');
	configurazione.finituraSelezionata = null;
	
	// Chiamata AJAX per ottenere le finiture disponibili
	$.ajax({
	  url: `/get_finiture/${profiloId}`,
	  method: 'GET',
	  success: function(data) {
		console.log("Finiture ricevute:", data);
		
		if (!data.success) {
		  // Se c'è un errore, mostra tutte le finiture di default
		  $('.finitura-card').parent().show();
		  return;
		}
		
		// Mostra solo le finiture disponibili
		const finitureDisponibili = data.finiture.map(f => f.id);
		
		// Nascondi tutte le finiture prima
		$('.finitura-card').parent().hide();
		
		// Mostra solo quelle disponibili
		finitureDisponibili.forEach(function(finituraId) {
		  $(`.finitura-card[data-finitura="${finituraId}"]`).parent().show();
		});
		
		// Se non ci sono finiture disponibili, mostra tutte
		if (finitureDisponibili.length === 0) {
		  $('.finitura-card').parent().show();
		}
	  },
	  error: function(error) {
		console.error("Errore nel caricamento delle finiture:", error);
		// In caso di errore, mostra tutte le finiture
		$('.finitura-card').parent().show();
	  }
	});
  }

// Funzione per finalizzare la configurazione
function finalizzaConfigurazione() {
	console.log("Finalizzazione della configurazione:", configurazione);
	
	// Mostra il loader
	$('#riepilogo-container').html('<div class="text-center my-5"><div class="spinner-border" role="status"></div><p class="mt-3">Generazione riepilogo...</p></div>');
	
	// Cambia pagina dal Step 8 al Step 9 (Riepilogo)
	$("#step8-personalizzazione").fadeOut(300, function() {
	  $("#step9-riepilogo").fadeIn(300);
	  
	  // Aggiorna la progress bar per lo step finale
	  updateProgressBar(9);
	  
	  // Chiamata AJAX per finalizzare la configurazione
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
		  
		  // Costruisci il riepilogo
		  const riepilogo = data.riepilogo;
		  const potenzaTotale = data.potenzaTotale;
		  const codiceProdotto = data.codiceProdotto;
		  
		  // Crea una tabella HTML con tutte le informazioni
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
						  <th scope="row">Strip LED</th>
						  <td>${riepilogo.stripLedSelezionata === 'senza_strip' ? 'Senza Strip LED' : (mappaStripLedVisualizzazione[riepilogo.stripLedSelezionata] || riepilogo.stripLedSelezionata)}</td>
						</tr>
		  `;
		  
		  // Aggiungi le informazioni sulla temperatura e potenza solo se è stata selezionata una strip LED
		  if (riepilogo.stripLedSelezionata !== 'senza_strip') {
			riepilogoHtml += `
						<tr>
						  <th scope="row">Temperatura colore</th>
						  <td>${formatTemperatura(riepilogo.temperaturaColoreSelezionata)}</td>
						</tr>
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
		  
		  // Aggiungi le informazioni sull'alimentatore solo se è stato selezionato
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
		  
		  // Aggiungi la lunghezza del cavo in uscita solo se è stata selezionata l'alimentazione doppia
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
		  
		  // Aggiungi le informazioni sulla potenza totale solo se è stata selezionata una strip LED
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
		  
		  // Inserisci il riepilogo nel container
		  $('#riepilogo-container').html(riepilogoHtml);
		  
		  // Aggiungi gli event listener ai pulsanti
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
  
  // Aggiungi anche questo event listener dopo gli altri event listener nel document.ready
  $(document).ready(function() {
	// ... codice esistente ...
	
	// Pulsante per tornare alla pagina personalizzazione dal riepilogo
	$('#btn-torna-step8').on('click', function(e) {
	  e.preventDefault();
	  
	  $("#step9-riepilogo").fadeOut(300, function() {
		$("#step8-personalizzazione").fadeIn(300);
		
		// Aggiorna la progress bar
		updateProgressBar(8);
	  });
	});
	
	// ... fine document.ready ...
  });

// Funzione per salvare la configurazione
function salvaConfigurazione(codiceProdotto) {
  // Per semplicità, la salviamo semplicemente come un file JSON
  const configurazioneDaScaricare = {
    codiceProdotto: codiceProdotto,
    configurazione: configurazione,
    dataCreazione: new Date().toISOString()
  };
  
  // Converti in JSON
  const jsonString = JSON.stringify(configurazioneDaScaricare, null, 2);
  
  // Crea un blob e un link per il download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `configurazione_${codiceProdotto}_${Date.now()}.json`;
  a.click();
  
  // Libera la memoria
  URL.revokeObjectURL(url);
  
  // Mostra un messaggio di successo
  alert("Configurazione salvata con successo!");
}

// Funzione per richiedere un preventivo
function richiedPreventivo(codiceProdotto) {
  // In una vera applicazione, qui si aprirebbe un form per la richiesta di preventivo
  alert(`La richiesta di preventivo per il prodotto ${codiceProdotto} è stata inviata al nostro team. Verrai contattato al più presto.`);
}

// Funzione per formattare la visualizzazione della temperatura
function formatTemperatura(temperatura) {
  if (temperatura === 'CCT') {
    return 'Temperatura Dinamica (CCT)';
  } else if (temperatura === 'RGB') {
    return 'RGB Multicolore';
  } else if (temperatura === 'RGBW') {
    return 'RGBW (RGB + Bianco)';
  } else {
    return temperatura; // Ad es. "2700K", "3000K", ecc.
  }
}

// Funzione per ottenere il colore di anteprima in base alla temperatura
function getTemperaturaColor(temperatura) {
  switch(temperatura) {
    case '2700K':
      return '#FFE9C0'; // Warm white
    case '3000K':
      return '#FFF1D9'; // Soft white
    case '6500K':
      return '#F5FBFF'; // Cool white
    case 'CCT':
      return 'linear-gradient(to right, #FFE9C0, #F5FBFF)'; // Gradient from warm to cool
    case 'RGB':
      return 'linear-gradient(to right, red, green, blue)'; // RGB gradient
    case 'RGBW':
      return 'linear-gradient(to right, red, green, blue, white)'; // RGBW gradient
    default:
      return '#FFFFFF'; // Default white
  }
}