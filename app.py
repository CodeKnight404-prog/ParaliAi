from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/predict', methods=['OPTIONS'])
def options_predict():
    return '', 200

@app.route('/pollution', methods=['OPTIONS'])
def options_pollution():
    return '', 200

# Load model
model    = pickle.load(open('model/rf_model.pkl', 'rb'))
encoders = pickle.load(open('model/encoders.pkl', 'rb'))
features = pickle.load(open('model/features.pkl', 'rb'))
print("Model loaded OK")

RECOMMENDATIONS = {
    'low': [
        {'icon': '🍄', 'text': 'Mushroom farming on residue — high income potential'},
        {'icon': '🌱', 'text': 'In-situ composting with Happy Seeder'},
        {'icon': '🐄', 'text': 'Sell residue as animal feed to dairy farms'},
        {'icon': '💰', 'text': 'Earn carbon credits through sustainable disposal'},
    ],
    'medium': [
        {'icon': '🚜', 'text': 'Request shared Happy Seeder — 2-3 days wait nearby'},
        {'icon': '🏭', 'text': 'Biomass power plant pickup — Rs.1,800-2,400/tonne'},
        {'icon': '🌿', 'text': 'Apply Pusa decomposer — ready in 25 days'},
        {'icon': '🤝', 'text': 'Connect with local CRM subsidy officer'},
    ],
    'high': [
        {'icon': '🚨', 'text': 'URGENT: Contact block agricultural officer today'},
        {'icon': '🚜', 'text': 'Emergency machine sharing request — priority queue'},
        {'icon': '💰', 'text': 'Apply for PM-PRANAM scheme emergency fund'},
        {'icon': '📞', 'text': 'Call Kisan helpline: 1800-180-1551'},
        {'icon': '🏭', 'text': 'Biomass collector can arrive in 48hrs — book now'},
    ]
}

MACHINES = [
    {'name': 'Happy Seeder',    'available': True,  'distance': '3.2 km', 'cost': 'Rs.1,200/acre', 'contact': '98765-43210'},
    {'name': 'Rotavator',       'available': True,  'distance': '1.8 km', 'cost': 'Rs.800/acre',   'contact': '97654-32109'},
    {'name': 'Straw Baler',     'available': False, 'distance': '5.1 km', 'cost': 'Rs.1,500/acre', 'contact': '96543-21098'},
    {'name': 'Mulcher',         'available': True,  'distance': '4.4 km', 'cost': 'Rs.900/acre',   'contact': '95432-10987'},
    {'name': 'Zero Till Drill', 'available': True,  'distance': '2.7 km', 'cost': 'Rs.1,000/acre', 'contact': '94321-09876'},
]

SCHEMES = [
    {'name': 'PM-PRANAM Scheme', 'benefit': 'Financial incentive for reducing chemical fertilizer use', 'amount': 'Rs.50,000 per hectare', 'apply': 'Via Block Agriculture Officer'},
    {'name': 'CRM Subsidy Punjab', 'benefit': '50-80% subsidy on Happy Seeder, Mulcher, Rotavator', 'amount': 'Up to Rs.1,80,000 per machine', 'apply': 'agrimachinery.punjab.gov.in'},
    {'name': 'PKVY Scheme', 'benefit': 'Support for organic farming transition', 'amount': 'Rs.50,000 per hectare over 3 years', 'apply': 'Via State Agriculture Department'},
    {'name': 'Pusa Decomposer', 'benefit': 'Free decomposer capsules for in-situ management', 'amount': 'Free', 'apply': 'Contact IARI or local KVK center'},
]

def encode_input(data):
    cat_cols = ['crop_type', 'residue', 'machine', 'labour', 'weather', 'field_size']
    encoded = []
    for feat in features:
        val = data.get(feat)
        if feat in cat_cols:
            le = encoders[feat]
            encoded.append(int(le.transform([val])[0]))
        else:
            encoded.append(float(val))
    return np.array([encoded])

@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'ParaliAI Backend Running', 'version': '1.0'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        X = encode_input(data)
        risk_encoded = model.predict(X)[0]
        risk_proba   = model.predict_proba(X)[0]
        risk_label   = encoders['risk'].inverse_transform([risk_encoded])[0]
        risk_pct     = int(risk_proba[risk_encoded] * 100)
        tph = {'low': 1.5, 'medium': 3.5, 'high': 6.0}
        fmul = {'small': 1, 'medium': 2.5, 'large': 5}
        tonnes = tph[data['residue']] * fmul[data['field_size']]
        co2_kg = int(tonnes * 1600)
        return jsonify({
            'risk': risk_label,
            'confidence': risk_pct,
            'recommendations': RECOMMENDATIONS[risk_label],
            'co2_estimate_kg': co2_kg,
            'model': 'Random Forest Classifier',
            'accuracy': '80.5%'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pollution', methods=['POST'])
def pollution():
    try:
        data     = request.get_json()
        hectares = float(data.get('hectares', 1))
        residue  = data.get('residue', 'medium')
        tph      = {'low': 1.5, 'medium': 3.5, 'high': 6.0}
        tonnes   = tph[residue] * hectares
        co2      = tonnes * 1600
        pm25     = tonnes * 7.2
        aqi_spike = int(pm25 * 14)
        eco_score = max(0, 100 - int((co2 / (hectares * 3000)) * 100))
        return jsonify({
            'hectares': hectares,
            'total_residue_tonnes': round(tonnes, 2),
            'emissions': {'co2_kg': round(co2), 'pm25_kg': round(pm25, 1)},
            'aqi_spike_estimate': aqi_spike,
            'eco_score': eco_score,
            'eco_rating': 'CRITICAL' if eco_score < 20 else 'POOR' if eco_score < 50 else 'MODERATE',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/machines', methods=['GET'])
def machines():
    return jsonify({'machines': MACHINES, 'available': sum(1 for m in MACHINES if m['available'])})

@app.route('/schemes', methods=['GET'])
def schemes():
    return jsonify({'schemes': SCHEMES})

if __name__ == '__main__':
    app.run(debug=True, port=5000)