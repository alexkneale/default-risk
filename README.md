# 🏠 Default Risk Classifier

This is a full-stack web application that allows users to evaluate their mortgage application risk using a machine learning model trained to predict mortgage default.

## 🚀 Live Demo

- **Frontend**: `index.html` served locally or via static hosting
- **Backend API**: Hosted for free on [Render](https://render.com)
- **Model**: Trained in Python and served via FastAPI

---

## 📋 Features

### ✅ User Interaction

- **Homepage (`index.html`)**
  - Presents a form for users to input:
    - Credit Score
    - Mortgage Request Amount
    - Debt-to-Income Ratio
    - Other relevant features for mortgage evaluation
  - On submission, data is sent to a Python backend for prediction.

- **Prediction Outcome**
  - User is redirected to either:
    - `pass.html` – if application is likely **approved**
    - `fail.html` – if application is likely **rejected**

- **Feedback & Visualization**
  - Each result page includes:
    - Bar charts showing the user’s position in:
      - Credit Score Distribution
      - Mortgage Request Amount (`orig_upb`) Distribution
      - Debt-to-Income Ratio Distribution
    - Red-highlighted column with "YOU" label indicating user’s score
    - A brief explanation of:
      - The machine learning model used
      - The challenge of working with imbalanced datasets

- **Reusability**
  - Users can resubmit the form as many times as they wish
  - Background color of the form reflects the approval status
  - Form auto-resets and changes color dynamically on submission

---

## 🧠 Machine Learning

- **Model**: Decision Tree Classifier (`sklearn`)
- **Preprocessing**: ColumnTransformer pipeline with:
  - Numerical preprocessing
  - Categorical encoding
  - Count vectorization (if applicable)
- **Evaluation Metrics**:
  - Accuracy, Precision, Recall, F1-score
  - Results saved to `.json` for reference

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|------------|
| Frontend | HTML, SCSS, TypeScript |
| Backend | Python, FastAPI |
| ML/Model | Scikit-learn, Joblib |
| Hosting | Render (for API) |
| Visualization | Chart.js (for bar charts) |

---

## 📁 Project Structure
project-root/
├── backend/ # Python FastAPI server + ML model
│ ├── model.joblib # Trained ML model
│ ├── requirements.txt # Python libraries for running model
│ ├── model_metrics.json # Saved metrics (accuracy, F1, etc.)
│ └── main.py # FastAPI server entry point
│
├── frontend/
│ ├── index.html # Homepage with user form
│ ├── pass.html # Approved application result
│ ├── fail.html # Rejected application result
│ ├── style.scss / css # Stylesheets
│ ├── script.ts # Handles form submission, DOM updates
│ └── assets/ # Chart.js config, utility files
│
├── README.md
├── .gitignore
└── package.json / pom.xml # If using a build tool for frontend/backend


---

## 🔁 How It Works

1. User fills out form on `index.html`
2. Form data is sent via `POST` to the FastAPI backend
3. Backend:
   - Loads pre-trained `joblib` model
   - Runs prediction on incoming data
   - Returns prediction result
4. Frontend:
   - Redirects user to either `pass.html` or `fail.html` based on result
   - Visualizes user’s standing using Chart.js
   - Updates form background color based on approval status
   - Allows resubmission from result page

---

## 📊 Model Explanation

- **Why Decision Trees?**
  - Interpretable structure
  - Fast to train and predict
  - Handles both categorical and numerical features well

- **Handling Class Imbalance**
  - Applied class weights to account for skewed data
  - Evaluation includes F1-score to better reflect minority class performance

---

## 🧪 How to Run Locally

### 1. Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


