import csv
import requests
import os
import json

# הכתובת של ה-CSV
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZEVFw70pjDNKkIa4JxtpuTu_pizLLb-YTPtyk5WTNRC2hz5PvUqiDXh4OyonQjsDEmqT4cGjhzG1r/pub?gid=1397364136&single=true&output=csv"

def generate():
    response = requests.get(CSV_URL)
    response.encoding = 'utf-8'
    lines = response.text.splitlines()
    reader = csv.DictReader(lines)
    
    if not os.path.exists('vcards'):
        os.makedirs('vcards')

    all_contacts = [] # רשימה שתשמור את הנתונים ל-JSON

    for row in reader:
        first_name = row.get('firstName', '').strip()
        last_name = row.get('lastName', '').strip()
        name = f"{first_name} {last_name}".strip()
        mobile = row.get('mobile', '').strip()
        phone_number = row.get('mobileE164', '').strip()
        
        if not name or not phone_number: continue
        
        # בניית תוכן ה-VCF
        vcf_content = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            f"N;CHARSET=UTF-8:{last_name};{first_name};;;",
            f"FN;CHARSET=UTF-8:{name}",
            f"ORG;CHARSET=UTF-8:{row.get('pluga','')} - {row.get('framework','')}",
            f"TITLE;CHARSET=UTF-8:{row.get('role','')}",
            f"TEL;TYPE=CELL;VOICE:{phone_number}",
            "END:VCARD"
        ]
        
        clean_filename = phone_number.replace('+', '')
        filename = f"vcards/{clean_filename}.vcf"
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write("\n".join(vcf_content))
            
        # הוספת איש הקשר לרשימה הכללית עבור ה-JSON
        all_contacts.append({
            "name": name,
            "mobile": mobile,
            "mobileE164": phone_number,
            "pluga": row.get('pluga', ''),
            "framework": row.get('framework', ''),
            "role": row.get('role', '')
        })

    # יצירת קובץ ה-contacts.json בשורש ה-Repo
    with open('contacts.json', 'w', encoding='utf-8') as jf:
        json.dump(all_contacts, jf, ensure_ascii=False, indent=4)

    print(f"Done! Generated {len(all_contacts)} VCards and contacts.json")

if __name__ == "__main__":
    generate()
