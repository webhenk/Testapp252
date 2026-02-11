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

## Deployment auf Render.com

Dieses Repo enthält alles, damit die App als Render Web Service automatisch deployed wird:

- `Dockerfile`: Baut ein leichtgewichtiges Image und startet einen Webserver auf `$PORT`
- `render.yaml`: Blueprint für einen Render Web Service mit `runtime: docker` und `autoDeploy: true`

### Option A: Blueprint (empfohlen)

1. Repository zu GitHub pushen.
2. In Render auf **New +** → **Blueprint** klicken.
3. Das Repository auswählen.
4. Render erkennt die `render.yaml` und legt den Web Service automatisch an.
5. Jeder Push auf den Standard-Branch triggert ein automatisches Redeploy.

### Option B: Manuell als Docker Web Service

1. In Render auf **New +** → **Web Service** klicken.
2. Repository auswählen.
3. Bei Runtime **Docker** verwenden.
4. Erstellen – Render baut das Image aus dem `Dockerfile`.

Nach dem Deploy ist die App über die von Render bereitgestellte URL erreichbar.
