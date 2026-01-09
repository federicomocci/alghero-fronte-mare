/**
 * Calendario Disponibilità - Alghero Fronte Mare
 * Mostra le date occupate/libere per ogni appartamento
 */

const SUPABASE_URL = 'https://shnwkepqoivdiwtuncna.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobndrZXBxb2l2ZGl3dHVuY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTQwOTUsImV4cCI6MjA4MjMzMDA5NX0.ImH1ozQaNXHQozvCchI9shfr7FINYfT33Jm6jznBJqg';

// Mapping ID appartamenti -> pagine sito
const APPARTAMENTI = {
    'lido-113-fronte-mare': '2fc80ddd-3898-444f-bf98-40a7eb641cee',
    'lido-113-loft': '79d5e98c-4f22-4686-a43b-53300ab75271',
    'orti-36-sea-suite': '82ab5050-54f1-4821-a80f-7b1ec0a61682',
    'orti-36-sky-suite': '1950c5b5-ec4d-4b1d-b13b-1eff93ce0511',
    'attico-vista-mare': 'c33fd913-c8bd-4ea5-95bc-2ff7d1c71404'
};

const MESI_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const GIORNI_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

class CalendarioDisponibilita {
    constructor(containerId, appartamentoSlug) {
        this.container = document.getElementById(containerId);
        this.appartamentoId = APPARTAMENTI[appartamentoSlug];
        this.oggi = new Date();
        this.meseCorrente = new Date(this.oggi.getFullYear(), this.oggi.getMonth(), 1);
        this.prenotazioni = [];
        
        if (!this.container) {
            console.error('Container non trovato:', containerId);
            return;
        }
        
        if (!this.appartamentoId) {
            console.error('Appartamento non trovato:', appartamentoSlug);
            return;
        }
        
        this.init();
    }
    
    async init() {
        this.renderLoading();
        await this.fetchPrenotazioni();
        this.render();
    }
    
    async fetchPrenotazioni() {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/disponibilita_pubblica?appartamento_id=eq.${this.appartamentoId}&select=data_checkin,data_checkout`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Errore nel caricamento');
            
            this.prenotazioni = await response.json();
        } catch (error) {
            console.error('Errore fetch prenotazioni:', error);
            this.prenotazioni = [];
        }
    }
    
    isDateOccupata(date) {
        const dateStr = this.formatDate(date);
        
        return this.prenotazioni.some(p => {
            return dateStr >= p.data_checkin && dateStr < p.data_checkout;
        });
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    renderLoading() {
        this.container.innerHTML = `
            <div class="cal-loading">
                <p>Caricamento disponibilità...</p>
            </div>
        `;
    }
    
    render() {
        const html = `
            <div class="cal-wrapper">
                <div class="cal-header">
                    <button class="cal-nav cal-prev" aria-label="Mese precedente">←</button>
                    <span class="cal-title">${MESI_IT[this.meseCorrente.getMonth()]} ${this.meseCorrente.getFullYear()}</span>
                    <button class="cal-nav cal-next" aria-label="Mese successivo">→</button>
                </div>
                <div class="cal-grid">
                    ${this.renderGiorni()}
                    ${this.renderDate()}
                </div>
                <div class="cal-legenda">
                    <span class="cal-legenda-item"><span class="cal-dot cal-dot--libero"></span> Libero</span>
                    <span class="cal-legenda-item"><span class="cal-dot cal-dot--occupato"></span> Occupato</span>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.attachEvents();
    }
    
    renderGiorni() {
        return GIORNI_IT.map(g => `<div class="cal-giorno">${g}</div>`).join('');
    }
    
    renderDate() {
        const anno = this.meseCorrente.getFullYear();
        const mese = this.meseCorrente.getMonth();
        
        const primoGiorno = new Date(anno, mese, 1);
        const ultimoGiorno = new Date(anno, mese + 1, 0);
        
        // Giorno della settimana del primo giorno (0 = Dom, 1 = Lun, ...)
        // Convertiamo per avere Lunedì = 0
        let giornoInizio = primoGiorno.getDay() - 1;
        if (giornoInizio < 0) giornoInizio = 6;
        
        let html = '';
        
        // Celle vuote prima del primo giorno
        for (let i = 0; i < giornoInizio; i++) {
            html += '<div class="cal-cella cal-cella--vuota"></div>';
        }
        
        // Giorni del mese
        for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) {
            const data = new Date(anno, mese, giorno);
            const isPassato = data < new Date(this.oggi.getFullYear(), this.oggi.getMonth(), this.oggi.getDate());
            const isOccupato = this.isDateOccupata(data);
            const isOggi = this.formatDate(data) === this.formatDate(this.oggi);
            
            let classi = 'cal-cella';
            if (isPassato) classi += ' cal-cella--passato';
            else if (isOccupato) classi += ' cal-cella--occupato';
            else classi += ' cal-cella--libero';
            if (isOggi) classi += ' cal-cella--oggi';
            
            html += `<div class="${classi}">${giorno}</div>`;
        }
        
        return html;
    }
    
    attachEvents() {
        this.container.querySelector('.cal-prev').addEventListener('click', () => {
            this.meseCorrente.setMonth(this.meseCorrente.getMonth() - 1);
            this.render();
        });
        
        this.container.querySelector('.cal-next').addEventListener('click', () => {
            this.meseCorrente.setMonth(this.meseCorrente.getMonth() + 1);
            this.render();
        });
    }
}

// Inizializza automaticamente se trova il container
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('calendario-disponibilita');
    if (container) {
        const slug = container.dataset.appartamento;
        if (slug) {
            new CalendarioDisponibilita('calendario-disponibilita', slug);
        }
    }
});
