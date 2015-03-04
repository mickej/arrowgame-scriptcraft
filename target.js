'use strict';
/*global blocks,drone,require*/
/*jslint indent:2*/
var Drone = require('drone');

// Skapar en väg med en piltavla vid slutet av vägen.
// Anropas genom att skriva "/js piltavla(20)" i chatten.
function target(leng) {
  leng = leng || 20;
  // We're a drone
  var drone = this,
    colors,
    i,
    bm;

  // Create the starting point to shoot from
  drone.box(blocks.gold, 3, 1, 1);
  drone.fwd();

  // Create the path to the target
  drone.box(blocks.iron, 3, 1, leng - 1);
  drone.fwd(leng - 1);
  drone.left(2);
  drone.up(1);

  // Now let's make the target. It's a bit more involved
  // Start by listing which colors it should consist of
  colors = [blocks.wool.yellow, blocks.wool.red, blocks.wool.white, blocks.wool.black];
  for (i = 0; i < colors.length; i += 1) {
    bm = drone.getBlockIdAndMeta(colors[i]);
    drone.arc({
      blockType: bm[0],
      meta: bm[1],
      radius: 3 - i,
      strokeWidth: 1,
      quadrants: {topright: true,
                  topleft: true,
                  bottomright: true,
                  bottomleft: true},
      orientation: 'vertical'
    }).right().up();
  }
}

Drone.extend(target);

// Test: CanaryMod 1.2 (Minecraft 1.8), ScriptCraft 3.1.3
