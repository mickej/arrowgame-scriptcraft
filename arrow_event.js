'use strict';
var blocks = require('blocks');
var utils = require('utils');

// This is our score keeping variable
var scores = {}

// Function for displaying the score. Call it by typing "/js dartScores()" in the chat.
exports.dartScores = function() {
  for (var player in scores) {
    echo(player + " -> " + scores[player]);
  }
}

function isWoolly(block) {
    return block.typeId === blocks.wool.white; // This is the main type, according to blocks.js
}

// Function to find out which block was hit. Far from good, but good enough for now. We need to find a better solution.
// This is needed since the block returned by the projectileHit event is the block containing the arrow
// and that is usually air, but we want the color of the wool
var findHitBlock = function(location) {
  var x = Math.floor(location.x);
  var y = Math.floor(location.y); 
  var z = Math.floor(location.z);
  var block = location.world.getBlockAt(x, y, z);

  // First, try the block reported as hit
  if (isWoolly(block)) {
    return block;
  }

  for (var i = 1; i <= 3; i++) {
    block = location.world.getBlockAt(location.x + i, location.y, location.z);
    if (isWoolly(block)) {
      return block;
    }

    block = location.world.getBlockAt(location.x - i, location.y, location.z);
    if (isWoolly(block)) {
      return block;
    }
	
    block = location.world.getBlockAt(location.x, location.y + i, location.z);
    if (isWoolly(block)) {
      return block;
    }

    block = location.world.getBlockAt(location.x, location.y - i, location.z);
    if (isWoolly(block)) {
      return block;
    }
	
    block = location.world.getBlockAt(location.x, location.y, location.z + i);
    if (isWoolly(block)) {
      return block;
    }
	
    block = location.world.getBlockAt(location.x, location.y, location.z - i);
    if (isWoolly(block)) {
      return block;
    }
  }
} // findHitBlock

// This is the code called when an arrow hits a block.
// We want to find out which block was hit and award points to the player firing the arrow.
events.projectileHit( function (event) {
  var projectile = event.projectile,
    shooter = projectile.owner,
	loc = projectile.location;
	
  var block = utils.blockAt(loc);
   
  var blockHit = findHitBlock(loc);
  if ( blockHit === undefined ) {
    return;
  }
  // The color that was hit is in the "data" attribute (see the BlockType API for details)
  var dataValue = blockHit.typeId;
  if (blockHit.data !== 0) {
     dataValue += ':' + blockHit.data; // for example, 35:14
  }
  
  // Add the player to the scores list if it's not already in there
  if (scores[shooter.name] === undefined) {
    scores[shooter.name] = 0;
  }

  // Here, we find out what color was hit and score accordingly
  if (dataValue === blocks.wool.yellow) {
    scores[shooter.name] += 1;
  } else if (dataValue === blocks.wool.red) {
    scores[shooter.name] += 2;
  } else if (dataValue === blocks.wool.white) {
    scores[shooter.name] += 4;
  } else if (dataValue === blocks.wool.black) {
    scores[shooter.name] += 8;
  }
  echo(shooter, "New score: " + scores[shooter.name]);
});

// CanaryMod BlockType: http://docs.visualillusionsent.net/CanaryLib/1.0-RC-3/net/canarymod/api/world/blocks/BlockType.html
// Test: CanaryMod 1.2 (Minecraft 1.8), ScriptCraft 3.1.2

