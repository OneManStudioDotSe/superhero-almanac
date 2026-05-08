# HEROVERSE - Superhero Database

A web application to explore 563+ superheroes and villains from the multiverse.

## Features

- Browse heroes in grid or table view
- Search by name
- Filter by publisher, alignment (good/bad/neutral), and gender
- View detailed hero profiles with power stats
- Save favorites (persisted in localStorage)
- Compare up to 4 heroes side-by-side
- Responsive design with animations

## Running the Project

### Option 1: Python (recommended)

```bash
cd superhero-website
python3 -m http.server 8080
```

Then open http://localhost:8080

### Option 2: Node.js (npx)

```bash
cd superhero-website
npx serve
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Open directly

Simply open `index.html` in your browser (some features may be limited due to CORS).

## Tech Stack

- Vanilla JavaScript (ES6+)
- Bulma CSS Framework
- Font Awesome Icons
- Google Fonts (Bebas Neue, Space Grotesk)

## API

Data from [Superhero API](https://akabab.github.io/superhero-api/)

## Project Structure

```
superhero-website/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── api.js        # API fetch + caching
│   ├── app.js        # Main initialization
│   ├── compare.js    # Compare feature
│   ├── details.js    # Hero detail modal
│   ├── favorites.js  # Favorites feature
│   ├── filters.js    # Search/filter logic
│   └── heroes.js     # Grid/table rendering
└── docs/
    └── android-integration-guide.md
```
