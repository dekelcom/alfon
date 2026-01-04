// actions.js - מנהל את כל התקשורת מול ה-Buffer ב-Google Sheets
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxpUF5SbyFwbF6b0unhJ9K6e66S0G4t9L_n-FkxREcUjVsbhXtFqh6T-_FgOuifIIhs/exec';

/**
 * פונקציה גנרית לשליחת נתונים לחוצץ
 * @param {string} actionType - 'UPDATE' או 'CREATE'
 * @param {object} data - נתוני איש הקשר
 */
async function submitToBuffer(actionType, data) {
    // זיהוי אלמנט הסטטוס בהתאם למודל הפתוח
    const statusId = actionType === 'CREATE' ? 'addStatusMsg' : 'statusMsg';
    const status = document.getElementById(statusId);
    
    if (status) {
        status.style.color = "blue";
        status.innerText = "שולח בקשה למערכת...";
    }

    const payload = {
        sheetName: 'updates', 
        action: actionType,
        ...data,
        timestamp: new Date().toLocaleString('he-IL')
    };

    try {
        // שליחה ל-Google Apps Script
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // מצב זה נדרש לעבודה מול Apps Script
            body: JSON.stringify(payload)
        });
        
        if (status) {
            status.style.color = "green";
            status.innerHTML = "הבקשה נשלחה! השינוי יופיע תוך זמן קצר.";
        }
        return true;
    } catch (err) {
        console.error("Buffer Error:", err);
        if (status) {
            status.style.color = "red";
            status.innerText = "שגיאת תקשורת. נסה שוב מאוחר יותר.";
        }
        return false;
    }
}

/**
 * לוגיקה ספציפית להוספת משתמש חדש (כולל בדיקת PIN)
 */
async function handleAddNewContact(formData) {
    // כאן נכנסת הלוגיקה של הקוד הסודי שדיברנו עליה אתמול
    const ADMIN_PIN = "8822"; 
    const userPin = prompt("הקש קוד גישה לביצוע הוספה:");
    
    if (userPin !== ADMIN_PIN) {
        alert("קוד שגוי. אין לך הרשאה להוסיף אנשי קשר.");
        return false;
    }

    // אם הקוד נכון, שולח לחוצץ כפעולת CREATE
    return await submitToBuffer('CREATE', formData);
}
