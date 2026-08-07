# Schewz Media — Website

Offizielle Website von Schewz Media: Videoproduktion & Marketing für Marken im gesamten DACH-Raum.

Statische Website, gebaut mit reinem HTML, CSS und Vanilla JavaScript — kein Build-Prozess, keine Abhängigkeiten.

## Seitenstruktur

| Seite | Datei |
|---|---|
| Start | `index.html` |
| Videografie | `videografie.html` |
| Marketing | `marketing.html` |
| Portfolio | `portfolio.html` |
| Über uns | `ueber-uns.html` |
| Kontakt | `kontakt.html` |
| Impressum | `impressum.html` |
| Datenschutz | `datenschutz.html` |

## Projektstruktur

```
website-code/
├── index.html
├── videografie.html
├── marketing.html
├── portfolio.html
├── ueber-uns.html
├── kontakt.html
├── impressum.html
├── datenschutz.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    ├── img/       Bilder & Poster-Grafiken
    ├── logos/     Kunden-/Partnerlogos
    └── video/     Hero- und Portfolio-Videos (Hochformat/Social-Media-Format)
```

## Lokal ansehen

Kein Server nötig — einfach eine beliebige `.html`-Datei im Ordner per Doppelklick im Browser öffnen.

Für eine lokale Vorschau mit Server (z. B. für relative Pfade beim Testen):

```bash
cd website-code
python3 -m http.server 8000
```

Danach im Browser `http://localhost:8000` öffnen.

## Deployment (GitHub Pages)

1. Repository-Settings → **Pages**
2. Unter **Source** den Branch `main` und Ordner `/ (root)` auswählen
3. Speichern — die Seite ist nach kurzer Zeit unter `https://<username>.github.io/<repo-name>/` live

## Tech-Stack

- HTML5 / CSS3 (eigenes Design-System, keine Frameworks)
- Vanilla JavaScript (Scroll-Reveal, Navigation, Kontaktformular, Marquee-Logoleiste)
- Google Fonts: Inter, Fredoka

## Lizenz

Siehe [LICENSE](./LICENSE) — alle Rechte vorbehalten.
