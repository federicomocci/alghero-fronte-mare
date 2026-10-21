/**
 * Selettore lingua - Alghero Fronte Mare
 * Apre e chiude il menu con click/tap e da tastiera (Esc chiude).
 * Con il mouse il menu si apre anche passandoci sopra (via CSS).
 *
 * Uso nella pagina:
 *   <div class="lang-dropdown">
 *     <button type="button" class="lang-dropdown__toggle" aria-expanded="false">…</button>
 *     <div class="lang-dropdown__menu">…link…</div>
 *   </div>
 *   <script src="/selettore-lingua.js" defer></script>
 */

(() => {
    document.querySelectorAll('.lang-dropdown').forEach((box) => {
        const toggle = box.querySelector('.lang-dropdown__toggle');
        if (!toggle) return;

        const setOpen = (open) => {
            box.classList.toggle('lang-dropdown--open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        toggle.addEventListener('click', () => {
            setOpen(!box.classList.contains('lang-dropdown--open'));
        });

        document.addEventListener('click', (e) => {
            if (!box.contains(e.target)) setOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && box.classList.contains('lang-dropdown--open')) {
                setOpen(false);
                toggle.focus();
            }
        });
    });
})();
