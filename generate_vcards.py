import csv
import requests
import os

# הכתובת של ה-CSV (שים לב שזה ה-URL של ה-CSV ולא ה-HTML)
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZEVFw70pjDNKkIa4JxtpuTu_pizLLb-YTPtyk5WTNRC2hz5PvUqiDXh4OyonQjsDEmqT4cGjhzG1r/pub?gid=1397364136&single=true&output=csv"

def generate():
    response = requests.get(CSV_URL)
    response.encoding = 'utf-8'
    lines = response.text.splitlines()
    reader = csv.DictReader(lines)
    
    if not os.path.exists('vcards'):
        os.makedirs('vcards')

    for row in reader:
        name = f"{row.get('firstName', '')} {row.get('lastName', '')}".strip()
        if not name or not row.get('mobile'): continue
        
        # שימוש בשדה mobileE164 מהגוגל שיטס
        phone_number = row.get('mobileE164', '').strip()
        
        # דילוג על שורות ריקות או ללא מספר
        if not name or not phone_number: continue
        
        vcf_content = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            f"N;CHARSET=UTF-8:{row.get('lastName','')};{row.get('firstName','')};;;",
            f"FN;CHARSET=UTF-8:{name}",
            f"ORG;CHARSET=UTF-8:{row.get('pluga','')} - {row.get('framework','')}",
            f"TITLE;CHARSET=UTF-8:{row.get('role','')}",
            f"TEL;TYPE=CELL;VOICE:{phone_number}", # המספר בפורמט +972...
            "END:VCARD"
        ]
        
        # שם הקובץ יהיה המספר ללא ה-+ (למשל 972502001754.vcf)
        clean_filename = phone_number.replace('+', '')
        filename = f"vcards/{clean_filename}.vcf"
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write("\n".join(vcf_content))

    print("Done generating VCards using mobileE164")

if __name__ == "__main__":
    generate()
