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
    this.load.image('fogHarborPathTiles', 'assets/tilemaps/fog-harbor-path.png');
    this.load.image('fogHarborTreeTiles', 'assets/tilemaps/fog-harbor-trees.png');
    this.load.image('detectiveOfficeMap', 'assets/tilemaps/detective-office.png');
    this.load.image('policeStationMap', 'assets/tilemaps/police-station.png');
    this.load.image('backAlleyMap', 'assets/tilemaps/back-alley.png');
    // Tiled object-layer geometry; the forest image is still rendered separately.
    this.load.json('backAlleyCollisionMap', 'assets/tilemaps/source-back-alley/Back alley.tmj');
    this.load.json('officeCollisionMap', 'assets/tilemaps/source-detective-office/detective office.tmj');
    this.load.json('stationCollisionMap', 'assets/tilemaps/source-police-station/police station.tmj');
    this.load.json('manorCollisionMap', 'assets/tilemaps/source-old-manor/old manor.tmj');
    this.load.json('townCollisionMap', 'assets/tilemaps/source-town-square/Fog Harbor Town Collision Source.tmj');
    this.load.image('oldManorMap', 'assets/tilemaps/old-manor.png');
    TEXTURE_ATLAS_ASSETS.forEach((asset) => {
      this.load.atlas(asset.assetKey, asset.textureURL, asset.atlasURL);
    });
  }

  create() {
    this.scene.start(SCENE_KEYS.GAME_SCENE);
  }
}
