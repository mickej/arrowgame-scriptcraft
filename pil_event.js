// Detta är vår variabel som sparar poängen
var scores = {}

// Funktion för att hämta poängen. Anropa genom att skriva "/js dartScores()" i chatten.
exports.dartScores = function() {
  echo("Poäng");
  for (var player in scores) {
    echo(player + " -> " + scores[player]);
  }
}

// Funktion för att hitta vilket block som träffades. Långt ifrån bra, men får duga så länge. Vi får försöka hitta en bättre lösning :)
// Detta behövs för att blocket man får ut av eventet ProjectileHitEvent är blocket som pilen befinner sig innuti
// och det är oftast luft, men vi vill veta färgen på ullen.
var findHitBlock = function(location) {
  var block = location.world.getBlockAt(location.x, location.y, location.z);
  if (block.type == 'WOOL') {
    return block;
  } else {
    for (var i = 1; i <= 3; i++) {
      block = location.world.getBlockAt(location.x + i, location.y, location.z);
      if (block.type == 'WOOL') {
	return block;
      }

      block = location.world.getBlockAt(location.x - i, location.y, location.z);
      if (block.type == 'WOOL') {
        return block;
      }
      
      block = location.world.getBlockAt(location.x, location.y, location.z + i);
      if (block.type == 'WOOL') {
	return block;
      }

      block = location.world.getBlockAt(location.x, location.y, location.z - i);
      if (block.type == 'WOOL') {
        return block;
      }

      block = location.world.getBlockAt(location.x, location.y + i, location.z);
      if (block.type == 'WOOL') {
        return block;
      }

      block = location.world.getBlockAt(location.x, location.y - i, location.z);
      if (block.type == 'WOOL') {
        return block;
      }
    }
  }
}

// Detta är koden som anropas när en pil träffar ett block.
// Vi ska lista ut vilket block som träffades och ge poäng till spelaren som sköt iväg pilen.
events.on('entity.ProjectileHitEvent', function (listener, event) {
  var loc = event.entity.location;
  var block = event.entity.location.world.getBlockAt(loc.x, loc.y, loc.z);

  // Den färg som blev träffad
  var color = findHitBlock(loc).state.data.color;

  // Lägg till spelaren till poänglistan om den inte redan är där
  if (scores[event.entity.shooter] == undefined) {
    scores[event.entity.shooter] = 0;
  }

  // Här listar vi ut vilken färg vi träffade och ger poäng där efter
  if (color == 'YELLOW') {
    scores[event.entity.shooter] += 1;
  } else if (color == 'RED') {
    scores[event.entity.shooter] += 2;
  } else if (color == 'WHITE') {
    scores[event.entity.shooter] += 4;
  } else if (color == 'BLACK') {
    scores[event.entity.shooter] += 8;
  }

  server.onlinePlayers[0].sendMessage(scores);
});
