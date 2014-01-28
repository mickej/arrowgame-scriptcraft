// Skapar upp en väg med en piltavla vid slutet av vägen.
// Anropas genom att skriva "/js piltavla(20)" i chatten.
exports.piltavla = function(leng) {
  // Skapa en ny drone
  var drone = new Drone();

  // Skapa startplats, där man ska skjuta ifrån
  drone.box(blocks.gold, 3, 1, 1);
  drone.fwd();

  // Skapa vägen fram till piltavlan
  drone.box(blocks.iron, 3, 1, leng - 1);
  drone.fwd(leng - 1);
  drone.left(2);
  drone.up(1);

  // Nu ska vi göra piltavlan, den är lite mer avancerad
  // Börja med att ange vilka färger den ska bestå av
  var colors = [blocks.wool.yellow, blocks.wool.red, blocks.wool.white, blocks.wool.black];
  for (var i = 0;i < colors.length; i++) {
    var bm = drone._getBlockIdAndMeta(colors[i]);
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
