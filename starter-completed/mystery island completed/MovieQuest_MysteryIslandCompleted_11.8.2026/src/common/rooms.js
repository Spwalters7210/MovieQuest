// Each room has a walkable rectangle, door destinations, and investigative evidence.
// Coordinates use the 1280 x 720 Phaser canvas.
export const ROOMS = {
  square: { title:'FOG HARBOR • TOWN SQUARE', floor:0x57616a, trim:0x34404a,
    spawn:{x:640,y:565}, doors:[
      {x:235,y:220,radius:70,to:'office',spawn:{x:640,y:555},label:'Detective Office'},
      {x:1020,y:220,radius:72,to:'station',spawn:{x:640,y:555},label:'Police Station'},
      {x:615,y:90,radius:70,to:'alley',spawn:{x:640,y:550},label:'Fogwood Forest'}],
    props:[{x:380,y:440,kind:'lamp'},{x:880,y:445,kind:'lamp'},{x:640,y:380,kind:'fountain'}]},
  office:{title:'DETECTIVE OFFICE',floor:0x725e4d,trim:0x3a302e,spawn:{x:640,y:555},
    doors:[{x:640,y:690,radius:88,to:'square',spawn:{x:240,y:320},label:'Town Square'}],
    props:[{x:320,y:290,kind:'desk'},{x:930,y:300,kind:'bookshelf'}]},
  station:{title:'POLICE STATION',floor:0x526879,trim:0x293b4a,spawn:{x:640,y:555},
    doors:[{x:640,y:755,radius:78,to:'square',spawn:{x:1040,y:320},label:'Town Square'}],
    props:[{x:300,y:300,kind:'desk'},{x:920,y:290,kind:'cabinet'}]},
  alley:{title:'FOGWOOD FOREST',floor:0x414951,trim:0x212832,spawn:{x:640,y:550},
    doors:[{x:640,y:705,radius:72,to:'square',spawn:{x:565,y:240},label:'Town Square'},
      {x:1200,y:115,to:'manor',spawn:{x:640,y:555},label:'Old Manor'}],
    props:[{x:320,y:355,kind:'crate'},{x:900,y:440,kind:'lamp'}]},
  manor:{title:'OLD MANOR',floor:0x544753,trim:0x2c2532,spawn:{x:640,y:555},
    doors:[{x:640,y:690,to:'alley',spawn:{x:990,y:315},label:'Fogwood Forest'}],
    props:[{x:300,y:300,kind:'bookshelf'},{x:900,y:300,kind:'desk'}]},
};
