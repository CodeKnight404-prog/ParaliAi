import pandas as pd
import numpy as np
import os

np.random.seed(42)
n = 1000

crop_types     = ['rice', 'wheat', 'maize', 'sugarcane']
residue_levels = ['low', 'medium', 'high']
machine_avail  = ['none', 'partial', 'full']
labour_avail   = ['none', 'some', 'full']
weather_conds  = ['dry', 'humid', 'wet']
field_sizes    = ['small', 'medium', 'large']

data = {
    'crop_type':    np.random.choice(crop_types, n, p=[0.55, 0.25, 0.1, 0.1]),
    'residue':      np.random.choice(residue_levels, n, p=[0.25, 0.45, 0.30]),
    'machine':      np.random.choice(machine_avail, n, p=[0.40, 0.35, 0.25]),
    'labour':       np.random.choice(labour_avail, n, p=[0.30, 0.45, 0.25]),
    'days':         np.random.randint(5, 46, n),
    'budget':       np.random.choice(range(0, 20001, 500), n),
    'weather':      np.random.choice(weather_conds, n, p=[0.45, 0.35, 0.20]),
    'field_size':   np.random.choice(field_sizes, n, p=[0.30, 0.45, 0.25]),
}

df = pd.DataFrame(data)

# Generate risk label based on realistic rules
def compute_risk(row):
    score = 0
    if row['residue'] == 'high':   score += 25
    elif row['residue'] == 'medium': score += 12
    if row['machine'] == 'none':   score += 20
    elif row['machine'] == 'partial': score += 8
    if row['days'] < 14:           score += 20
    elif row['days'] < 25:         score += 8
    if row['labour'] == 'none':    score += 12
    elif row['labour'] == 'some':  score += 5
    if row['budget'] < 2000:       score += 10
    elif row['budget'] < 8000:     score += 4
    if row['weather'] == 'dry':    score += 8
    if row['field_size'] == 'large': score += 5
    if row['crop_type'] == 'rice': score += 5
    # Add noise
    score += np.random.randint(-8, 9)
    if score < 30:   return 'low'
    elif score < 60: return 'medium'
    else:            return 'high'

df['risk'] = df.apply(compute_risk, axis=1)

os.makedirs('data', exist_ok=True)
df.to_csv('data/farmers_dataset.csv', index=False)

print(f"Dataset created: {len(df)} records")
print(df['risk'].value_counts())
print(df.head())