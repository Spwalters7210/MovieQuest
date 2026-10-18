import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { IMAGE_ASSETS, TEXTURE_ATLAS_ASSETS } from '../common/assets.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    IMAGE_ASSETS.forEach((asset) => {
      this.load.image(asset.assetKey, asset.path);
    });
    // Fog Harbor Tiled map preview (Town Square only).
    this.load.tilemapTiledJSON('fogHarborTown', 'assets/tilemaps/fog-harbor-town.json');
    this.load.image('fogHarborTiles', 'assets/tilemaps/tilemap.png');
    TEXTURE_ATLAS_ASSETS.forEach((asset) => {
      this.load.atlas(asset.assetKey, asset.textureURL, asset.atlasURL);
    });
  }

  create() {
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }
}
