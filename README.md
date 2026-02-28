# 🎾 Padel Kalender 2026

En moderne, webbaseret kalender over de vigtigste padel-turneringer i 2026. Siden dækker både den internationale **Premier Padel Tour** og de største danske begivenheder som **DPF1000**, **Lunar Ligaen** og turneringer med dansk deltagelse (**FIP - DK**).

👉 **Se kalenderen her:** [https://danielh21.github.io/padel-calendar/](https://danielh21.github.io/padel-calendar/)

## ✨ Funktioner
- **Måned-til-måned overblik**: Se alle turneringer i en overskuelig kalender.
- **Detaljeret info**: Klik på en turnering for at se lokation, beskrivelse og streaming-links.
- **Interaktiv filtrering**: Slå kategorier til/fra (f.eks. se kun danske turneringer). Dine valg gemmes automatisk.
- **Mobilvenlig**: Designet til at fungere perfekt på både desktop og mobil.

## 🤝 Bidrag til kalenderen (How to Contribute)
Vi vil gerne have så mange relevante turneringer med som muligt! Hvis du kender til en turnering eller et streaming-link, der mangler, kan du foreslå en ændring ved at redigere JSON-filen.

### Sådan gør du:
1. Find filen `src/tournaments.json`.
2. Opret en **Pull Request** med dine ændringer.

### JSON Struktur:
Data er opdelt i to sektioner: `sources` (streaming kilder) og `tournaments` (selve begivenhederne).

#### 1. Tilføj en kilde (valgfrit)
Hvis streaming-tjenesten ikke findes endnu, tilføj den til `sources`:
```json
"min_nye_kilde": {
  "label": "Kanal Navn",
  "url": "https://link-til-kanalen.dk"
}
```

#### 2. Tilføj en turnering
Tilføj et nyt objekt til `tournaments` arrayet:
```json
{
  "id": 100,
  "name": "Navn på turnering",
  "location": "By, Land",
  "category": "DPF1000",
  "start_date": "2026-03-15",
  "end_date": "2026-03-17",
  "description": "Kort beskrivelse her...",
  "streaming_link_ids": ["padel_tv", "min_nye_kilde"]
}
```

**Kategorier:** `Major`, `P1`, `P2`, `DPF1000`, `Lunar Ligaen`, `FIP - DK`, `Special`, `Finals`.

## 🛠 Teknologier
- **React** (Vite)
- **Tailwind CSS** (Styling via CDN)
- **date-fns** (Dato håndtering)
- **Lucide React** (Ikoner)
- **GitHub Actions** (Automatisk udrulning)

---
Lavet med ❤️ af danske padel entusiaster.
