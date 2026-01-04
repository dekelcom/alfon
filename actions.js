// actions.js - אחראי על שליחת נתונים לחוצץ ה-updates
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxpUF5SbyFwbF6b0unhJ9K6e66S0G4t9L_n-FkxREcUjVsbhXtFqh6T-_FgOuifIIhs/exec';

async function submitToBuffer(actionType, data) {
    const status = document.getElementById('statusMsg');
    if (status) status.innerText = "מעבד בקשה...";

    const payload = {
        sheetName: 'updates', // כתיבה לגיליון החוצץ
        action: actionType,   // 'UPDATE' או 'CREATE'
        ...data,
        timestamp: new Date().toLocaleString('he-IL')
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        if (status) {
            status.innerHTML = "<span style='color:green'>הבקשה נשלחה לחוצץ!</span>";
        }
        return true;
    } catch (err) {
        console.error("Buffer Error:", err);
        if (status) status.innerText = "שגיאת תקשורת.";
        return false;
    }
}
