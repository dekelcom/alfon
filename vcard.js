(function(context) {
    var version = { "TWO": "2.1", "THREE": "3.0", "FOUR": "4.0" };
    var vCard = {
        Version: version,
        Entry: {
            "ADDRESS": {"version": [version.TWO, version.THREE, version.FOUR], "key": "ADR", "format": ";;{0};{2};{4};{1};{3}"},
            "EMAIL": {"version": [version.TWO, version.THREE, version.FOUR], "key": "EMAIL"},
            "FORMATTEDNAME": {"version": [version.TWO, version.THREE, version.FOUR], "key": "FN"},
            "NAME": {"version": [version.TWO, version.THREE, version.FOUR], "key": "N", "format": "{1};{0};;{2}"},
            "ORGANIZATION": {"version": [version.TWO, version.THREE, version.FOUR], "key": "ORG"},
            "PHONE": {"version": [version.TWO, version.THREE, version.FOUR], "key": "TEL"},
            "TITLE": {"version": [version.TWO, version.THREE, version.FOUR], "key": "TITLE"},
            "URL": {"version": [version.TWO, version.THREE, version.FOUR], "key": "URL"}
        },
        Type: { "HOME": "HOME", "WORK": "WORK", "CELL": "CELL", "MAIN": "MAIN", "OTHER":"OTHER" },
        create: function(version) {
            for(var key in this.Version) {
                if(this.Version[key] === version) return new Card(version)
            }
            throw new Error("Unknown vCard version")
        },
        dump: function(card) {
            var str = "BEGIN:VCARD\nVERSION:" + card.version + "\n";
            for(var key in card) {
                var entry = card[key];
                if(typeof entry === "function" || key === "version") continue;
                if(Array.isArray(entry)) {
                    for(var i = 0; i < entry.length; i++) {
                        var e = entry[i];
                        str += key.toUpperCase() + (e.type ? ";TYPE=" + e.type.toUpperCase() + ":" : ":") + e.value + "\n";
                    }
                }
            }
            str += "END:VCARD";
            return str;
        },
        export: function(card, name, force) {
            var str = this.dump(card);
            var fileName = name.replace(/\s+/g, '_') + ".vcf";
            
            // בדיקה האם מדובר במכשיר iOS
            var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
                // באייפון - הדרך הכי בטוחה היא Data URI עם base64
                var uri = "data:text/vcard;base64," + this.btoa(str);
                window.location.href = uri;
            } else {
                // במחשב ואנדרואיד - שימוש ב-Blob להורדה שקטה
                var blob = new Blob([str], { type: "text/vcard;charset=utf-8" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            }
        },
        btoa: function(str) {
            return btoa(unescape(encodeURIComponent(str)));
        }
    };

    var Card = function(version) {
        this.version = version;
        for(var key in vCard.Entry) {
            var property = vCard.Entry[key];
            if(!property.version || property.version.indexOf(version) < 0) continue;
            var fn = "add" + key[0].toUpperCase() + key.slice(1).toLowerCase();
            Card.prototype[fn] = (function(key, format) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    var lastArg = args.length > 0 ? args[args.length - 1] : undefined;
                    var isType = vCard.Type.hasOwnProperty(lastArg);
                    var model = isType ? args.slice(0, args.length - 1) : args;
                    var value = format ? format.replace(/\{([0-9]*)\}/g, function(m, p) { return model[parseInt(p)] || ''; }) : model[0];
                    this.add(key, value, isType ? lastArg : undefined);
                }
            })(property.key, property.format);
        }
        this.add = function(entry, value, type) {
            var key = (typeof entry === "object" && entry.key) ? entry.key : entry;
            if(!this[key]) this[key] = [];
            this[key].push({"value": value, "type": type});
        };
    };
    context.vCard = vCard;
})(this);
