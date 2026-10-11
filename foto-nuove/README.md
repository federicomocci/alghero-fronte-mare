# Foto nuove da caricare

Questa è la "cassetta delle lettere" per le foto nuove del sito.
**Non viene pubblicata online** (è esclusa in `.vercelignore`): le foto
vanno sul sito solo dopo essere state preparate.

## 1. Metti ogni foto nella cartella della sua casa

| Cartella | Casa |
|---|---|
| [`fronte-mare/`](fronte-mare/) | Lido 113 · Fronte Mare |
| [`loft/`](loft/) | Lido 113 · Loft |
| [`sea-suite/`](sea-suite/) | Orti 36 · Sea Suite |
| [`sky-suite/`](sky-suite/) | Orti 36 · Sky Suite |
| [`attico/`](attico/) | Attico Vista Mare |

Vanno benissimo i JPG del fotografo così come sono (se ti dà una
versione "web" più leggera, meglio quella). Non serve rinominarle.
Se vuoi scegliere tu la foto di copertina, chiamala `copertina.jpg`.

### Dal sito di GitHub (senza Terminale)

1. Apri la cartella della casa su GitHub (dalla tabella qui sopra).
2. In alto a destra: **Add file → Upload files**.
3. Trascina dentro le foto (massimo 25 MB l'una, 100 per volta).
4. In basso clicca **Commit changes**.

### Oppure dal Mac

1. Copia le foto con il Finder in
   `~/Progetti/alghero-fronte-mare/foto-nuove/<casa>/`.
2. Nel Terminale:

   ```bash
   cd ~/Progetti/alghero-fronte-mare
   git pull
   git add foto-nuove
   git commit -m "Foto nuove"
   git push
   ```

### Oppure da Google Drive

Condividi la cartella con **"Chiunque abbia il link"** e manda il link a
Claude dicendo di quale casa sono le foto. Nelle impostazioni dell'ambiente
cloud (Edit → Network access) devono essere consentiti `drive.google.com` e
`drive.usercontent.google.com`.

## 2. Avvisa Claude

Scrivi in chat qualcosa come "ho caricato le foto nuove del Loft".
Claude le converte in WebP nelle misure giuste (1600, 1200 e 800 px),
dà nomi descrittivi, le mette in `images/<casa>/`, aggiorna galleria,
copertina e anteprima WhatsApp in tutte le lingue e poi svuota questa
cartella.

## Cosa servirebbe (aggiornato all'11 ottobre 2026)

- **Loft** e **Sea Suite**: fatte (servizio fotografico nuovo, 12 e 10 foto).
- **Sky Suite**: manca la camera da letto; il soggiorno con meno oggetti
  in giro.
- **Fronte Mare**: già buone. Si possono aggiungere la spiaggia sotto
  casa, il palazzo con l'ingresso, il parcheggio, ombrellone e sedie.
- **Attico**: a posto.

Per tutte: foto orizzontali, luce naturale, letti rifatti e niente
oggetti personali, almeno una foto della vista da ogni casa.
