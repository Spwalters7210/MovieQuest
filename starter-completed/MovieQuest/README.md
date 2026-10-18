# MovieQuest

MovieQuest is my SWENG 894 capstone project. It's a browser-based detective game set in Fog Harbor. The choices you make during the investigation affect a preference profile used to recommend movies.

## Run the game

Open the project folder in VS Code and launch `index.html` using Live Server. You can also start a local server from the project folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Controls

- WASD or arrow keys: move
- E: interact
- J: open the Case Journal

## Tests

With Node.js installed, run:

```bash
npm test
```

The automated tests cover the preference profile, choice updates, movie scoring, and ranking. Gameplay and interface checks also require manual testing.

## Project files

- `src/scenes/`: Phaser scenes and game interactions
- `src/common/`: encounters, rooms, movie data, and recommendation functions
- `assets/`: sprites and Fog Harbor tilemap
- `tests/`: automated tests

## Current work

The ranking and recommendation display are working, but I plan to improve their presentation and refine the recommendations. I'm also updating the UI and interior layouts for the different locations.

The project uses a Phaser starter template as its foundation. The movie catalog and preference values are local demo data.
