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

```javascript
var Drone = require('drone');

// Creates a path with a target at the far end
// Invoke by typing "/js target(20)" in the chat
function target(leng) {
  leng = leng || 20;
  var drone = this, // We're extending a drone
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
```

When the script has been added, it is possible to create the target by calling the `target` function from within Minecraft. This is done by typing `/js target(20)` in the chat.

## Exploring the target
![2015-03-07_10 09 36](https://cloud.githubusercontent.com/assets/4598641/6540878/473d919c-c4b6-11e4-881e-2286a708aa1b.png)

Walk up to the target.

Press F3 in the chat to see the debug screen which includes your coordinates, both where you are standing (XYZ) and what you are looking at. In the screenshot, I am standing at *222.320, 63, 100.599* ("XYZ"), looking at *219, 64, 100* ("Looking at")

Typing `/js var b=self.world.getBlockAt(219, 64, 100)` gives me a variable `b` with the block I'm looking at.

`/js b` shows details of the block. Try it on your own!

`/js b.typeId` gives "35", which is blocks.wool.white (35). But, since wool has a color we also need to check 
`/js b.data` which gives us "14". This is blocks.wool.red, which you can verify by typing `/js blocks.wool.red`

## An arrow hits the target

No we'll use events send between functions in a program. This is often used in Scratch. Taking this example,

![croppercapture 11](https://cloud.githubusercontent.com/assets/4598641/6501101/63f5e9b8-c314-11e4-918f-f5fe3ad51fc4.png)

Here, `space` is an event sent by Scratch when you press the space bar. In addition, I have created my own event called `an event` which is sent when the space bar is pressed. That's how events work; they can be sent and anyone can catch them.

We will no create a function to find out which block is hit by an arrow and if it is one of the blocks in target, the shooter of the arrow should get a score. When a block is hit by an arrow, ScriptCraft sends an event called `projectileHit`. Using that, we will find out which block was hit and it i was one of the blocks in our target. This can be done in the same file as you created efore, however, I chose to put it in a new file called `arrow_event.js`.

### Which block was hit?

We start by creating the function finding which block was hit.

```javascript
function isWoolly(block) {
  return block.typeId === blocks.wool.white; // This is the main type, according to blocks.js
}

// Function to find out which block was hit. Far from good, but good enough for now. We need to find a better solution.
// This is needed since the block returned by the projectileHit event is the block containing the arrow
// and that is usually air, but we want the color of the wool
var findHitBlock = function (location) {
  var x = Math.floor(location.x),
    y = Math.floor(location.y),
    z = Math.floor(location.z),
    block = location.world.getBlockAt(x, y, z),
    i;

  // First, try the block reported as hit
  if (isWoolly(block)) {
    return block;
  }

  for (i = 1; i <= 3; i += 1) {
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
}; // findHitBlock
```

## Keeping a tab on the scores

To save the players' scores, we need a variable. This variable will store players in this fashion:
```javascript
spelare1 -> 3
spelare2 -> 6
```

This is what the code looks like.
```javascript
  // This is our score keeping variable
  var scores = {};
```

## Find the block hit and award points

Now it's finally time for the code called when the `projectileHit` event is sent.
We use the function we wrote before to find the block hit and the `scores` variable to save the score if the player hit the right block.

```javascript
// This is the code called when an arrow hits a block.
// We want to find out which block was hit and award points to the player firing the arrow.
events.projectileHit(function (event) {
  var projectile = event.projectile,
    shooter = projectile.owner,
    loc = projectile.location,
    blockHit = findHitBlock(loc),
    dataValue;

  if (blockHit === undefined) {
    return;
  }

  // The color that was hit is in the "data" attribute (see the BlockType API for details)
  dataValue = blockHit.typeId;
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
```

`dartScores` is a function for printing all scores in the chat. `echo` prints a line in the chat and we call it in a loop for each player saved in the `scores` variable.
