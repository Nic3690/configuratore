/**
 * config.js
 * Configurazioni e mappature per il configuratore
 */

// Oggetto principale della configurazione
const configurazione = {
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
  
  // Mappature per visualizzazione
  const mappaCategorieVisualizzazione = {
	'nanoprofili': 'Nanoprofili',
	'incasso': 'Profili a Incasso',
	'sospensione': 'Profili a Sospensione',
	'plafone': 'Profili a Plafone',
	'parete': 'Profili a Parete',
	'particolari': 'Profili Particolari'
  };
  
  const mappaTipologieVisualizzazione = {
	'taglio_misura': 'Taglio su misura',
	'profilo_intero': 'Profilo intero'
  };
  
  const mappaStripLedVisualizzazione = {
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
  
  const mappaFormeTaglio = {
	'DRITTO_SEMPLICE': 'Dritto semplice',
	'FORMA_L_DX': 'Forma a L DX',
	'FORMA_L_SX': 'Forma a L SX',
	'FORMA_C': 'Forma a C',
	'FORMA_A': 'Forma a A',
	'RETTANGOLO_QUADRATO': 'Rettangolo/Quadrato'
  };
  
  const mappaFiniture = {
	'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
	'BIANCO': 'Bianco',
	'NERO': 'Nero',
	'ALLUMINIO': 'Alluminio'
  };
  
  const mappaVoltaggioVisualizzazione = {
	'24V': '24V',
	'48V': '48V',
	'220V': '220V'
  };
  
  const mappaIPVisualizzazione = {
	'IP20': 'IP20 (Interni)',
	'IP65': 'IP65 (Resistente all\'umidità)',
	'IP66': 'IP66 (Resistente all\'acqua)'
  };
  
  // Esporta gli oggetti di configurazione
  export {
	configurazione,
	mappaCategorieVisualizzazione,
	mappaTipologieVisualizzazione,
	mappaStripLedVisualizzazione,
	mappaFormeTaglio,
	mappaFiniture,
	mappaVoltaggioVisualizzazione,
	mappaIPVisualizzazione
  };