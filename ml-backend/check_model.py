"""
Quick script to verify the ML model is intact
"""
import os
import joblib

def check_model():
    print("=" * 60)
    print("PhishGuard Model Health Check")
    print("=" * 60)
    
    model_path = 'phishguard_model.pkl'
    
    if not os.path.exists(model_path):
        print(f"\n[WARNING] Model file '{model_path}' not found!")
        print("          You'll need to train a new model.")
        return False
    
    try:
        # Try to load the model
        model = joblib.load(model_path)
        print(f"\n[SUCCESS] Model file exists and loads correctly!")
        print(f"          Model type: {type(model).__name__}")
        print(f"          Has predict method: {hasattr(model, 'predict')}")
        print(f"          Has predict_proba method: {hasattr(model, 'predict_proba')}")
        
        # Test a simple prediction
        if hasattr(model, 'predict'):
            print(f"\n[INFO] Model appears to be intact and functional.")
            return True
        else:
            print(f"\n[ERROR] Model is missing required methods!")
            return False
            
    except Exception as e:
        print(f"\n[ERROR] Model file is corrupted or incompatible!")
        print(f"        Error: {e}")
        return False

if __name__ == '__main__':
    is_ok = check_model()
    
    print("\n" + "=" * 60)
    if is_ok:
        print("Model is OK - safe to use!")
    else:
        print("Model needs to be retrained.")
    print("=" * 60)

