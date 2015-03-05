# arrowgame-scriptcraft

A minigame written in ScriptCraft for http://vaxjo.coderdojo.se/

![2014-01-26_22 07 43-638x300](https://cloud.githubusercontent.com/assets/4598641/6432951/421aa4d6-c063-11e4-8fcd-06e43d77fb6d.png)

In this guide we'll create a target to shoot to get different scores, depending on what target block is hit.
Keep in mind that it's really useful to have had a look at the JavaScript guides before diving into this.

## Creating a target

First we want to build the target &ndash; I thought a path leading to the target might be cool.
Start by creating a file named target.js in ScriptCraft's plugin folder.
Then we'll create a function accepting one parameter telling how long the path leading up to the target should be.
The path is made with the `box`function and the target with `arc`. The target consists of wool in various colors.

TODO:code
```javascript
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
  for (var i = 0;i < colors.length; i += 1) {
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
```

When the script has been added, it is possible to create the target by calling the `target` function from within Minecraft. This is done by typing `/js target(20)` in the chat.

## An arrow hits the target

No we'll use events send between functions in a program. This is often used in Scratch. Taking this example,

![croppercapture 11](https://cloud.githubusercontent.com/assets/4598641/6501101/63f5e9b8-c314-11e4-918f-f5fe3ad51fc4.png)

Here, `space` is an event sent by Scratch when you press the space bar. In addition, I have created my own event called `an event` which is sent when the space bar is pressed. That's how events work; they can be sent and anyone can catch them.

We will no create a function to find out which block is hit by an arrow and if it is one of the blocks in target, the shooter of the arrow should get a score. When a block is hit by an arrow, ScriptCraft sends an event called `projectileHit`. Using that, we will find out which block was hit and it i was one of the blocks in our target. This can be done in the same file as you created efore, however, I chose to put it in a new file called `arrow_event.js`.

### Which block was hit?

We start by creating the function finding which block was hit.

TODO:code
```javascript
function isWoolly(block) {
    return block.typeId === blocks.wool.white; // framgår av blocks.js att detta är huvudtypen
}

// Funktion för att hitta vilket block som träffades. Långt ifrån bra, men får duga så länge.
// Vi får försöka hitta en bättre lösning :)
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
```

## Keeping a tab on the scores

To save the players' scores, we need a variable. This variable will store players in this fashion:
```javascript
spelare1 -> 3
spelare2 -> 6
```

This is what the code looks like.

TODO:code
```javascript
// Detta är vår variabel som sparar poängen
var scores = {}
```

## Find the block hit and award points

Now it's finally time for the code called when the `projectileHit` event is sent.
We use the function we wrote before to find the block hit and the `scores` variable to save the score if the player hit the right block.

```javascript
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
```

`dartScores` is a function for printing all scores in the chat. `echo` prints a line in the chat and we call it in a loop for each player saved in the `scores` variable.
