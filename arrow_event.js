'use strict';
var blocks = require('blocks');
var utils = require('utils');

// Detta är vår variabel som sparar poängen
var scores = {}

// Funktion för att hämta poängen. Anropa genom att skriva "/js dartScores()" i chatten.
exports.dartScores = function() {
  for (var player in scores) {
    echo(player + " -> " + scores[player]);
  }
}

function isWoolly(block) {
    return block.typeId === blocks.wool.white; // framgår av blocks.js att detta är huvudtypen
}

// Funktion för att hitta vilket block som träffades. Långt ifrån bra, men får duga så länge. Vi får försöka hitta en bättre lösning :)
// Detta behövs för att blocket man får ut av händelsen projectileHit är blocket som pilen befinner sig inuti
// och det är oftast luft, men vi vill veta färgen på ullen.
var findHitBlock = function(location) {
  var x = Math.floor(location.x);
  var y = Math.floor(location.y); 
  var z = Math.floor(location.z);
  var block = location.world.getBlockAt(x, y, z);

  // Träffpunkten först
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

// Detta är koden som anropas när en pil träffar ett block.
// Vi ska lista ut vilket block som träffades och ge poäng till spelaren som sköt iväg pilen.
events.projectileHit( function (event) {
  var projectile = event.projectile,
    shooter = projectile.owner,
	loc = projectile.location;
	
  var block = utils.blockAt(loc);
   
  var blockHit = findHitBlock(loc);
  if ( blockHit === undefined ) {
    return;
  }
  // Den färg som blev träffad finns i attributet "data" (mer info i API:et för BlockType)
  var dataValue = blockHit.typeId;
  if (blockHit.data !== 0) {
     dataValue += ':' + blockHit.data; // t.ex. 35:14
  }
  
  // Lägg till spelaren till poänglistan om den inte redan är där
  if (scores[shooter.name] === undefined) {
    scores[shooter.name] = 0;
  }

  // Här listar vi ut vilken färg vi träffade och ger poäng där efter
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

