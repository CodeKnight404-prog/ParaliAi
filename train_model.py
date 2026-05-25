import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

# ── LOAD DATASET ──
df = pd.read_csv('data/farmers_dataset.csv')
print(f"Loaded {len(df)} records")

# ── ENCODE CATEGORICAL FEATURES ──
encoders = {}
cat_cols = ['crop_type', 'residue', 'machine', 'labour', 'weather', 'field_size']

for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le
    print(f"{col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# ── ENCODE TARGET ──
label_encoder = LabelEncoder()
df['risk_encoded'] = label_encoder.fit_transform(df['risk'])
encoders['risk'] = label_encoder
print(f"\nRisk classes: {dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_)))}")

# ── FEATURES & TARGET ──
feature_cols = ['crop_type', 'residue', 'machine', 'labour', 'days', 'budget', 'weather', 'field_size']
X = df[feature_cols]
y = df['risk_encoded']

# ── TRAIN / TEST SPLIT ──
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── TRAIN RANDOM FOREST ──
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced'
)
model.fit(X_train, y_train)

# ── EVALUATE ──
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {acc*100:.1f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# ── FEATURE IMPORTANCE ──
print("\nFeature Importances:")
for feat, imp in sorted(zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat}: {imp:.3f}")

# ── SAVE MODEL & ENCODERS ──
os.makedirs('model', exist_ok=True)
pickle.dump(model, open('model/rf_model.pkl', 'wb'))
pickle.dump(encoders, open('model/encoders.pkl', 'wb'))
pickle.dump(feature_cols, open('model/features.pkl', 'wb'))

print("\nModel saved to model/rf_model.pkl")
print("Encoders saved to model/encoders.pkl")