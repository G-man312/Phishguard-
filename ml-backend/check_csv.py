"""
Quick script to verify your CSV dataset format before training.
Run this to check if your CSV file is in the correct format.
"""

import pandas as pd
import os
import sys

def check_csv(csv_file='phishing_urls.csv'):
    """
    Check if CSV file exists and has the right format.
    """
    print("=" * 60)
    print("Phishing Dataset CSV Checker")
    print("=" * 60)
    
    if not os.path.exists(csv_file):
        print(f"\n[ERROR] File '{csv_file}' not found!")
        print(f"   Expected location: {os.path.abspath(csv_file)}")
        print("\nNext steps:")
        print("   1. Download a phishing dataset")
        print("   2. Save it as 'phishing_urls.csv' in the ml-backend folder")
        print("   3. Run this script again")
        return False
    
    print(f"\n[OK] File found: {csv_file}")
    
    try:
        # Try to read the CSV
        df = pd.read_csv(csv_file)
        print(f"[OK] Successfully read CSV file")
        print(f"[OK] Total rows: {len(df)}")
        
        # Show columns
        print(f"\n[INFO] Columns found: {list(df.columns)}")
        
        # Try to find URL column
        possible_url_columns = ['url', 'URL', 'urls', 'URLs', 'website', 'Website', 
                               'domain', 'Domain', 'link', 'Link', 'address', 'Address']
        
        url_column = None
        for col in df.columns:
            if col.lower() in [c.lower() for c in possible_url_columns]:
                url_column = col
                break
        
        if url_column:
            print(f"[OK] Found URL column: '{url_column}'")
            
            # Count valid URLs
            urls = df[url_column].dropna().tolist()
            valid_urls = [u for u in urls if u and isinstance(u, str) and (u.startswith('http://') or u.startswith('https://'))]
            
            print(f"[OK] Valid URLs: {len(valid_urls)} / {len(urls)}")
            
            if len(valid_urls) > 0:
                print(f"\n[OK] Sample URLs:")
                for i, url in enumerate(valid_urls[:5], 1):
                    print(f"   {i}. {url}")
                
                if len(valid_urls) < 50:
                    print(f"\n[WARNING] Only {len(valid_urls)} URLs. Consider adding more data.")
                else:
                    print(f"\n[SUCCESS] Ready to train! You have {len(valid_urls)} URLs.")
                
                return True
            else:
                print(f"\n[ERROR] No valid URLs found!")
                print("   URLs should start with 'http://' or 'https://'")
                return False
        else:
            print(f"\n[ERROR] Could not find URL column!")
            print("   Please rename your URL column to 'url'")
            print("   Or edit collect_data.py to use your column name")
            return False
            
    except Exception as e:
        print(f"\n[ERROR] Failed to read CSV: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'phishing_urls.csv'
    success = check_csv(csv_file)
    
    if success:
        print("\n" + "=" * 60)
        print("Next steps:")
        print("   1. Run: python collect_data.py --use-datasets")
        print("   2. Run: python train_model.py")
        print("   3. Run: python app.py")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Fix the issues above and try again.")
        print("=" * 60)


