$(document).ready(function() {
	// Oggetto per memorizzare le selezioni dell'utente
	let configurazione = {
	  macrocategoria: '',
	  modello: '',
	  caratteristiche: {}
	};
	
	// Gestione click sugli hotspot per la selezione della macrocategoria
	$('.hotspot').on('click', function() {
	  const macrocategoria = $(this).data('categoria');
	  configurazione.macrocategoria = macrocategoria;
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
		<li class="breadcrumb-item active">${macrocategoria}</li>
	  `);
	  
	  // Mostra la categoria selezionata nel prossimo step
	  $('.categoria-selezionata').text(`Categoria: ${macrocategoria}`);
	  
	  // Cambia step
	  cambiaStep('step-macrocategoria', 'step-modello');
	  
	  // Carica i modelli per questa macrocategoria
	  caricaModelli(macrocategoria);
	});
	
	// Gestione click sul breadcrumb home
	$(document).on('click', '#bread-home', function(e) {
	  e.preventDefault();
	  tornaNellaHome();
	});
	
	// Gestione click sul pulsante torna indietro
	$('.btn-torna-indietro').on('click', function() {
	  tornaNellaHome();
	});
	
	// Gestione click sul pulsante torna ai modelli
	$('.btn-torna-modelli').on('click', function() {
	  cambiaStep('step-caratteristiche', 'step-modello');
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
		<li class="breadcrumb-item active">${configurazione.macrocategoria}</li>
	  `);
	});
	
	// Gestione click sul pulsante finalizza configurazione
	$('#btn-finalizza').on('click', function() {
	  finalizzaConfigurazione();
	});
	
	// Gestione click sul pulsante nuova configurazione
	$('#btn-nuova-configurazione').on('click', function() {
	  tornaNellaHome();
	});
	
	// Gestione click sul pulsante salva PDF
	$('#btn-salva-pdf').on('click', function() {
	  alert('Funzionalità di salvataggio PDF in fase di implementazione');
	  // Qui andrebbe implementata la generazione del PDF
	});
	
	// Funzione per caricare i modelli di una macrocategoria
	function caricaModelli(macrocategoria) {
	  // Svuota il container dei modelli
	  $('#modelli-container').empty();
	  
	  // Mostra un loader
	  $('#modelli-container').html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Caricamento...</span></div></div>');
	  
	  // Chiamata AJAX per ottenere i modelli
	  $.ajax({
		url: `/get_modelli/${macrocategoria}`,
		method: 'GET',
		success: function(data) {
		  // Svuota nuovamente il container
		  $('#modelli-container').empty();
		  
		  // Se non ci sono modelli
		  if (data.length === 0) {
			$('#modelli-container').html('<div class="col-12 text-center"><p>Nessun modello disponibile per questa categoria.</p></div>');
			return;
		  }
		  
		  // Popola il container con i modelli
		  data.forEach(function(modello) {
			$('#modelli-container').append(`
			  <div class="col-12 col-md-6 col-lg-4">
				<div class="card card-modello" data-modello="${modello.nome}">
				  <img src="${modello.immagine}" class="card-img-top" alt="${modello.nome}" onerror="this.src='/static/img/placeholder.jpg'">
				  <div class="card-body">
					<h5 class="card-title">${modello.nome}</h5>
					<p class="card-text">${modello.descrizione || 'Nessuna descrizione disponibile'}</p>
				  </div>
				</div>
			  </div>
			`);
		  });
		  
		  // Aggiungi event listener alle card dei modelli
		  $('.card-modello').on('click', function() {
			const modello = $(this).data('modello');
			selezionaModello(modello);
		  });
		},
		error: function() {
		  $('#modelli-container').html('<div class="col-12 text-center"><p>Errore nel caricamento dei modelli. Riprova più tardi.</p></div>');
		}
	  });
	}
	
	// Funzione per gestire la selezione di un modello
	function selezionaModello(modello) {
	  configurazione.modello = modello;
	  configurazione.caratteristiche = {}; // Reset delle caratteristiche precedenti
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
		<li class="breadcrumb-item"><a href="#" id="bread-categoria">${configurazione.macrocategoria}</a></li>
		<li class="breadcrumb-item active">${modello}</li>
	  `);
	  
	  // Mostra il modello selezionato nel prossimo step
	  $('.modello-selezionato').text(`Modello: ${modello}`);
	  
	  // Cambia step
	  cambiaStep('step-modello', 'step-caratteristiche');
	  
	  // Carica le caratteristiche per questo modello
	  caricaCaratteristiche(modello);
	}
	
	// Gestione click sul breadcrumb categoria
	$(document).on('click', '#bread-categoria', function(e) {
	  e.preventDefault();
	  cambiaStep('step-caratteristiche', 'step-modello');
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
		<li class="breadcrumb-item active">${configurazione.macrocategoria}</li>
	  `);
	});
	
	// Funzione per caricare le caratteristiche di un modello
	function caricaCaratteristiche(modello) {
	  // Svuota il form di configurazione
	  $('#form-configurazione').empty();
	  
	  // Mostra un loader
	  $('#form-configurazione').html('<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Caricamento...</span></div></div>');
	  
	  // Chiamata AJAX per ottenere le caratteristiche
	  $.ajax({
		url: `/get_caratteristiche/${modello}`,
		method: 'GET',
		success: function(data) {
		  // Svuota nuovamente il form
		  $('#form-configurazione').empty();
		  
		  // Se non ci sono caratteristiche
		  if (Object.keys(data).length === 0) {
			$('#form-configurazione').html('<p class="alert alert-info">Questo modello non ha caratteristiche configurabili.</p>');
			return;
		  }
		  
		  // Popola il form con le caratteristiche
		  Object.keys(data).forEach(function(caratteristica) {
			const valori = data[caratteristica];
			
			// Crea un select per ogni caratteristica
			$('#form-configurazione').append(`
			  <div class="form-group">
				<label for="select-${caratteristica}">${caratteristica}:</label>
				<select class="form-control" id="select-${caratteristica}" name="${caratteristica}">
				  <option value="">Seleziona ${caratteristica}</option>
				  ${valori.map(valore => `<option value="${valore}">${valore}</option>`).join('')}
				</select>
			  </div>
			`);
		  });
		  
		  // Aggiungi event listener ai select
		  $('#form-configurazione select').on('change', function() {
			const caratteristica = $(this).attr('name');
			const valore = $(this).val();
			
			if (valore) {
			  configurazione.caratteristiche[caratteristica] = valore;
			} else {
			  delete configurazione.caratteristiche[caratteristica];
			}
		  });
		},
		error: function() {
		  $('#form-configurazione').html('<p class="alert alert-danger">Errore nel caricamento delle caratteristiche. Riprova più tardi.</p>');
		}
	  });
	}
	
	// Funzione per finalizzare la configurazione
	function finalizzaConfigurazione() {
	  // Controlla se tutte le caratteristiche sono state selezionate
	  const selects = $('#form-configurazione select');
	  let tutteSelezionate = true;
	  
	  selects.each(function() {
		if (!$(this).val()) {
		  tutteSelezionate = false;
		  $(this).addClass('is-invalid');
		} else {
		  $(this).removeClass('is-invalid');
		}
	  });
	  
	  if (!tutteSelezionate) {
		alert('Seleziona tutte le caratteristiche prima di finalizzare la configurazione.');
		return;
	  }
	  
	  // Prepara i dati per la richiesta
	  const datiConfigurazione = {
		Macrocategoria: configurazione.macrocategoria,
		Modello: configurazione.modello,
		...configurazione.caratteristiche
	  };
	  
	  // Chiamata AJAX per ottenere la configurazione finale
	  $.ajax({
		url: '/get_configurazione_finale',
		method: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(datiConfigurazione),
		success: function(data) {
		  if (data.success) {
			// Aggiorna breadcrumb
			$('#configuratore-breadcrumb ol').html(`
			  <li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
			  <li class="breadcrumb-item"><a href="#" id="bread-categoria">${configurazione.macrocategoria}</a></li>
			  <li class="breadcrumb-item"><a href="#" id="bread-modello">${configurazione.modello}</a></li>
			  <li class="breadcrumb-item active">Risultato</li>
			`);
			
			// Mostra il risultato
			mostraRisultatoConfigurazione(data);
			
			// Cambia step
			cambiaStep('step-caratteristiche', 'step-risultato');
		  } else {
			alert(`Errore: ${data.messaggio}`);
		  }
		},
		error: function() {
		  alert('Errore nella finalizzazione della configurazione. Riprova più tardi.');
		}
	  });
	}
	
	// Gestione click sul breadcrumb modello
	$(document).on('click', '#bread-modello', function(e) {
	  e.preventDefault();
	  cambiaStep('step-risultato', 'step-caratteristiche');
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item"><a href="#" id="bread-home">Home</a></li>
		<li class="breadcrumb-item"><a href="#" id="bread-categoria">${configurazione.macrocategoria}</a></li>
		<li class="breadcrumb-item active">${configurazione.modello}</li>
	  `);
	});
	
	// Funzione per mostrare il risultato della configurazione
	function mostraRisultatoConfigurazione(data) {
	  const config = data.configurazione;
	  let html = '<table class="table table-striped">';
	  
	  // Aggiungi le informazioni base
	  html += `
		<tr>
		  <td>Categoria:</td>
		  <td>${config.Macrocategoria || configurazione.macrocategoria}</td>
		</tr>
		<tr>
		  <td>Modello:</td>
		  <td>${config.Modello || configurazione.modello}</td>
		</tr>
	  `;
	  
	  // Aggiungi tutte le caratteristiche
	  Object.keys(configurazione.caratteristiche).forEach(function(caratteristica) {
		html += `
		  <tr>
			<td>${caratteristica}:</td>
			<td>${configurazione.caratteristiche[caratteristica]}</td>
		  </tr>
		`;
	  });
	  
	  html += '</table>';
	  
	  // Mostra la tabella
	  $('#risultato-configurazione').html(html);
	  
	  // Mostra il codice prodotto
	  $('#codice-prodotto').text(`Codice Prodotto: ${data.codice_prodotto}`);
	}
	
	// Funzione per cambiare step
	function cambiaStep(stepAttuale, stepSuccessivo) {
	  $(`#${stepAttuale}`).addClass('fade-out');
	  
	  setTimeout(function() {
		$(`#${stepAttuale}`).hide().removeClass('fade-out');
		$(`#${stepSuccessivo}`).show();
	  }, 300);
	}
	
	// Funzione per tornare alla home
	function tornaNellaHome() {
	  // Reset delle selezioni
	  configurazione = {
		macrocategoria: '',
		modello: '',
		caratteristiche: {}
	  };
	  
	  // Aggiorna breadcrumb
	  $('#configuratore-breadcrumb ol').html(`
		<li class="breadcrumb-item active">Seleziona Categoria</li>
	  `);
	  
	  // Nascondi tutti gli step tranne il primo
	  $('.step-section').hide();
	  $('#step-macrocategoria').show();
	}
  });