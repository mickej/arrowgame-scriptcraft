# arrowgame-scriptcraft

A minigame written in ScriptCraft for http://vaxjo.coderdojo.se/

![2014-01-26_22 07 43-638x300](https://cloud.githubusercontent.com/assets/4598641/6432951/421aa4d6-c063-11e4-8fcd-06e43d77fb6d.png)

In this guide we'll create a target to shoot to get different scores, depending on what target block is hit.
Keep in mind that it's really useful to have had a look at the JavaScript guides before diving into this.

## Creating a target

First we want to build the target &ndash; I thought a path leading to the target might be cool.
Start by creating a file named target.js in ScriptCraft's plugin folder.
Then we'll create a function accepting one parameter telling how long the path leading up to the target should be.
The path is done with the `box`function and the target with `arc`. The target consists of wool in various colors.

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

När skriptet är tillagt är det möjligt att skapa piltavlan genom att anropa funktionen `piltavla` inne i Minecraft. Det görs genom att skriva `/js piltavla(20)` i chatten.

## Pil träffar tavlan

Nu ska vi använda oss av events, händelser, som skickas mellan funktioner i ett program. Detta används flitigt i Scratch. Ta detta exemplet:

![scratch_event](https://cloud.githubusercontent.com/assets/4598641/6432954/446533be-c063-11e4-9f3d-db7df911d5a1.png)

Här är mellanslag ett event som skickas från Scratch när man trycker på mellanslag. Jag har även skapat ett eget event som heter `ett event` och det skickas när man trycker på mellanslag. Det är så event funkar, de skickas och alla kan fånga upp dem.

Vi ska nu göra en funktion som listar ut vilket block som träffas av en pil och om det är något av blocken i piltavlan så ska spelaren som sköt pilen få poäng. När ett block träffas av en pil skickar ScriptCraft ett event som heter `projectileHit`. Med hjälp av det ska vi lista ut vilket block som träffades och om det var något av blocken i vår piltavla. Detta kan göras i samma fil som du gjorde innan, men jag valde att ha det i en ny fil som jag kallade `pil_events.js`.

### Vilket block träffas?

Vi börjar med att göra funktionen som tar fram det block som träffades.
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

## Spara poäng

För att kunna spara poäng för spelarna så behöver vi en variabel. I denna variabel kommer spelare sparas ungefär så här:
```javascript
spelare1 -> 3
spelare2 -> 6
```

Så här ser koden ut.
```javascript
// Detta är vår variabel som sparar poängen
var scores = {}
```

## Hitta träffat block och ge poäng

Nu är det då dags för koden som anropas när eventet `projectileHit` skickas. Vi använder oss av funktionen vi skrev innan för att hitta blocket som träffades och variabeln `scores` för att spara poäng om spelaren träffade rätt block.

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

`dartScores` är en funktion för att skriva ut alla poängen till chattfönstret. `echo` skriver ut en rad i chatten och vi anropar den i en loop för varje spelare som finns i variabeln `scores`.
