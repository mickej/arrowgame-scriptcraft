'use strict';
var Drone = require('drone');

// Skapar en väg med en piltavla vid slutet av vägen.
// Anropas genom att skriva "/js piltavla(20)" i chatten.
function piltavla(leng) {
  leng = leng || 20;
  // Vi är redan en drone
  var drone = this;

  // Skapa startplats, där man ska skjuta ifrån
  drone.box(blocks.gold, 3, 1, 1);
  drone.fwd();

  // Skapa vägen fram till piltavlan
  drone.box(blocks.iron, 3, 1, leng - 1);
  drone.fwd(leng - 1);
  drone.left(2);
  drone.up(1);

  // Nu ska vi göra piltavlan. Den är lite mer avancerad
  // Börja med att ange vilka färger den ska bestå av
  var colors = [blocks.wool.yellow, blocks.wool.red, blocks.wool.white, blocks.wool.black];
  for (var i = 0; i < colors.length; i += 1) {
    var bm = drone.getBlockIdAndMeta(colors[i]);
    drone.arc({
        blockType: bm[0],
        meta: bm[1],
        radius: 3 - i,
        strokeWidth: 1,
        quadrants: {topright: true,
                    topleft: true,
                    bottomright: true,
                    bottomleft: true},
        orientation: 'vertical'}).right().up();
  }
}

Drone.extend(piltavla);

// Test: CanaryMod 1.2 (Minecraft 1.8), ScriptCraft 3.1.2
