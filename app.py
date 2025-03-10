from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Carica i dati dal file Excel
def load_data():
    try:
        excel_path = os.path.join(os.path.dirname(__file__), 'LISTA CONFIGURATORE_PROFILI_STRIP.xlsx')
        return pd.read_excel(excel_path)
    except Exception as e:
        print(f"Errore nel caricamento del file Excel: {e}")
        return pd.DataFrame()

@app.route('/')
def index():
    """Rotta principale che mostra la pagina del configuratore"""
    return render_template('index.html')

@app.route('/get_modelli/<macrocategoria>')
def get_modelli(macrocategoria):
    """Restituisce tutti i modelli di una macrocategoria"""
    df = load_data()
    
    # Filtra per macrocategoria (assumiamo che esista una colonna 'Macrocategoria')
    if 'Macrocategoria' in df.columns:
        filtered_df = df[df['Macrocategoria'] == macrocategoria]
        
        # Estrai modelli unici 
        modelli = filtered_df['Modello'].unique().tolist() if 'Modello' in filtered_df.columns else []
        
        # Per ogni modello, trova la prima riga corrispondente e prendi i dati necessari
        result = []
        for modello in modelli:
            model_row = filtered_df[filtered_df['Modello'] == modello].iloc[0]
            
            # Puoi aggiungere qui altre informazioni specifiche del modello
            result.append({
                'nome': modello,
                'immagine': f"img/modelli/{modello.replace(' ', '_').lower()}.jpg",  # Path presunto dell'immagine
                'descrizione': model_row.get('Descrizione', '')
            })
        
        return jsonify(result)
    
    return jsonify([])

@app.route('/get_caratteristiche/<modello>')
def get_caratteristiche(modello):
    """Restituisce tutte le caratteristiche configurabili per un modello"""
    df = load_data()
    
    # Filtra per modello
    if 'Modello' in df.columns:
        filtered_df = df[df['Modello'] == modello]
        
        # Estrai le caratteristiche configurabili
        # (Questo dipende dalla struttura del tuo file Excel)
        caratteristiche = {}
        
        # Esempio: Supponiamo che le colonne dopo 'Modello' siano tutte caratteristiche
        colonne_escluse = ['Macrocategoria', 'Modello', 'Descrizione']
        
        for colonna in filtered_df.columns:
            if colonna not in colonne_escluse:
                valori_unici = filtered_df[colonna].dropna().unique().tolist()
                if valori_unici:  # Se ci sono valori per questa caratteristica
                    caratteristiche[colonna] = valori_unici
        
        return jsonify(caratteristiche)
    
    return jsonify({})

@app.route('/get_configurazione_finale', methods=['POST'])
def get_configurazione_finale():
    """Restituisce la configurazione finale in base alle scelte dell'utente"""
    dati = request.json
    df = load_data()
    
    # Costruiamo una query per filtrare il DataFrame in base alle scelte
    query_conditions = []
    
    for key, value in dati.items():
        if key != 'csrf_token':  # Escludiamo eventuali token CSRF
            query_conditions.append(f"`{key}` == '{value}'")
    
    query = " and ".join(query_conditions)
    
    try:
        risultato = df.query(query)
        
        if len(risultato) > 0:
            # Prendiamo la prima riga che corrisponde alle selezioni
            riga = risultato.iloc[0].to_dict()
            
            # Puoi aggiungere qui la logica per costruire il codice prodotto, prezzo, ecc.
            
            return jsonify({
                'success': True,
                'configurazione': riga,
                'codice_prodotto': f"LED-{riga.get('Modello', '').replace(' ', '')}-{riga.get('Potenza', '').replace(' ', '')}"
            })
        else:
            return jsonify({
                'success': False,
                'messaggio': 'Nessuna configurazione trovata con i parametri selezionati'
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'messaggio': f'Errore nella ricerca della configurazione: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True)