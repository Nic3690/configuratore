from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def load_config_data():
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'static/data/configurazioni.json')
        print(f"Tentativo di caricamento del file JSON da: {json_path}")
        
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                print(f"File JSON caricato con successo: {json_path}")
                return data
        else:
            alternative_path = 'configurazione.json'
            if os.path.exists(alternative_path):
                with open(alternative_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    print(f"File JSON caricato con successo: {alternative_path}")
                    return data
            else:
                print(f"File JSON non trovato in nessun percorso")
                return {}
    except Exception as e:
        print(f"Errore nel caricamento del file JSON: {e}")
        return {}

CONFIG_DATA = load_config_data()

@app.route('/get_categorie')
def get_categorie():
    categorie = CONFIG_DATA.get('categoriePrincipali', [])
    print(f"Restituendo {len(categorie)} categorie")
    return jsonify(categorie)

@app.route('/get_profili/<categoria>')
def get_profili(categoria):
    profili = CONFIG_DATA.get('profili', [])
    
    profili_categoria = [p for p in profili if p.get('categoria') == categoria]
    
    print(f"Categoria: {categoria}, Profili trovati: {len(profili_categoria)}")
    return jsonify(profili_categoria)

@app.route('/get_opzioni_profilo/<profilo_id>')
def get_opzioni_profilo(profilo_id):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if profilo:
        return jsonify({
            'tipologie': profilo.get('tipologie', [])
        })
    else:
        print(f"Profilo non trovato: {profilo_id}")
        return jsonify({'tipologie': []})

@app.route('/get_opzioni_voltaggio/<profilo_id>')
def get_opzioni_voltaggio(profilo_id):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    stripLedCompatibili = profilo.get('stripLedCompatibili', [])
    
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    voltaggi_disponibili = set()
    for strip_id in stripLedCompatibili:
        strip_info = strip_led_data.get(strip_id, {})
        for voltaggio in strip_info.get('voltaggio', []):
            voltaggi_disponibili.add(voltaggio)
    
    return jsonify({
        'success': True,
        'voltaggi': list(voltaggi_disponibili)
    })

@app.route('/get_opzioni_ip/<profilo_id>/<voltaggio>')
def get_opzioni_ip(profilo_id, voltaggio):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    stripLedCompatibili = profilo.get('stripLedCompatibili', [])
    
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    ip_disponibili = set()
    for strip_id in stripLedCompatibili:
        strip_info = strip_led_data.get(strip_id, {})
        if voltaggio in strip_info.get('voltaggio', []):
            for ip in strip_info.get('ip', []):
                ip_disponibili.add(ip)
    
    return jsonify({
        'success': True,
        'ip': list(ip_disponibili)
    })

@app.route('/get_opzioni_temperatura_iniziale/<profilo_id>/<voltaggio>/<ip>')
def get_opzioni_temperatura_iniziale(profilo_id, voltaggio, ip):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    stripLedCompatibili = profilo.get('stripLedCompatibili', [])
    
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    temperature_disponibili = list()
    for strip_id in stripLedCompatibili:
        strip_info = strip_led_data.get(strip_id, {})
        if voltaggio in strip_info.get('voltaggio', []) and ip in strip_info.get('ip', []):
            for temp in strip_info.get('temperaturaColoreDisponibili', []):
                temperature_disponibili.append(temp)
    
    return jsonify({
        'success': True,
        'temperature': list(temperature_disponibili)
    })

@app.route('/get_strip_led_filtrate/<profilo_id>/<voltaggio>/<ip>/<temperatura>')
def get_strip_led_filtrate(profilo_id, voltaggio, ip, temperatura):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    stripLedCompatibili = profilo.get('stripLedCompatibili', [])
    
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    strip_led_filtrate = []
    
    for strip_id in stripLedCompatibili:
        strip_info = strip_led_data.get(strip_id, {})
        
        if (voltaggio in strip_info.get('voltaggio', []) and 
            ip in strip_info.get('ip', []) and 
            temperatura in strip_info.get('temperaturaColoreDisponibili', [])):
            
            strip_led_filtrate.append({
                'id': strip_id,
                'nome': strip_info.get('nome', strip_id),
                'descrizione': strip_info.get('descrizione', ''),
                'voltaggio': voltaggio,
                'ip': ip,
                'temperatura': temperatura
            })
    
    strip_led_opzionale = False
    if 'senza_strip' in stripLedCompatibili:
        strip_led_opzionale = True
    
    return jsonify({
        'success': True,
        'strip_led': strip_led_filtrate,
        'strip_led_opzionale': strip_led_opzionale
    })

'''@app.route('/get_opzioni_temperatura/<strip_id>')
def get_opzioni_temperatura(strip_id):
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    strip_info = strip_led_data.get(strip_id, {})
    
    return jsonify({
        'success': True,
        'temperature': strip_info.get('temperaturaColoreDisponibili', [])
    })'''

@app.route('/get_opzioni_potenza/<strip_id>/<temperatura>')
def get_opzioni_potenza(strip_id, temperatura):
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    strip_info = strip_led_data.get(strip_id, {})
    
    potenze_disponibili = strip_info.get('potenzeDisponibili', [])
    
    dettagli_potenze = CONFIG_DATA.get('dettagliPotenze', {})
    
    potenze_complete = []
    for potenza in potenze_disponibili:
        potenza_key = potenza
        if potenza_key not in dettagli_potenze:
            for key in dettagli_potenze:
                if key.startswith(potenza):
                    potenza_key = key
                    break
                    
        dettaglio = dettagli_potenze.get(potenza_key, {})
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

@app.route('/get_opzioni_alimentatore/<tipo_alimentazione>')
def get_opzioni_alimentatore(tipo_alimentazione):
    alimentazione_data = CONFIG_DATA.get('alimentazione', {})
    
    alimentatori_ids = alimentazione_data.get('alimentatori', {}).get(tipo_alimentazione, [])
    
    dettagli_alimentatori = CONFIG_DATA.get('dettagliAlimentatori', {})
    
    alimentatori_completi = []
    for alimentatore_id in alimentatori_ids:
        dettaglio = dettagli_alimentatori.get(alimentatore_id, {})
        if dettaglio:
            alimentatori_completi.append({
                'id': alimentatore_id,
                'nome': dettaglio.get('nome', ''),
                'descrizione': dettaglio.get('descrizione', ''),
                'potenze': dettaglio.get('potenze', [])
            })
    
    return jsonify({
        'success': True,
        'alimentatori': alimentatori_completi
    })

@app.route('/calcola_lunghezze', methods=['POST'])
def calcola_lunghezze():
    data = request.json
    dim_richiesta = data.get('lunghezzaRichiesta', 0)
    
    proposta1 = round(dim_richiesta * 0.98)
    proposta2 = round(dim_richiesta * 1.01)
    
    spazio_produzione = CONFIG_DATA.get('spazioProduzione', 5)
    
    return jsonify({
        'success': True,
        'spazioProduzione': spazio_produzione,
        'proposte': {
            'proposta1': proposta1,
            'proposta2': proposta2
        }
    })

@app.route('/finalizza_configurazione', methods=['POST'])
def finalizza_configurazione():
    configurazione = request.json
    
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
    
    profilo = configurazione.get('profiloSelezionato', '')
    strip = configurazione.get('stripLedSelezionata', '')
    temperatura = configurazione.get('temperaturaColoreSelezionata', '')
    
    codice_prodotto = profilo
    
    return jsonify({
        'success': True,
        'riepilogo': configurazione,
        'potenzaTotale': round(potenza_totale, 2),
        'codiceProdotto': codice_prodotto
    })

@app.route('/get_finiture/<profilo_id>')
def get_finiture(profilo_id):
    profili = CONFIG_DATA.get('profili', [])
    
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    finiture_disponibili = []
    if profilo:
        finiture_disponibili = profilo.get('finitureDisponibili', [])
    
    mappatura_finiture = {
        'ALLUMINIO_ANODIZZATO': 'Alluminio anodizzato',
        'BIANCO': 'Bianco',
        'NERO': 'Nero',
        'ALLUMINIO': 'Alluminio'
    }
    
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
    app.run(debug=True, host='0.0.0.0', port=5001)