const configurazione = {
	categoriaSelezionata: null,
	profiloSelezionato: null,
	tipologiaSelezionata: null,
	tipologiaStripSelezionata: null,
 	specialStripSelezionata: null, 
	tensioneSelezionato: null,
	ipSelezionato: null,
	temperaturaSelezionata: null,
	stripLedSelezionata: null,
	temperaturaColoreSelezionata: null,
	potenzaSelezionata: null,
	alimentazioneSelezionata: null,
	tipologiaAlimentatoreSelezionata: null,
	dimmerSelezionato: null,
	tipoAlimentazioneCavo: null,
	lunghezzaCavoIngresso: null,
	lunghezzaCavoUscita: null,
	uscitaCavoSelezionata: null,
	formaDiTaglioSelezionata: null,
	finituraSelezionata: null,
	lunghezzaRichiesta: null,
	lunghezzeMultiple: {},
	proposta1: null,
	proposta2: null,
	codiceModello: null,
	nomeModello: null
  };

  const mappaCategorieVisualizzazione = {
	'nanoprofili': 'Nanoprofili',
	'incasso': 'Profili a Incasso',
	'sospensione': 'Profili a Sospensione',
	'plafone': 'Profili a Plafone',
	'parete': 'Profili a Parete',
	'particolari': 'Profili Particolari',
	'scalino': 'Profili a Scalino',
	'wall_washer': 'Profili Wallwasher',
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
	'RETTANGOLO_QUADRATO': 'Rettangolo/Quadrato'
  };
  
  const mappaFiniture = {
	'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
	'BIANCO': 'Bianco',
	'NERO': 'Nero',
	'ALLUMINIO': 'Alluminio'
  };
  
  const mappaTensioneVisualizzazione = {
	'24V': '24V',
	'48V': '48V',
	'220V': '220V'
  };
  
  const mappaIPVisualizzazione = {
	'IP20': 'IP20 (Interni)',
	'IP65': 'IP65 (Resistente all\'umidità)',
	'IP66': 'IP66 (Resistente all\'acqua)'
  };

  const mappaTipologiaStripVisualizzazione = {
	'COB': 'COB (Chip On Board)',
	'SMD': 'SMD (Surface Mount Device)',
	'SPECIAL': 'Special Strip'
  };

  const mappaSpecialStripVisualizzazione = {
	'XFLEX': 'XFLEX',
	'RUNNING': 'RUNNING',
	'ZIG_ZAG': 'ZIG ZAG',
	'XNAKE': 'XNAKE',
	'XMAGIS': 'XMAGIS'
  };

  export {
	configurazione,
	mappaCategorieVisualizzazione,
	mappaTipologieVisualizzazione,
	mappaStripLedVisualizzazione,
	mappaFormeTaglio,
	mappaFiniture,
	mappaTensioneVisualizzazione,
	mappaIPVisualizzazione,
	mappaTipologiaStripVisualizzazione,
	mappaSpecialStripVisualizzazione
  };