/*
 * Stuff that should just come with Raphael
 */

// Make a triangle
Raphael.fn.triangle = function(x, y, size) {
  var path = ["M", x, y];
  path = path.concat(["L", (x + size / 2), (y + size)]);
  path = path.concat(["L", (x - size / 2), (y + size)]);
  return this.path(path.concat(["z"]).join(" "));
};

/*
 * AIGA/ODC specific things
 */

var Aiga = { fx: {}, math: {}};

Aiga.math.tails = function() {
  return Math.round(Math.random()) == 0; // Why not?
}

// Make a shape rotate quickly many times and then slow down
Aiga.fx.rotator = function(event) {
  var toRotate = this;
  if (toRotate.attr("rotation") == 0) {
    toRotate.attr({"rotation": 0});
    toRotate.animate({"rotation": 7200}, 10000, ">");
    setTimeout(function() { toRotate.animate({"rotation": 0}); }, 10000);
  }
};

// Handle pulsate as the response to an event
Aiga.fx.pulsator = function(event) { Aiga.fx.pulsate(this); };

// Make a shape pulsate between 50% or 200% it's original size
// Will not pulsate again until scale is back to 1
Aiga.fx.pulsate = function(toPulsate) {
  var scale = toPulsate.attr("scale");
  if (scale.x == 1 && scale.y == 1) {
    toPulsate.animate({"scale": (Aiga.math.tails() ? "2" : "0.5")}, 500);
    setTimeout(function() { toPulsate.animate({"scale": 1}, 500); }, 1000);
  }
};
