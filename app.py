from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# Rotta principale che mostra la pagina del configuratore
@app.route('/')
def index():
    return render_template('index.html')

# Funzione per caricare dati da file JSON (se necessario)
def load_config_data():
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'static/data/configurazione.json')
        with open(json_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except Exception as e:
        print(f"Errore nel caricamento del file JSON: {e}")
        return {}

# Restituisce tutte le categorie principali
@app.route('/get_categorie')
def get_categorie():
    # Dati di esempio per le categorie
    categorie = [
        {
            "id": "nanoprofili",
            "nome": "Nanoprofili",
            "immagine": "/static/img/categorie/nanoprofili.jpg",
            "sottofamiglie": ["nanoprofili"]
        },
        {
            "id": "incasso",
            "nome": "Incasso",
            "immagine": "/static/img/categorie/incasso.jpg", 
            "sottofamiglie": ["incasso", "wallwasher", "battiscopa", "scalini"]
        },
        {
            "id": "sospensione",
            "nome": "Sospensione",
            "immagine": "/static/img/categorie/sospensione.jpg",
            "sottofamiglie": ["kit_sospensione"]
        },
        {
            "id": "plafone",
            "nome": "Plafone",
            "immagine": "/static/img/categorie/plafone.jpg",
            "sottofamiglie": ["superficie", "gancio_fissaggio_soffitto_parete"]
        },
        {
            "id": "parete",
            "nome": "Parete",
            "immagine": "/static/img/categorie/parete.jpg",
            "sottofamiglie": ["gancio_fissaggio_parete_soffitto"]
        },
        {
            "id": "particolari",
            "nome": "Particolari",
            "immagine": "/static/img/categorie/particolari.jpg",
            "sottofamiglie": ["nanoprofili"]
        }
    ]
    
    return jsonify(categorie)

# Restituisce tutti i profili di una categoria
@app.route('/get_profili/<categoria>')
def get_profili(categoria):
    # Dati di esempio per i profili
    profili_debug = {
        'nanoprofili': [
            {
                'id': 'profilo_nano_1',
                'nome': 'Nano Profilo A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo in alluminio di piccole dimensioni'
            },
            {
                'id': 'profilo_nano_2',
                'nome': 'Nano Profilo B',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo compatto per illuminazione d\'accento'
            }
        ],
        'incasso': [
            {
                'id': 'profilo_incasso_1',
                'nome': 'Profilo da Incasso A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo da incasso per cartongesso'
            },
            {
                'id': 'profilo_incasso_2',
                'nome': 'Profilo Wall Washer',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo wall washer per illuminazione di pareti'
            }
        ],
        'sospensione': [
            {
                'id': 'profilo_sospensione_1',
                'nome': 'Profilo Sospeso A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo per sospensione con kit di montaggio'
            }
        ],
        'plafone': [
            {
                'id': 'profilo_plafone_1',
                'nome': 'Profilo a Plafone A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo per montaggio a soffitto'
            }
        ],
        'parete': [
            {
                'id': 'profilo_parete_1',
                'nome': 'Profilo a Parete A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo per montaggio a parete'
            }
        ],
        'particolari': [
            {
                'id': 'profilo_part_1',
                'nome': 'Profilo Particolare A',
                'immagine': '/static/img/placeholder.jpg',
                'descrizione': 'Profilo speciale per applicazioni particolari'
            }
        ]
    }
    
    # Restituisci i profili per la categoria selezionata
    return jsonify(profili_debug.get(categoria, []))

# Restituisce le opzioni per un profilo specifico
@app.route('/get_opzioni_profilo/<profilo_id>')
def get_opzioni_profilo(profilo_id):
    # Dati di esempio per le opzioni del profilo
    opzioni_profili = {
        'profilo_nano_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_SMD_IP66']
        },
        'profilo_nano_2': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20']
        },
        'profilo_incasso_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_SMD_IP66', 'STRIP_24V_COB_IP20', 'STRIP_24V_RGB_SMD_IP20']
        },
        'profilo_incasso_2': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20', 'STRIP_24V_RGB_SMD_IP20']
        },
        'profilo_sospensione_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20', 'STRIP_48V_SMD_IP20']
        },
        'profilo_plafone_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20']
        },
        'profilo_parete_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20']
        },
        'profilo_part_1': {
            'tipologie': ['taglio_misura', 'profilo_intero'],
            'strip_led': ['senza_strip', 'STRIP_24V_SMD_IP20', 'STRIP_24V_COB_IP20']
        }
    }
    
    # Restituisci le opzioni per il profilo specificato o un oggetto vuoto se non trovato
    return jsonify(opzioni_profili.get(profilo_id, {'tipologie': [], 'strip_led': []}))

# Restituisce le opzioni di temperatura colore per una strip LED
@app.route('/get_opzioni_temperatura/<strip_id>')
def get_opzioni_temperatura(strip_id):
    # Dati di esempio per le opzioni di temperatura
    temperature = {
        'STRIP_24V_SMD_IP20': ['2700K', '3000K', '6500K'],
        'STRIP_24V_SMD_IP66': ['2700K', '3000K', '6500K'],
        'STRIP_24V_COB_IP20': ['2700K', '3000K', '6500K', 'CCT'],
        'STRIP_24V_COB_IP66': ['2700K', '3000K', '6500K', 'CCT'],
        'STRIP_48V_SMD_IP20': ['2700K', '3000K', '6500K'],
        'STRIP_48V_SMD_IP66': ['2700K', '3000K', '6500K'],
        'STRIP_24V_RGB_SMD_IP20': ['RGB'],
        'STRIP_24V_RGB_SMD_IP66': ['RGB'],
        'STRIP_24V_RGB_COB_IP20': ['RGB'],
        'STRIP_24V_RGB_COB_IP66': ['RGB'],
        'STRIP_220V_COB_IP20': ['2700K', '3000K', '6500K'],
        'STRIP_220V_COB_IP66': ['2700K', '3000K', '6500K']
    }
    
    return jsonify({
        'success': True,
        'temperature': temperature.get(strip_id, [])
    })

# Restituisce le opzioni di potenza per una combinazione di strip LED e temperatura
@app.route('/get_opzioni_potenza/<strip_id>/<temperatura>')
def get_opzioni_potenza(strip_id, temperatura):
    # Dati di esempio per le opzioni di potenza
    potenze = {
        'STRIP_24V_SMD_IP20': {
            '2700K': ['6W/m', '12W/m', '18W/m', '22W/m'],
            '3000K': ['6W/m', '12W/m', '18W/m', '22W/m'],
            '6500K': ['6W/m', '12W/m', '18W/m', '22W/m']
        },
        'STRIP_24V_SMD_IP66': {
            '2700K': ['6W/m', '12W/m', '18W/m'],
            '3000K': ['6W/m', '12W/m', '18W/m'],
            '6500K': ['6W/m', '12W/m', '18W/m']
        },
        'STRIP_24V_COB_IP20': {
            '2700K': ['12W/m', '18W/m'],
            '3000K': ['12W/m', '18W/m'],
            '6500K': ['12W/m', '18W/m'],
            'CCT': ['12W/m', '18W/m']
        },
        'STRIP_24V_RGB_SMD_IP20': {
            'RGB': ['12W/m']
        }
    }
    
    # Ottieni le potenze disponibili per la strip LED e temperatura specificata
    strip_potenze = potenze.get(strip_id, {})
    potenze_disponibili = strip_potenze.get(temperatura, [])
    
    # Dettagli per ogni potenza
    dettagli_potenze = {
        '6W/m': {
            'codice': 'RB26420WW',
            'specifiche': '24V DC · 6W/m · 64 LED/m · 768lm/m · CRI80'
        },
        '12W/m': {
            'codice': 'RB12820WW',
            'specifiche': '24V DC · 12W/m · 128 LED/m · 1480lm/m· CRI80'
        },
        '12W/m_CRI90': {
            'codice': 'RB12820WWCRI90',
            'specifiche': '24V DC · 12W/m · 128 LED/m · 1440lm/m· CRI90'
        },
        '18W/m': {
            'codice': 'RB219220WW',
            'specifiche': '24V DC · 18W/m · 192 LED/m · 2304lm/m· CRI80'
        },
        '18W/m_CRI90': {
            'codice': 'RB219220WWCRI90',
            'specifiche': '24V DC · 18W/m · 192 LED/m · 2246lm/m· CRI90'
        },
        '22W/m': {
            'codice': 'RB224020WW',
            'specifiche': '24V DC · 22W/m · 240 LED/m · 2746lm/m· CRI80'
        },
        '14.4W/m': {
            'codice': 'RB27265ZWW',
            'specifiche': '24V DC · 14,4W/m · 72 LED/m · 1460lm/m· CRI80'
        }
    }
    
    # Costruisci le informazioni complete per ogni potenza disponibile
    potenze_complete = []
    for potenza in potenze_disponibili:
        dettaglio = dettagli_potenze.get(potenza, {})
        potenze_complete.append({
            'id': potenza,
            'nome': potenza,
            'codice': dettaglio.get('codice', ''),
            'specifiche': dettaglio.get('specifiche', '')
        })
    
    return jsonify({
        'success': True,
        'potenze': potenze_complete
    })

# Restituisce le opzioni di alimentatore per un tipo di alimentazione
@app.route('/get_opzioni_alimentatore/<tipo_alimentazione>')
def get_opzioni_alimentatore(tipo_alimentazione):
    # Dati di esempio per gli alimentatori
    alimentatori = {
        'ON/OFF': [
            {
                'id': 'SERIE_AT24',
                'nome': 'SERIE AT24',
                'descrizione': 'Carcassa in lamiera forata di acciaio zincato, per assicurare una corretta ventilazione.',
                'potenze': [30, 60, 100, 150, 200, 320]
            },
            {
                'id': 'SERIE_ATN24',
                'nome': 'SERIE ATN24',
                'descrizione': 'Scatola in allumino anodizzato, con profili laterali in alluminio estruso per garantire il raffreddamento.',
                'potenze': [30, 60, 100, 150, 200]
            },
            {
                'id': 'SERIE_ATS',
                'nome': 'SERIE ATS',
                'descrizione': 'Alimentatore in tensione costante 24V, forma slim, per interni (IP20). Carcassa in policarbonato bianco.',
                'potenze': [30, 60, 100]
            },
            {
                'id': 'SERIE_ATUS',
                'nome': 'SERIE ATUS',
                'descrizione': 'Alimentatore in tensione costante 24V, forma ultra slim, per interni (IP20). Carcassa in policarbonato bianco.',
                'potenze': [30, 60, 100]
            },
            {
                'id': 'SERIE_ATSIP44',
                'nome': 'SERIE ATSIP44',
                'descrizione': 'Alimentatore in tensione costante 24V, forma stretta, per installazione in interno (IP44). Scatola e coperchi per i contatti elettrici in policarbonato.',
                'potenze': [60, 100, 150]
            }
        ],
        'DIMMERABILE_TRIAC': [
            {
                'id': 'SERIE_ATD24',
                'nome': 'SERIE ATD24',
                'descrizione': 'Alimentatore dimmerabile TRIAC, in tensione costante 24V DC, per installazione in interno (IP20).',
                'potenze': [60, 100, 150, 200]
            }
        ]
    }
    
    return jsonify({
        'success': True,
        'alimentatori': alimentatori.get(tipo_alimentazione, [])
    })

# Calcola le proposte di lunghezza standard
@app.route('/calcola_lunghezze', methods=['POST'])
def calcola_lunghezze():
    data = request.json
    dim_richiesta = data.get('lunghezzaRichiesta', 0)
    
    # Calcolo delle proposte (esempio semplificato)
    proposta1 = round(dim_richiesta * 0.98)
    proposta2 = round(dim_richiesta * 1.01)
    
    # Spazio necessario per la produzione (tappi e saldatura)
    spazio_produzione = 5
    
    return jsonify({
        'success': True,
        'spazioProduzione': spazio_produzione,
        'proposte': {
            'proposta1': proposta1,
            'proposta2': proposta2
        }
    })

# Finalizza la configurazione e restituisce il riepilogo
@app.route('/finalizza_configurazione', methods=['POST'])
def finalizza_configurazione():
    configurazione = request.json
    
    # Calcolo potenza totale
    potenza_per_metro = 0
    if 'potenzaSelezionata' in configurazione and configurazione['potenzaSelezionata']:
        potenza_str = configurazione['potenzaSelezionata'].split('W/m')[0]
        try:
            potenza_per_metro = float(potenza_str)
        except ValueError:
            potenza_per_metro = 0
    
    lunghezza_in_metri = 0
    if 'lunghezzaRichiesta' in configurazione and configurazione['lunghezzaRichiesta']:
        try:
            lunghezza_in_metri = float(configurazione['lunghezzaRichiesta']) / 1000
        except ValueError:
            lunghezza_in_metri = 0
    
    potenza_totale = potenza_per_metro * lunghezza_in_metri
    
    # Generazione codice prodotto
    profilo = configurazione.get('profiloSelezionato', '')
    strip = configurazione.get('stripLedSelezionata', '')
    temperatura = configurazione.get('temperaturaColoreSelezionata', '')
    
    codice_prodotto = f"PRF-{profilo}-{strip}-{temperatura}".replace(' ', '')
    
    return jsonify({
        'success': True,
        'riepilogo': configurazione,
        'potenzaTotale': round(potenza_totale, 2),
        'codiceProdotto': codice_prodotto
    })

# Restituisce le finiture disponibili per un profilo
@app.route('/get_finiture/<profilo_id>')
def get_finiture(profilo_id):
    # Dati di esempio per le finiture
    finiture_profili = {
        'profilo_nano_1': ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO'],
        'profilo_nano_2': ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO', 'ALLUMINIO'],
        'profilo_incasso_1': ['ALLUMINIO_ANODIZZATO', 'BIANCO'],
        'profilo_incasso_2': ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO'],
        'profilo_sospensione_1': ['ALLUMINIO_ANODIZZATO', 'NERO'],
        'profilo_plafone_1': ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO'],
        'profilo_parete_1': ['ALLUMINIO_ANODIZZATO', 'BIANCO'],
        'profilo_part_1': ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO', 'ALLUMINIO']
    }
    
    # Mappatura delle finiture per il frontend
    mappatura_finiture = {
        'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
        'BIANCO': 'Bianco',
        'NERO': 'Nero',
        'ALLUMINIO': 'Alluminio'
    }
    
    # Ottieni le finiture disponibili per il profilo specificato
    finiture_disponibili = finiture_profili.get(profilo_id, ['ALLUMINIO_ANODIZZATO', 'BIANCO', 'NERO'])
    
    # Formatta le finiture con le loro descrizioni
    finiture_formattate = [
        {
            'id': finitura,
            'nome': mappatura_finiture.get(finitura, finitura)
        }
        for finitura in finiture_disponibili
    ]
    
    return jsonify({
        'success': True,
        'finiture': finiture_formattate
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Usa la porta 5001 invece di 5000