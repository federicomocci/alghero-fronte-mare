/**
 * UPDATE ALL PAGES - Alghero Fronte Mare
 * ======================================
 * Aggiunge cookie banner + GA4 con consenso a tutte le pagine
 * 
 * USO:
 * 1. Copia questo file in ~/Progetti/alghero-fronte-mare/
 * 2. Esegui: node update-all-pages.js
 */

const fs = require('fs');
const path = require('path');

// Configurazione
const ROOT_DIR = __dirname;
const EXCLUDE_FILES = ['update-all-pages.js', 'node_modules'];

// Traduzioni del banner
const TRANSLATIONS = {
    it: {
        text: 'Uso i cookie per capire quali pagine funzionano meglio. Posso?',
        accept: 'Sì, va bene',
        reject: 'No grazie',
        link: 'Cookie Policy',
        policyUrl: '/cookie-policy'
    },
    en: {
        text: 'I use cookies to understand which pages work best. May I?',
        accept: 'Yes, that\'s fine',
        reject: 'No thanks',
        link: 'Cookie Policy',
        policyUrl: '/en/cookie-policy'
    },
    de: {
        text: 'Ich verwende Cookies, um zu verstehen, welche Seiten am besten funktionieren. Darf ich?',
        accept: 'Ja, klar',
        reject: 'Nein danke',
        link: 'Cookie-Richtlinie',
        policyUrl: '/de/cookie-policy'
    },
    fr: {
        text: 'J\'utilise des cookies pour comprendre quelles pages fonctionnent le mieux. Puis-je ?',
        accept: 'Oui, d\'accord',
        reject: 'Non merci',
        link: 'Politique des cookies',
        policyUrl: '/fr/cookie-policy'
    },
    es: {
        text: 'Uso cookies para entender qué páginas funcionan mejor. ¿Puedo?',
        accept: 'Sí, vale',
        reject: 'No gracias',
        link: 'Política de cookies',
        policyUrl: '/es/cookie-policy'
    }
};

// Nuovo codice GA4 (aspetta il consenso)
const NEW_GA4_CODE = `<!-- GA4 con consenso -->
    <script>
    window.loadGA4 = function() {
        if (document.querySelector('script[src*="googletagmanager"]')) return;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-SWY4HV4168';
        document.head.appendChild(s);
        s.onload = function() {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SWY4HV4168');
        };
    };
    if (localStorage.getItem('cookie-consent') === 'accepted') {
        window.loadGA4();
    }
    </script>`;

// CSS del cookie banner (minificato)
const COOKIE_CSS = `
/* Cookie Banner */
.cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:0 1rem 1rem;pointer-events:none;opacity:0;transform:translateY(100%);transition:opacity .3s ease,transform .3s ease}.cookie-banner--visible{opacity:1;transform:translateY(0);pointer-events:auto}.cookie-banner__content{max-width:480px;margin:0 auto;background:#1a3a4a;border-radius:16px;padding:1.25rem 1.5rem;box-shadow:0 8px 32px rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;text-align:center;gap:.75rem}.cookie-banner__icon{font-size:2rem;line-height:1}.cookie-banner__text{color:#fff;font-size:1rem;line-height:1.5;margin:0}.cookie-banner__buttons{display:flex;gap:.75rem;width:100%;margin-top:.25rem}.cookie-banner__btn{flex:1;padding:.75rem 1rem;border:none;border-radius:25px;font-size:.95rem;font-weight:600;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;font-family:inherit}.cookie-banner__btn:hover{transform:scale(1.03)}.cookie-banner__btn--reject{background:transparent;color:#a0b4bc;border:1.5px solid #a0b4bc}.cookie-banner__btn--reject:hover{background:rgba(255,255,255,.1);color:#fff;border-color:#fff}.cookie-banner__btn--accept{background:#c4956a;color:#fff;box-shadow:0 4px 12px rgba(196,149,106,.3)}.cookie-banner__btn--accept:hover{background:#d4a57a;box-shadow:0 6px 16px rgba(196,149,106,.4)}.cookie-banner__link{color:#a0b4bc;font-size:.8rem;text-decoration:none;margin-top:.25rem}.cookie-banner__link:hover{color:#fff;text-decoration:underline}@media(max-width:520px){.cookie-banner{padding:0 .75rem .75rem}.cookie-banner__content{border-radius:12px;padding:1rem 1.25rem}.cookie-banner__text{font-size:.95rem}.cookie-banner__btn{padding:.7rem .75rem;font-size:.9rem}}`;

// Genera HTML del banner per una lingua
function getBannerHTML(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.it;
    return `
<!-- Cookie Banner -->
<div id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Cookie consent">
    <div class="cookie-banner__content">
        <span class="cookie-banner__icon">🍪</span>
        <p class="cookie-banner__text">${t.text}</p>
        <div class="cookie-banner__buttons">
            <button id="cookie-reject" class="cookie-banner__btn cookie-banner__btn--reject">${t.reject}</button>
            <button id="cookie-accept" class="cookie-banner__btn cookie-banner__btn--accept">${t.accept}</button>
        </div>
        <a href="${t.policyUrl}" class="cookie-banner__link">${t.link}</a>
    </div>
</div>
<script>
(function() {
    var banner = document.getElementById('cookie-banner');
    var consent = localStorage.getItem('cookie-consent');
    if (consent) { banner.style.display = 'none'; return; }
    banner.classList.add('cookie-banner--visible');
    document.getElementById('cookie-accept').addEventListener('click', function() {
        localStorage.setItem('cookie-consent', 'accepted');
        banner.classList.remove('cookie-banner--visible');
        setTimeout(function() { banner.style.display = 'none'; }, 300);
        window.loadGA4();
    });
    document.getElementById('cookie-reject').addEventListener('click', function() {
        localStorage.setItem('cookie-consent', 'rejected');
        banner.classList.remove('cookie-banner--visible');
        setTimeout(function() { banner.style.display = 'none'; }, 300);
    });
})();
</script>`;
}

// Rileva la lingua dal percorso del file
function detectLanguage(filePath) {
    if (filePath.includes('/en/')) return 'en';
    if (filePath.includes('/de/')) return 'de';
    if (filePath.includes('/fr/')) return 'fr';
    if (filePath.includes('/es/')) return 'es';
    return 'it';
}

// Trova tutti i file HTML
function findHTMLFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        if (EXCLUDE_FILES.includes(item)) continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            findHTMLFiles(fullPath, files);
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Aggiorna un singolo file
function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lang = detectLanguage(filePath);
    let modified = false;
    
    // 1. Rimuovi vecchio GA4
    const oldGA4Patterns = [
        /<!-- Google tag \(gtag\.js\) -->\s*\n?\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-SWY4HV4168"><\/script>\s*\n?\s*<script>window\.dataLayer=window\.dataLayer\|\|\[\];function gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\("js",new Date\(\)\);gtag\("config","G-SWY4HV4168"\);<\/script>/g,
        /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-SWY4HV4168"><\/script>\s*\n?\s*<script>window\.dataLayer=window\.dataLayer\|\|\[\];function gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\("js",new Date\(\)\);gtag\("config","G-SWY4HV4168"\);<\/script>/g
    ];
    
    for (const pattern of oldGA4Patterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }
    
    // 2. Aggiungi nuovo GA4 dopo <head> (se non già presente)
    if (!content.includes('window.loadGA4')) {
        content = content.replace(/<head>/i, '<head>\n' + NEW_GA4_CODE);
        modified = true;
    }
    
    // 3. Aggiungi CSS del banner (se non già presente)
    if (!content.includes('.cookie-banner{')) {
        // Trova l'ultimo </style> e aggiungi prima di esso
        const styleMatch = content.match(/<\/style>/g);
        if (styleMatch) {
            const lastStyleIndex = content.lastIndexOf('</style>');
            content = content.slice(0, lastStyleIndex) + COOKIE_CSS + '\n    </style>' + content.slice(lastStyleIndex + 8);
            modified = true;
        }
    }
    
    // 4. Aggiungi banner HTML prima di </body> (se non già presente)
    if (!content.includes('id="cookie-banner"')) {
        const bannerHTML = getBannerHTML(lang);
        content = content.replace(/<\/body>/i, bannerHTML + '\n</body>');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    
    return false;
}

// Main
console.log('🍪 Aggiornamento Cookie Banner + GA4');
console.log('=====================================\n');

// Backup
const backupDir = path.join(ROOT_DIR, '..', `alghero-backup-${Date.now()}`);
console.log(`📦 Creando backup in: ${backupDir}`);
fs.cpSync(ROOT_DIR, backupDir, { recursive: true, filter: (src) => !src.includes('node_modules') && !src.includes('.git') });
console.log('✅ Backup completato\n');

// Trova e aggiorna file
const htmlFiles = findHTMLFiles(ROOT_DIR);
console.log(`📄 Trovati ${htmlFiles.length} file HTML\n`);

let updated = 0;
let skipped = 0;

for (const file of htmlFiles) {
    const relativePath = path.relative(ROOT_DIR, file);
    
    try {
        if (updateFile(file)) {
            console.log(`  ✅ ${relativePath}`);
            updated++;
        } else {
            console.log(`  ⏭️  ${relativePath} (già aggiornato)`);
            skipped++;
        }
    } catch (error) {
        console.log(`  ❌ ${relativePath}: ${error.message}`);
    }
}

console.log('\n=====================================');
console.log(`✅ Aggiornati: ${updated} file`);
console.log(`⏭️  Saltati: ${skipped} file`);
console.log(`📦 Backup in: ${backupDir}`);
console.log('\n🚀 Ora puoi fare: git add -A && git commit -m "Add cookie banner" && git push');
