/**
 * Calendario Disponibilità - Alghero Fronte Mare
 * Mostra le date occupate/libere per ogni appartamento.
 * La lingua viene presa da <html lang="..."> (it, en, de, fr, es).
 *
 * Uso nella pagina:
 *   <div id="calendario-disponibilita" data-appartamento="alghero-fronte-mare"></div>
 *   <script src="/calendario-disponibilita.js" defer></script>
 */

(() => {
    const SUPABASE_URL = 'https://shnwkepqoivdiwtuncna.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobndrZXBxb2l2ZGl3dHVuY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTQwOTUsImV4cCI6MjA4MjMzMDA5NX0.ImH1ozQaNXHQozvCchI9shfr7FINYfT33Jm6jznBJqg';

    // Mapping ID appartamenti -> pagine sito
    const APPARTAMENTI = {
        'alghero-fronte-mare': '2fc80ddd-3898-444f-bf98-40a7eb641cee',
        'alghero-sopra-il-mare': '79d5e98c-4f22-4686-a43b-53300ab75271',
        'orti-36-sea-suite': '82ab5050-54f1-4821-a80f-7b1ec0a61682',
        'orti-36-sky-suite': '1950c5b5-ec4d-4b1d-b13b-1eff93ce0511',
        'attico-vista-mare': 'c33fd913-c8bd-4ea5-95bc-2ff7d1c71404'
    };

    // Testi per lingua (settimana da lunedì)
    const TESTI = {
        it: {
            mesi: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                   'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
            caricamento: 'Caricamento disponibilità...',
            precedente: 'Mese precedente',
            successivo: 'Mese successivo',
            libero: 'Libero',
            occupato: 'Occupato',
            errore: 'Non riesco a caricare il calendario in questo momento. Scrivimi su WhatsApp e ti dico subito se le tue date sono libere.'
        },
        en: {
            mesi: ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'],
            giorni: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            caricamento: 'Loading availability...',
            precedente: 'Previous month',
            successivo: 'Next month',
            libero: 'Available',
            occupato: 'Booked',
            errore: "I can't load the calendar right now. Message me on WhatsApp and I'll tell you straight away if your dates are free."
        },
        de: {
            mesi: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                   'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            giorni: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
            caricamento: 'Verfügbarkeit wird geladen...',
            precedente: 'Vorheriger Monat',
            successivo: 'Nächster Monat',
            libero: 'Frei',
            occupato: 'Belegt',
            errore: 'Der Kalender kann gerade nicht geladen werden. Schreib mir auf WhatsApp und ich sage dir sofort, ob deine Daten frei sind.'
        },
        fr: {
            mesi: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            giorni: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            caricamento: 'Chargement des disponibilités...',
            precedente: 'Mois précédent',
            successivo: 'Mois suivant',
            libero: 'Libre',
            occupato: 'Réservé',
            errore: 'Impossible de charger le calendrier pour le moment. Écrivez-moi sur WhatsApp et je vous dis tout de suite si vos dates sont libres.'
        },
        es: {
            mesi: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            giorni: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            caricamento: 'Cargando disponibilidad...',
            precedente: 'Mes anterior',
            successivo: 'Mes siguiente',
            libero: 'Libre',
            occupato: 'Ocupado',
            errore: 'No puedo cargar el calendario en este momento. Escríbeme por WhatsApp y te digo enseguida si tus fechas están libres.'
        }
    };

    class CalendarioDisponibilita {
        constructor(containerId, appartamentoSlug) {
            this.container = document.getElementById(containerId);
            this.appartamentoId = APPARTAMENTI[appartamentoSlug];
            this.testi = TESTI[(document.documentElement.lang || 'it').slice(0, 2)] || TESTI.it;
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
            if (await this.fetchPrenotazioni()) {
                this.render();
            } else {
                // Meglio un messaggio che un calendario tutto "libero" non vero
                this.renderErrore();
            }
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
                return true;
            } catch (error) {
                console.error('Errore fetch prenotazioni:', error);
                this.prenotazioni = [];
                return false;
            }
        }

        isDateOccupata(date) {
            const dateStr = this.formatDate(date);

            // La notte del check-in è occupata, il giorno del check-out è di nuovo libero
            return this.prenotazioni.some(p => {
                return dateStr >= p.data_checkin && dateStr < p.data_checkout;
            });
        }

        // Data locale in formato AAAA-MM-GG. Non usare toISOString(): converte in UTC
        // e in Italia sposterebbe tutte le date indietro di un giorno.
        formatDate(date) {
            const mese = String(date.getMonth() + 1).padStart(2, '0');
            const giorno = String(date.getDate()).padStart(2, '0');
            return `${date.getFullYear()}-${mese}-${giorno}`;
        }

        renderLoading() {
            this.container.innerHTML = `
                <div class="cal-loading">
                    <p>${this.testi.caricamento}</p>
                </div>
            `;
        }

        renderErrore() {
            this.container.innerHTML = `
                <div class="cal-wrapper">
                    <p class="cal-errore">${this.testi.errore}</p>
                </div>
            `;
        }

        render() {
            const t = this.testi;
            const html = `
                <div class="cal-wrapper">
                    <div class="cal-header">
                        <button class="cal-nav cal-prev" aria-label="${t.precedente}">←</button>
                        <span class="cal-title">${t.mesi[this.meseCorrente.getMonth()]} ${this.meseCorrente.getFullYear()}</span>
                        <button class="cal-nav cal-next" aria-label="${t.successivo}">→</button>
                    </div>
                    <div class="cal-grid">
                        ${this.renderGiorni()}
                        ${this.renderDate()}
                    </div>
                    <div class="cal-legenda">
                        <span class="cal-legenda-item"><span class="cal-dot cal-dot--libero"></span> ${t.libero}</span>
                        <span class="cal-legenda-item"><span class="cal-dot cal-dot--occupato"></span> ${t.occupato}</span>
                    </div>
                </div>
            `;

            this.container.innerHTML = html;
            this.attachEvents();
        }

        renderGiorni() {
            return this.testi.giorni.map(g => `<div class="cal-giorno">${g}</div>`).join('');
        }

        renderDate() {
            const anno = this.meseCorrente.getFullYear();
            const mese = this.meseCorrente.getMonth();

            const primoGiorno = new Date(anno, mese, 1);
            const ultimoGiorno = new Date(anno, mese + 1, 0);
            const oggiStr = this.formatDate(this.oggi);

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
                const dataStr = this.formatDate(data);
                const isPassato = dataStr < oggiStr;
                const isOccupato = this.isDateOccupata(data);
                const isOggi = dataStr === oggiStr;

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
    function avvia() {
        const container = document.getElementById('calendario-disponibilita');
        if (container) {
            const slug = container.dataset.appartamento;
            if (slug) {
                new CalendarioDisponibilita('calendario-disponibilita', slug);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', avvia);
    } else {
        avvia();
    }
})();
