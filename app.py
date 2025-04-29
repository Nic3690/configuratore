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
    
    # Ottieni i profili per categoria o per categoria alternativa
    profili_categoria = []
    for p in profili:
        if p.get('categoria') == categoria or (isinstance(p.get('categorie'), list) and categoria in p.get('categorie', [])):
            # Aggiungiamo informazioni sui nomi commerciali delle strip LED compatibili
            profilo = p.copy()
            strip_compatibili_info = []
            for strip_id in p.get('stripLedCompatibili', []):
                strip_info = CONFIG_DATA.get('stripLed', {}).get(strip_id, {})
                if strip_info:
                    strip_compatibili_info.append({
                        'id': strip_id,
                        'nomeCommerciale': strip_info.get('nomeCommerciale', '')
                    })
            profilo['stripLedCompatibiliInfo'] = strip_compatibili_info
            profili_categoria.append(profilo)
    
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

@app.route('/get_opzioni_tensione/<profilo_id>')
@app.route('/get_opzioni_tensione/<profilo_id>/<tipologia_strip>')
def get_opzioni_tensione(profilo_id, tipologia_strip=None):
    profili = CONFIG_DATA.get('profili', [])
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})

    # Ottieni le strip LED compatibili con questo profilo
    strip_led_compatibili = profilo.get('stripLedCompatibili', [])
    strip_led_data = CONFIG_DATA.get('stripLed', {})

    
    voltaggi_disponibili = set()
    for strip_id in strip_led_compatibili:
        strip_info = strip_led_data.get(strip_id, {})
        # Filtra in base alla tipologia selezionata
        if tipologia_strip:
            if tipologia_strip == 'COB' and 'COB' not in strip_id:
                continue
            elif tipologia_strip == 'SMD' and 'SMD' not in strip_id:
                continue
            elif tipologia_strip == 'SPECIAL':
                # Per SPECIAL, definisci qui la logica di filtro specifica
                strip_info = strip_led_data.get(strip_id, {})
                if strip_info.get('tipo') != 'SPECIAL':
                    continue
            
        tensione = strip_info.get('tensione')
        if tensione:
            voltaggi_disponibili.add(tensione)
    
    return jsonify({
        'success': True,
        'voltaggi': list(voltaggi_disponibili)
    })

@app.route('/get_opzioni_ip/<profilo_id>/<tensione>')
@app.route('/get_opzioni_ip/<profilo_id>/<tensione>/<tipologia_strip>')
def get_opzioni_ip(profilo_id, tensione, tipologia_strip=None):
    profili = CONFIG_DATA.get('profili', [])
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    strip_led_compatibili = profilo.get('stripLedCompatibili', [])
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    ip_disponibili = set()
    for strip_id in strip_led_compatibili:
        strip_info = strip_led_data.get(strip_id, {})
        
        # Filtra in base alla tipologia selezionata
        if tipologia_strip:
            if tipologia_strip == 'COB' and 'COB' not in strip_id:
                continue
            elif tipologia_strip == 'SMD' and 'SMD' not in strip_id:
                continue
            elif tipologia_strip == 'SPECIAL':
                strip_info = strip_led_data.get(strip_id, {})
                if strip_info.get('tipo') != 'SPECIAL':
                    continue
                
        if strip_info.get('tensione') == tensione:
            ip = strip_info.get('ip')
            if ip:
                ip_disponibili.add(ip)
    
    return jsonify({
        'success': True,
        'ip': list(ip_disponibili)
    })

@app.route('/get_opzioni_temperatura_iniziale/<profilo_id>/<tensione>/<ip>')
@app.route('/get_opzioni_temperatura_iniziale/<profilo_id>/<tensione>/<ip>/<tipologia_strip>')
def get_opzioni_temperatura_iniziale(profilo_id, tensione, ip, tipologia_strip=None):
    profili = CONFIG_DATA.get('profili', [])
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    strip_led_compatibili = profilo.get('stripLedCompatibili', [])
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    temperature_disponibili = set()
    for strip_id in strip_led_compatibili:
        strip_info = strip_led_data.get(strip_id, {})
        
        # Filtra in base alla tipologia selezionata
        if tipologia_strip:
            if tipologia_strip == 'COB' and 'COB' not in strip_id:
                continue
            elif tipologia_strip == 'SMD' and 'SMD' not in strip_id:
                continue
            elif tipologia_strip == 'SPECIAL':
                strip_info = strip_led_data.get(strip_id, {})
                if strip_info.get('tipo') != 'SPECIAL':
                    continue
                
        if strip_info.get('tensione') == tensione and strip_info.get('ip') == ip:
            temperature_disponibili.update(strip_info.get('temperaturaColoreDisponibili', []))
    
    return jsonify({
        'success': True,
        'temperature': list(temperature_disponibili)
    })

@app.route('/get_dimmer_compatibili/<strip_id>')
def get_dimmer_compatibili(strip_id):
    dimmerazione = CONFIG_DATA.get('dimmerazione', {})
    compatibilita = dimmerazione.get('compatibilitaDimmer', {})
    
    dimmer_compatibili = []
    for dimmer, strip_compatibili in compatibilita.items():
        if strip_id in strip_compatibili:
            dimmer_compatibili.append(dimmer)
    
    return jsonify({
        'success': True,
        'dimmer_compatibili': dimmer_compatibili
    })

# Endpoint per ottenere i dimmer compatibili con una determinata strip LED
@app.route('/get_opzioni_dimmerazione/<strip_id>')
def get_opzioni_dimmerazione(strip_id):
    dimmerazione = CONFIG_DATA.get('dimmerazione', {})
    opzioni_base = dimmerazione.get('opzioni', [])
    
    # Ottieni la lista di dimmer compatibili con questa strip
    compatibilita = dimmerazione.get('compatibilitaDimmer', {})
    
    # Cerchiamo il nome commerciale della strip selezionata
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    strip_info = strip_led_data.get(strip_id, {})
    nome_commerciale = strip_info.get('nomeCommerciale', '')
    
    dimmer_compatibili = []
    
    # Se abbiamo un nome commerciale, cerchiamo i dimmer compatibili
    if nome_commerciale:
        for dimmer, strip_compatibili in compatibilita.items():
            if nome_commerciale in strip_compatibili:
                dimmer_compatibili.append(dimmer)
    
    # Se non ci sono dimmer compatibili trovati tramite nome commerciale, 
    # proviamo con l'ID della strip direttamente
    if not dimmer_compatibili:
        for dimmer, strip_compatibili in compatibilita.items():
            if strip_id in strip_compatibili:
                dimmer_compatibili.append(dimmer)
    
    # Se non ci sono dimmer compatibili, include solo l'opzione NESSUN_DIMMER
    if not dimmer_compatibili and "NESSUN_DIMMER" in opzioni_base:
        opzioni_filtrate = ["NESSUN_DIMMER"]
    else:
        # Altrimenti include tutti i dimmer compatibili più NESSUN_DIMMER
        opzioni_filtrate = dimmer_compatibili.copy()
        if "NESSUN_DIMMER" in opzioni_base and "NESSUN_DIMMER" not in opzioni_filtrate:
            opzioni_filtrate.append("NESSUN_DIMMER")
    
    # Ottieni i codici dei dimmer
    codici_dimmer = {}
    for dimmer in opzioni_filtrate:
        codice = dimmerazione.get('codiciDimmer', {}).get(dimmer, "")
        if codice:
            codici_dimmer[dimmer] = codice
    
    # Ottieni i nomi dei dimmer
    nomi_dimmer = {}
    for dimmer in opzioni_filtrate:
        nome = dimmerazione.get('nomeDimmer', {}).get(dimmer, "")
        if nome:
            nomi_dimmer[dimmer] = nome
    
    return jsonify({
        'success': True,
        'opzioni': opzioni_filtrate,
        'spaziNonIlluminati': dimmerazione.get('spaziNonIlluminati', {}),
        'codiciDimmer': codici_dimmer,
        'nomiDimmer': nomi_dimmer
    })

@app.route('/get_opzioni_potenza/<profilo_id>/<tensione>/<ip>/<temperatura>')
@app.route('/get_opzioni_potenza/<profilo_id>/<tensione>/<ip>/<temperatura>/<tipologia_strip>')
def get_opzioni_potenza(profilo_id, tensione, ip, temperatura, tipologia_strip=None):
    profili = CONFIG_DATA.get('profili', [])
    profilo = next((p for p in profili if p.get('id') == profilo_id), None)
    
    if not profilo:
        return jsonify({'success': False, 'message': 'Profilo non trovato'})
    
    strip_led_compatibili = profilo.get('stripLedCompatibili', [])
    strip_led_data = CONFIG_DATA.get('stripLed', {})
    
    tutte_potenze_disponibili = set()
    
    for strip_id in strip_led_compatibili:
        strip_info = strip_led_data.get(strip_id, {})
        
        # Filtra in base alla tipologia selezionata
        if tipologia_strip:
            if tipologia_strip == 'COB' and 'COB' not in strip_id:
                continue
            elif tipologia_strip == 'SMD' and 'SMD' not in strip_id:
                continue
            elif tipologia_strip == 'SPECIAL':
                strip_info = strip_led_data.get(strip_id, {})
                if strip_info.get('tipo') != 'SPECIAL':
                    continue
        
        # Verifica se la strip soddisfa i parametri selezionati
        if (strip_info.get('tensione') == tensione and 
            strip_info.get('ip') == ip and 
            temperatura in strip_info.get('temperaturaColoreDisponibili', [])):
            tutte_potenze_disponibili.update(strip_info.get('potenzeDisponibili', []))
    
    if not tutte_potenze_disponibili:
        return jsonify({'success': False, 'message': 'Nessuna potenza disponibile per i parametri selezionati'})
    
    potenze_disponibili_list = list(tutte_potenze_disponibili)
    dettagli_potenze = CONFIG_DATA.get('dettagliPotenze', {})
    
    potenze_complete = []
    for potenza in potenze_disponibili_list:
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


@app.route('/get_strip_led_filtrate/<profilo_id>/<tensione>/<ip>/<temperatura>/<potenza>')
@app.route('/get_strip_led_filtrate/<profilo_id>/<tensione>/<ip>/<temperatura>/<potenza>/<tipologia_strip>')
def get_strip_led_filtrate(profilo_id, tensione, ip, temperatura, potenza, tipologia_strip = None):
    try:
        print(f"Chiamata a get_strip_led_filtrate con: {profilo_id}, {tensione}, {ip}, {temperatura}, {potenza}")
        
        # Decodifica il parametro potenza (in caso sia codificato)
        potenza = potenza.replace('-', ' ')
        potenza = potenza.replace('_', '/')

        print(potenza)
        
        profili = CONFIG_DATA.get('profili', [])
        profilo = next((p for p in profili if p.get('id') == profilo_id), None)
        
        if not profilo:
            return jsonify({'success': False, 'message': 'Profilo non trovato'})
        
        # Ottieni le strip LED compatibili con questo profilo
        strip_led_compatibili = profilo.get('stripLedCompatibili', [])
        strip_led_data = CONFIG_DATA.get('stripLed', {})
        
        strip_led_filtrate = []
        for strip_id in strip_led_compatibili:
            strip_info = strip_led_data.get(strip_id, {})
            
            if tipologia_strip:
                if tipologia_strip == 'COB' and 'COB' not in strip_id:
                    continue
                elif tipologia_strip == 'SMD' and 'SMD' not in strip_id:
                    continue
                elif tipologia_strip == 'SPECIAL':
                    strip_info = strip_led_data.get(strip_id, {})
                    if strip_info.get('tipo') != 'SPECIAL':
                        continue

            # Verifica la compatibilità con tutti i parametri
            if (strip_info.get('tensione') == tensione and 
                strip_info.get('ip') == ip and 
                temperatura in strip_info.get('temperaturaColoreDisponibili', []) and
                potenza in strip_info.get('potenzeDisponibili', [])):
                
                strip_led_filtrate.append({
                    'id': strip_id,
                    'nome': strip_info.get('nome', strip_id),
                    'nomeCommerciale': strip_info.get('nomeCommerciale', ''),
                    'descrizione': strip_info.get('descrizione', ''),
                    'tensione': tensione,
                    'ip': ip,
                    'temperatura': temperatura,
                    'codiciProdotto': strip_info.get('codiciProdotto', [])
                })
        
        return jsonify({
            'success': True,
            'strip_led': strip_led_filtrate
        })
    except Exception as e:
        print(f"Errore in get_strip_led_filtrate: {e}")
        return jsonify({'success': False, 'message': f'Errore: {str(e)}'})

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

@app.route('/get_potenze_alimentatore/<alimentatore_id>')
def get_potenze_alimentatore(alimentatore_id):
    """
    Restituisce le potenze disponibili per l'alimentatore selezionato
    """
    dettagli_alimentatori = CONFIG_DATA.get('dettagliAlimentatori', {})
    alimentatore = dettagli_alimentatori.get(alimentatore_id, {})
    
    if not alimentatore:
        return jsonify({
            'success': False,
            'message': f'Alimentatore non trovato: {alimentatore_id}'
        })
    
    potenze = alimentatore.get('potenze', [])
    
    return jsonify({
        'success': True,
        'potenze': potenze
    })

@app.route('/calcola_potenza_alimentatore', methods=['POST'])
def calcola_potenza_alimentatore():
    data = request.json
    potenza_per_metro = data.get('potenzaPerMetro', 0)
    lunghezza_metri = data.get('lunghezzaMetri', 0)
    
    # Calcola la potenza totale con un margine di sicurezza del 20%
    potenza_totale = potenza_per_metro * lunghezza_metri * 1.2
    
    # Trova la potenza standard di alimentatore immediatamente superiore
    potenze_standard = [30, 60, 100, 150, 200, 320]
    potenza_consigliata = next((p for p in potenze_standard if p >= potenza_totale), potenze_standard[-1])
    
    return jsonify({
        'success': True,
        'potenzaTotale': round(potenza_totale, 2),
        'potenzaConsigliata': potenza_consigliata
    })

@app.route('/get_strip_led_by_nome_commerciale/<nome_commerciale>')
def get_strip_led_by_nome_commerciale(nome_commerciale):
    mappatura = CONFIG_DATA.get('mappaturaCommerciale', {})
    strip_id = mappatura.get(nome_commerciale, None)
    
    if not strip_id:
        return jsonify({
            'success': False,
            'message': f'Strip LED non trovata con nome commerciale: {nome_commerciale}'
        })
    
    strip_info = CONFIG_DATA.get('stripLed', {}).get(strip_id, {})
    
    return jsonify({
        'success': True,
        'strip_led': {
            'id': strip_id,
            'nome': strip_info.get('nome', ''),
            'nomeCommerciale': strip_info.get('nomeCommerciale', ''),
            'tensione': strip_info.get('tensione', ''),
            'ip': strip_info.get('ip', ''),
            'temperaturaColoreDisponibili': strip_info.get('temperaturaColoreDisponibili', []),
            'potenzeDisponibili': strip_info.get('potenzeDisponibili', []),
            'codiciProdotto': strip_info.get('codiciProdotto', [])
        }
    })

@app.route('/calcola_lunghezze', methods=['POST'])
def calcola_lunghezze():
    data = request.json
    dim_richiesta = data.get('lunghezzaRichiesta', 0)
    strip_id = data.get('stripLedSelezionata')
    potenza_selezionata = data.get('potenzaSelezionata')
    
    # Default values
    taglio_minimo = 1  # Default se non troviamo un valore specifico
    spazio_produzione = CONFIG_DATA.get('spazioProduzione', 5)
    
    # Ottieni il taglio minimo per la strip e la potenza selezionata
    if strip_id and strip_id != 'NO_STRIP' and potenza_selezionata:
        # Ottieni la configurazione della strip
        strip_info = CONFIG_DATA.get('stripLed', {}).get(strip_id, {})
        
        # Ottieni le opzioni di potenza e i tagli minimi
        potenze_disponibili = strip_info.get('potenzeDisponibili', [])
        tagli_minimi = strip_info.get('taglioMinimo', [])
        
        # Trova l'indice dell'opzione di potenza selezionata
        potenza_index = -1
        for i, potenza in enumerate(potenze_disponibili):
            if potenza == potenza_selezionata:
                potenza_index = i
                break
        
        # Ottieni il taglio minimo corrispondente
        if potenza_index >= 0 and potenza_index < len(tagli_minimi):
            taglio_minimo_str = tagli_minimi[potenza_index]
            
            # Analizza il valore del taglio minimo
            # Il formato potrebbe essere "62,5mm" o "41.7mm"
            import re
            match = re.search(r'(\d+(?:[.,]\d+)?)', taglio_minimo_str)
            if match:
                # Sostituisci la virgola con il punto per il parsing corretto del float
                taglio_minimo_val = match.group(1).replace(',', '.')
                try:
                    taglio_minimo = float(taglio_minimo_val)
                except ValueError:
                    print(f"Errore nel parsing del valore del taglio minimo: {taglio_minimo_str}")
    
    # Se la lunghezza richiesta è fornita
    if dim_richiesta > 0:
        # Calcola il multiplo più vicino minore o uguale alla lunghezza richiesta
        proposta1 = int(dim_richiesta // taglio_minimo * taglio_minimo)
        
        # Calcola il multiplo più vicino maggiore o uguale alla lunghezza richiesta
        proposta2 = int(((dim_richiesta + taglio_minimo - 0.01) // taglio_minimo) * taglio_minimo)
        
        # Assicurati che proposta2 sia maggiore di proposta1
        # Questo gestisce il caso in cui la lunghezza richiesta è già un multiplo di taglio_minimo
        if proposta2 <= proposta1:
            proposta2 = int(proposta1 + taglio_minimo)
    else:
        # Valori predefiniti se non viene fornita una dimensione
        proposta1 = 0
        proposta2 = 0
    
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