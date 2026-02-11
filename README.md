# Arcade Asteroids (Frontend-only)

Ein kleines 2D Browser-Spiel im Arcade-Look: Du steuerst ein Raumschiff mit den Pfeiltasten, schießt Asteroiden mit der Space-Taste ab und sammelst Punkte für den Highscore.

## Starten

Öffne `index.html` direkt im Browser **oder** starte einen lokalen Webserver:

```bash
python3 -m http.server 8000
```

Dann im Browser: `http://localhost:8000`

## Steuerung

- `← → ↑ ↓`: Bewegung
- `Space`: Schießen
- `R`: Neustart nach Game Over

## Technik

- Reines Frontend (HTML, CSS, JavaScript)
- Rendering über das HTML5 Canvas API
- Highscore wird lokal im Browser (`localStorage`) gespeichert
