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

/*
 * Moons and planets!
 */

// Make a planetary system
Aiga.PlanetarySystem = function(bg, moonCount, x, y, r) {
  this.planet = bg.circle(x, y, r).attr({"fill":"yellow", "stroke":0});
  var radiansApart = 360 / moonCount;
  this.moons = [];
  var system = this;
  for (var i=0; i < moonCount; i++) {
    this.moons.push(function() {
      var planetRadius = r * (Math.random() % 0.20) + 0.10;
      var moon = new Aiga.Moon(system.planet, planetRadius, radiansApart * i);
      moon.draw(bg);
      return moon;
    }());
  }
}
Aiga.PlanetarySystem.prototype.orbit = function() {
  var system = this;
  var moonCount = system.moons.length;
  var resetRotation = function() { system.planet.attr({"rotation": 0}); };
  if (system.planet.attr("rotation") == 0) {
    system.planet.animate({"rotation":1440}, 5000, ">", resetRotation).onAnimation(function() {
      for (var i=0; i < moonCount; i++) {
        system.moons[i].updateOrbit(system.planet.attr("rotation"));
      }
    });
  }
};
Aiga.PlanetarySystem.prototype.draw = function() {
  var system = this;
  system.planet.mouseover(function(event) { system.orbit.call(system); });
};

// Make a moon

Aiga.Moon = function(planet, radius, startingRadian) {
  this.cx = planet.attr("cx");
  this.cy = planet.attr("cy");
  this.radius = radius;
  this.orbitRadius = planet.attr("r") + (radius * 2);
  this.radian = startingRadian;
  this.moon = null;
};
Aiga.Moon.prototype.calculateCircularPoint = function(radian) {
  var modRadian = radian % 360;
  return {
    x: this.cx + (this.orbitRadius * Math.cos(modRadian * Math.PI / 180.0)),
    y: this.cy + (this.orbitRadius * Math.sin(modRadian * Math.PI / 180.0))
  };
};
Aiga.Moon.prototype.draw = function(bg) {
  var centerPoint = this.calculateCircularPoint(this.radian);
  this.moon = bg.circle(centerPoint.x, centerPoint.y, this.radius).attr({"fill":"yellow", "stroke":0});
};
Aiga.Moon.prototype.updateOrbit = function(radianDelta) {
  var centerPoint = this.calculateCircularPoint(this.radian + radianDelta);
  this.moon.attr({"cx": centerPoint.x, "cy": centerPoint.y});
};
