# Oirekartoittaja

AI-pohjainen lääkärikysely sovellus, joka generoi älykkäitä oirekyselyitä ja mahdollistaa niiden helpon muokkaamisen ja jakamisen.

## Sovelluksen toiminnot

### 🏥 **Kyselyjen luominen**
- AI generoi automaattisesti lääkärikyselyitä annetun aiheen perusteella
- Tuki kahdelle kyselytyypille: yleiset terveyskyselyt ja oirekohtaiset kyselyt
- Dynaaminen kysymys-vastaus rakenne jatkokysymyksillä

### 📝 **Kysymyseditori**
- Visuaalinen editori kyselyjen muokkaamiseen
- Mahdollisuus lisätä, muokata ja poistaa kysymyksiä ja vastauksia
- Tuki jatkokysymyksille (follow-up questions)
- **Jaettujen kysymysten järjestelmä** - uusi ominaisuus!

### 🔗 **Jaetut kysymykset (Uusi!)**
- **Ongelma:** Samat kysymykset (esim. "Mitä lääkkeitä käytät säännöllisesti?") toistuvat useissa kyselyissä
- **Ratkaisu:** Keskitetty jaettujen kysymysten hallinta
- **Toiminta:**
  - Jaa kysymyksiä käytettäväksi useissa kyselyissä
  - Muokkaa yhdestä paikasta → muutokset näkyvät kaikissa kyselyissä
  - Oletuskysymykset yleisimmille lääketieteellisille aiheille

### 💾 **Tallennusominaisuudet**
- LocalStorage-pohjainen tallennus
- Kyselyjen listaus ja hallinta
- Tuonti/vienti ominaisuudet

### 🔄 **Tiedostojen käsittely**
- GraphML-tiedostojen parsinta kyselyiksi
- JSON/teksti formaattien tuki
- Batch-käsittely useille tiedostoille

## Käyttöohje

### Jaettujen kysymysten käyttö:

1. **Kysymyksen jakaminen:**
   ```
   Kysymyseditorissa → "📌 Jaa kysymys" → Kysymys tallennetaan jaettuihin
   ```

2. **Jaetun kysymyksen lisääminen:**
   ```
   "📌 Lisää jaettu kysymys" → Valitse listasta → Lisätään kyselyyn
   ```

3. **Jaetujen kysymysten hallinta:**
   ```
   Navigoi: /editor/shared → Muokkaa keskitetysti → Muutokset näkyvät kaikkialla
   ```

## Tekninen toteutus

### Jaettujen kysymysten arkkitehtuuri:
- **LocalStorage-pohjainen:** `sharedQuestions` avain
- **Keskitetty hallinta:** `/app/lib/sharedQuestions.ts`
- **Reaktiivinen päivitys:** Muutokset näkyvät reaaliaikaisesti
- **Turvallinen:** Ei vaikuta AI-scheemoihin tai generointi-API:iin

### Tekniset muutokset:
- ✅ Uusi `SharedQuestion` interface
- ✅ Jaettujen kysymysten hallinta-API
- ✅ Modal-pohjainen käyttöliittymä
- ✅ CSS-tyylit ja visuaalinen erottelu
- ✅ Keskitetty hallintasivu `/editor/shared`

## Getting Started

Käynnistä kehityspalvelin:

```bash
npm run dev
# tai
yarn dev
# tai
pnpm dev
```

Avaa [http://localhost:3000](http://localhost:3000) selaimessasi.

## Projektin rakenne

```
app/
├── editor/
│   ├── [key]/page.tsx      # Kysymyseditori
│   ├── shared/page.tsx     # Jaettujen kysymysten hallinta
│   └── page.tsx            # Kyselyjen listaus
├── lib/
│   └── sharedQuestions.ts  # Jaettujen kysymysten API
├── api/
│   └── createquestionnaire/ # AI-generointi
└── components/             # UI-komponentit
```

---

*Next.js-pohjainen sovellus joka hyödyntää OpenAI:ta älykkäiden lääkärikyselyjen generointiin.*