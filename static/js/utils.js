import { configurazione } from './config.js';

/**
 * Aggiorna la barra di progresso in base allo step corrente effettivo
 * @param {number} step - Il numero dello step corrente
 */
export function updateProgressBar(step) {
  // Reset di tutti gli elementi della barra di progresso
  $('.step-item').removeClass('active completed');
  
  // Seleziona lo step corrente come attivo
  $(`#progress-step${step}`).addClass('active');
  
  // Imposta tutti gli step precedenti come completati
  for (let i = 1; i < step; i++) {
    $(`#progress-step${i}`).addClass('completed');
  }
  let actualStep = step;
    // Se lo step è maggiore di 5, lo riduciamo a 5 (il massimo ora è 5 invece di 6)
    if (actualStep > 5) {
      actualStep = 5;
    }
    
    // Se lo step è 6 (proposte) o 7 (riepilogo), lo trasformiamo in 5 (riepilogo)
    if (step >= 6) {
      actualStep = 5;
    }
    
    // Seleziona lo step corrente come attivo
    $(`#progress-step${actualStep}`).addClass('active');
    
    // Imposta tutti gli step precedenti come completati
    for (let i = 1; i < actualStep; i++) {
      $(`#progress-step${i}`).addClass('completed');
    }
    
    // Debug per verificare quale step viene aggiornato
    console.log(`Aggiornamento barra di progresso: step originale ${step}, step effettivo ${actualStep}`);
}

/**
 * Formatta la temperatura per la visualizzazione
 * @param {string} temperatura - Valore della temperatura
 * @returns {string} - Temperatura formattata
 */
export function formatTemperatura(temperatura) {
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

/**
 * Restituisce il colore per la rappresentazione della temperatura
 * @param {string} temperatura - Valore della temperatura
 * @returns {string} - Codice colore o gradiente CSS
 */
export function getTemperaturaColor(temperatura) {
  switch(temperatura) {
    case '2700K':
      return '#FFE9C0';
    case '3000K':
      return '#FFF1D9';
    case '4000K':
      return '#FFFBE3';
    case '6000K':
    case '6500K':
    case '6700K':
      return '#F5FBFF';
    case 'CCT':
      return 'linear-gradient(to right, #FFE9C0, #F5FBFF)';
    case 'RGB':
      return 'linear-gradient(to right, red, green, blue)';
    case 'RGBW':
      return 'linear-gradient(to right, red, green, blue, white)';
    case 'ROSSO':
      return 'red';
    case 'VERDE':
      return 'green';
    case 'BLU':
      return 'blue';
    case 'AMBRA':
      return '#FFBF00';
    case 'PINK':
      return 'pink';
    default:
      return '#FFFFFF';
  }
}

/**
 * Controlla se lo step 2 è completo
 */
export function checkStep2Completion() {
  if (configurazione.profiloSelezionato && configurazione.tipologiaSelezionata) {
    $('#btn-continua-step2').prop('disabled', false);
  } else {
    $('#btn-continua-step2').prop('disabled', true);
  }
}

/**
 * Controlla se la sezione parametri è completa
 */
export function checkParametriCompletion() {
  if (configurazione.tensioneSelezionato && configurazione.ipSelezionato && configurazione.temperaturaSelezionata) {
    $('#btn-continua-parametri').prop('disabled', false);
  } else {
    $('#btn-continua-parametri').prop('disabled', true);
  }
}

/**
 * Controlla se lo step 5 è completo
 */
export function checkStep5Completion() {
  let isComplete = true;
  
  if (!configurazione.dimmerSelezionato) {
    isComplete = false;
  }
  
  if (!configurazione.tipoAlimentazioneCavo) {
    isComplete = false;
  }
  
  // Non verifichiamo più l'uscita cavo perché ora ha un valore predefinito
  // Il controllo precedente era:
  // if (!configurazione.uscitaCavoSelezionata) {
  //   isComplete = false;
  // }
  
  $('#btn-continua-step5').prop('disabled', !isComplete);
  return isComplete;
}

/**
 * Controlla se lo step 6 è completo
 */
export function checkStep6Completion() {
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

export function checkPersonalizzazioneCompletion() {
  let isComplete = true;
  
  // Per il profilo intero, impostiamo automaticamente i valori necessari
  if (configurazione.tipologiaSelezionata === 'profilo_intero') {
    // Imposta automaticamente la forma di taglio a DRITTO_SEMPLICE se non è già impostata
    if (!configurazione.formaDiTaglioSelezionata) {
      configurazione.formaDiTaglioSelezionata = 'DRITTO_SEMPLICE';
    }
    
    // Verifica solo che ci sia una finitura selezionata
    if (!configurazione.finituraSelezionata) {
      isComplete = false;
    }
    
    // Assicura che la lunghezza sia impostata (usando la lunghezza massima del profilo)
    if (!configurazione.lunghezzaRichiesta && configurazione.lunghezzaMassimaProfilo) {
      configurazione.lunghezzaRichiesta = configurazione.lunghezzaMassimaProfilo;
    }
    
    // Debug
    console.log("Profilo intero - Validazione:", {
      formaDiTaglio: configurazione.formaDiTaglioSelezionata,
      finitura: configurazione.finituraSelezionata,
      lunghezza: configurazione.lunghezzaRichiesta,
      isComplete: isComplete
    });
  } else {
    // Per il taglio su misura, controlliamo tutto
    if (!configurazione.formaDiTaglioSelezionata) {
      isComplete = false;
    }
    
    if (!configurazione.finituraSelezionata) {
      isComplete = false;
    }
    
    // Controlli specifici per il taglio su misura
    if (configurazione.tipologiaSelezionata === 'taglio_misura') {
      // Per il taglio dritto semplice, controlliamo solo lunghezzaRichiesta
      if (configurazione.formaDiTaglioSelezionata === 'DRITTO_SEMPLICE') {
        if (!configurazione.lunghezzaRichiesta) {
          isComplete = false;
        }
      } 
      // Per le altre forme, controlliamo che tutte le lunghezze multiple siano inserite
      else if (configurazione.lunghezzeMultiple) {
        const forma = configurazione.formaDiTaglioSelezionata;
        const numLatiRichiesti = {
          'FORMA_L_DX': 2,
          'FORMA_L_SX': 2,
          'FORMA_C': 3,
          'RETTANGOLO_QUADRATO': 2
        }[forma] || 0;
        
        // Conta quanti lati hanno un valore valido
        const latiValidi = Object.values(configurazione.lunghezzeMultiple)
          .filter(val => val && val > 0).length;
        
        if (latiValidi < numLatiRichiesti) {
          isComplete = false;
        }
      } else {
        isComplete = false;
      }
    }
  }
  
  // Abilita o disabilita il pulsante in base al risultato della validazione
  $('#btn-continua-personalizzazione').prop('disabled', !isComplete);
  return isComplete;
}
