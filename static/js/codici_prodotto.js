import { configurazione } from './config.js';

/**
 * Calcola il codice prodotto per il profilo selezionato
 * @returns {string} - Codice prodotto del profilo
 */
export function calcolaCodiceProfilo() {
  // TODO: Implementare la logica per calcolare il codice del profilo
  // Basato su: configurazione.profiloSelezionato, configurazione.tipologiaSelezionata, configurazione.finituraSelezionata

  const isSabProfile = [
    "PRF016_200SET",
    "PRF011_300"
  ].includes(configurazione.profiloSelezionato);

  const isOpqProfile = [
    "PRF120_300",
    "PRF080_200"
  ].includes(configurazione.profiloSelezionato);

  const isSpecialProfile = [
    "FWPF", "MG13X12PF", "MG12X17PF", "SNK6X12PF", "SNK10X10PF", "SNK12X20PF"
  ].includes(configurazione.profiloSelezionato)

  let codiceProfilo;

  if (isSpecialProfile) 
  {
    codiceProfilo = configurazione.profiloSelezionato.replace(/_/g, '/');
  }
  else {
    let colorCode;
    if (configurazione.finituraSelezionata == "NERO") colorCode = 'BK';
    else if (configurazione.finituraSelezionata == "BIANCO") colorCode = 'WH';
    else if (configurazione.finituraSelezionata == "ALLUMINIO") colorCode = 'AL';

    if (isOpqProfile) colorCode = "M" + colorCode;
    else if (isSabProfile) colorCode = "S" + colorCode;

    codiceProfilo = configurazione.profiloSelezionato.replace(/_/g, '/') + ' ' + colorCode;
  }
  return codiceProfilo;
}
  
  /**
   * Calcola il codice prodotto per la strip LED selezionata
   * @param {string} tipologia - Tipologia di strip (COB, SMD, SPECIAL, etc.)
   * @param {string} tensione - Tensione (24V, 48V, 220V)
   * @param {string} ip - Grado IP (IP20, IP44, IP65, IP66, IP67)
   * @param {string} temperatura - Temperatura colore (3000K, 4000K, RGB, etc.)
   * @param {string} potenza - Potenza selezionata (12W/m, 14W/m, etc.)
   * @param {string} modello - Modello specifico di strip
   * @returns {string} - Codice prodotto della strip LED
   */
  export function calcolaCodiceStripLed(tipologia, tensione, ip, temperatura, potenza, modello) {
    
    // Prepara i parametri per la chiamata API
    const profiloId = configurazione.profiloSelezionato;
    const tensioneParam = configurazione.tensioneSelezionato;
    const ipParam = configurazione.ipSelezionato;
    const temperaturaParam = configurazione.temperaturaColoreSelezionata;
    const tipologiaParam = configurazione.tipologiaStripSelezionata;

    const mappaTemperaturaSuffisso = {
      '2700K': 'UWW',
      '3000K': 'WW',
      '4000K': 'NW',
      '6000K': 'CW',
      '6500K': 'CW',
      '6700K': 'CW',
      'RGB': 'RGB',
      'RGBW': 'RGB+WW',
      'CCT': 'CCT'
  };
    
    const potenzaParam = configurazione.potenzaSelezionata
        .replace(' ', '-')
        .replace('/', '_');
    
    const apiUrl = `/get_strip_led_filtrate/${profiloId}/${tensioneParam}/${ipParam}/${temperaturaParam}/${potenzaParam}/${tipologiaParam}`;
    
    let stripData = null;
    
    $.ajax({
        url: apiUrl,
        method: 'GET',
        async: false,
        success: function(response) {
            if (response.success && response.strip_led) {
                stripData = response.strip_led.find(s => s.id === configurazione.stripLedSelezionata);
            } else {
                console.error('Risposta API non valida:', response);
            }
        },
        error: function(error) {
            console.error('Errore nel caricamento dati strip:', error);
        }
    });
    
    if (!stripData) {
        console.error('stripData è null o undefined');
        return '';
    }
    
    if (!stripData.potenzeDisponibili || !stripData.codiciProdotto) {
        console.error('Arrays mancanti:', {
            potenzeDisponibili: stripData.potenzeDisponibili,
            codiciProdotto: stripData.codiciProdotto
        });
        return '';
    }
    
    if (stripData.potenzeDisponibili.length !== stripData.codiciProdotto.length) {
        console.warn('Arrays di lunghezza diversa:', {
            potenzeLength: stripData.potenzeDisponibili.length,
            codiciLength: stripData.codiciProdotto.length
        });
    }
    
    const indicePotenza = stripData.potenzeDisponibili.indexOf(configurazione.potenzaSelezionata);

    if (indicePotenza === -1) {
        for (let i = 0; i < stripData.potenzeDisponibili.length; i++) {
            if (stripData.potenzeDisponibili[i].toLowerCase().replace(/\s/g, '') === 
                configurazione.potenzaSelezionata.toLowerCase().replace(/\s/g, '')) {
                indicePotenza = i;
                break;
            }
        }
        
        if (indicePotenza === -1) {
            return '';
        }
    }
    
    let codiceCompleto = '';
    
    if (indicePotenza < stripData.codiciProdotto.length) {
        codiceCompleto = stripData.codiciProdotto[indicePotenza];
    } else {
        console.error('Indice potenza fuori range per codiciProdotto');
        return '';
    }
    
    if (!codiceCompleto) {
        console.error('Codice completo è vuoto');
        return '';
    }
    
    
    configurazione.codiceProdottoCompleto = codiceCompleto;
    
    const suffissoTemp = mappaTemperaturaSuffisso[configurazione.temperaturaColoreSelezionata]
    codiceCompleto = codiceCompleto + suffissoTemp;

    if (configurazione.potenzaSelezionata.includes('CRI90')) codiceCompleto = codiceCompleto + 'CRI90';
    if (configurazione.ipSelezionato == 'IP65' && !codiceCompleto.includes('65')) codiceCompleto = codiceCompleto + '65';
    if (configurazione.ipSelezionato == 'IP67' && !codiceCompleto.includes('67')) codiceCompleto = codiceCompleto + '67';
    if (configurazione.nomeCommercialeStripLed.includes('FROST')) codiceCompleto = codiceCompleto + 'FR';
    if (configurazione.nomeCommercialeStripLed.includes('CLEAR')) codiceCompleto = codiceCompleto + 'CL';
    if (configurazione.tensioneSelezionato == '48V') codiceCompleto = codiceCompleto + '48';
    if (configurazione.tensioneSelezionato == '220V') codiceCompleto = codiceCompleto + '220';

    return codiceCompleto;
}
  
  /**
   * Calcola il codice prodotto per l'alimentatore selezionato
   * @returns {string} - Codice prodotto dell'alimentatore
   */
  export function calcolaCodiceAlimentatore() {
	// TODO: Implementare la logica per calcolare il codice dell'alimentatore
	// Basato su: configurazione.alimentazioneSelezionata, configurazione.tipologiaAlimentatoreSelezionata, configurazione.potenzaAlimentatoreSelezionata
	return '';
  }
  
  /**
   * Calcola il codice prodotto per il dimmer selezionato
   * @returns {string} - Codice prodotto del dimmer
   */
  export function calcolaCodiceDimmer() {
	// TODO: Implementare la logica per calcolare il codice del dimmer
	// Basato su: configurazione.dimmerSelezionato
	return '';
  }
  
  /**
   * Calcola il codice prodotto completo basato su tutta la configurazione
   * @returns {object} - Oggetto con tutti i codici prodotto
   */
  export function calcolaCodiceProdottoCompleto() {
	// TODO: Implementare la logica per combinare tutti i codici

	const codici = {
	  profilo: calcolaCodiceProfilo(),
	  stripLed: calcolaCodiceStripLed(
		configurazione.tipologiaStripSelezionata,
		configurazione.tensioneSelezionato,
		configurazione.ipSelezionato,
		configurazione.temperaturaSelezionata,
		configurazione.potenzaSelezionata,
		configurazione.stripLedSelezionata
	  ),
	  alimentatore: calcolaCodiceAlimentatore(),
	  dimmer: calcolaCodiceDimmer()
	};
	
	// TODO: Combinare i codici in un formato finale
	return codici;
  }