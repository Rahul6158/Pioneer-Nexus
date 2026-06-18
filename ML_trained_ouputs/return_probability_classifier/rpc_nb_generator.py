import nbformat as nbf

nb = nbf.v4.new_notebook()

cells = []

# Title
cells.append(nbf.v4.new_markdown_cell("""
# Return Probability Classifier

This notebook trains a **Random Forest model** to predict the probability that a product will be returned.

### Model Details

Algorithm: Random Forest Classifier  
Goal: Predict likelihood of product returns  
Output: Return probability per product  
Refresh: Real-time on transaction
"""))

# Install libraries
cells.append(nbf.v4.new_code_cell("""
!pip install pandas scikit-learn joblib matplotlib
"""))

# Imports
cells.append(nbf.v4.new_code_cell("""
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
"""))

# Upload dataset
cells.append(nbf.v4.new_markdown_cell("""
## Upload Dataset

Upload the dataset:

pioneer_pharma_ideal_dataset_70000_rows.csv
"""))

cells.append(nbf.v4.new_code_cell("""
from google.colab import files
uploaded = files.upload()
"""))

# Load dataset
cells.append(nbf.v4.new_markdown_cell("## Load Dataset"))

cells.append(nbf.v4.new_code_cell("""
df = pd.read_csv("pioneer_pharma_ideal_dataset_70000_rows.csv")

df.head()
"""))

# Create return label
cells.append(nbf.v4.new_markdown_cell("## Create Return Label"))

cells.append(nbf.v4.new_code_cell("""
df["is_return"] = (df["transaction_type"] == "Return").astype(int)

df[["transaction_type","is_return"]].head()
"""))

# Encode categorical variables
cells.append(nbf.v4.new_markdown_cell("## Encode Categorical Variables"))

cells.append(nbf.v4.new_code_cell("""
region_encoder = LabelEncoder()
product_encoder = LabelEncoder()

df["region_encoded"] = region_encoder.fit_transform(df["region"])
df["product_encoded"] = product_encoder.fit_transform(df["product_name"])
"""))

# Feature engineering
cells.append(nbf.v4.new_markdown_cell("## Define Features"))

cells.append(nbf.v4.new_code_cell("""
X = df[[
    "region_encoded",
    "product_encoded",
    "quantity",
    "unit_price_iqd"
]]

y = df["is_return"]
"""))

# Train test split
cells.append(nbf.v4.new_markdown_cell("## Train Test Split"))

cells.append(nbf.v4.new_code_cell("""
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
"""))

# Train model
cells.append(nbf.v4.new_markdown_cell("## Train Random Forest Classifier"))

cells.append(nbf.v4.new_code_cell("""
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)
"""))

# Evaluate model
cells.append(nbf.v4.new_markdown_cell("## Model Evaluation"))

cells.append(nbf.v4.new_code_cell("""
predictions = model.predict(X_test)

print(classification_report(y_test, predictions))
"""))

# Save model
cells.append(nbf.v4.new_markdown_cell("## Save Model"))

cells.append(nbf.v4.new_code_cell("""
joblib.dump(model,"return_probability_model.pkl")

joblib.dump(region_encoder,"return_region_encoder.pkl")

joblib.dump(product_encoder,"return_product_encoder.pkl")
"""))

# Download models
cells.append(nbf.v4.new_markdown_cell("## Download Model Files"))

cells.append(nbf.v4.new_code_cell("""
from google.colab import files

files.download("return_probability_model.pkl")
files.download("return_region_encoder.pkl")
files.download("return_product_encoder.pkl")
"""))

nb["cells"] = cells

with open("return_probability_classifier_training.ipynb", "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print("Notebook generated: return_probability_classifier_training.ipynb")