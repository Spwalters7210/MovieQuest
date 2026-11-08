# MovieQuest

MovieQuest is a game I'm making for my software engineering capstone project. The idea is to help people find a movie to watch by turning the usual movie quiz into a little adventure.

Right now, the game takes place in Mystery Island, where you explore Fog Harbor, investigate clues, and make choices. Your answers help build a movie preference profile, which the game uses to recommend something to watch.

## How to play

You start in Town Square and can explore the Detective Office, Police Station, Fogwood Forest, and Old Manor. Walk up to doors or clues to interact with them. As you investigate, you'll answer questions that help decide your movie recommendation.

**Controls:**

- **WASD** or **arrow keys** to move
- **E** to interact
- **J** to open the Case Journal
- **1** and **2** to choose answers when prompted

## How to run it

The easiest way is to open the project folder in VS Code and launch `index.html` with the Live Server extension.

You can also run it with Python from the project folder:

```bash
python -m http.server 8080
```

Then go to `http://localhost:8080` in your browser.

## Testing

If you have Node.js installed, run:

```bash
npm test
```

These tests check the movie preferences, scoring, and recommendations. I also test the movement and interactions by playing through the game.

## What's next

I want to keep improving the mystery experience and add more genres, like horror, comedy, and sci-fi. The plan is to reuse the main game systems while giving each genre its own story and setting.

## About the project

MovieQuest is built with JavaScript and Phaser, and I use Tiled to make the maps. The movie list and recommendation data are currently included in the project for testing. Some art comes from outside asset packs, so I've kept their original information files with the assets.
