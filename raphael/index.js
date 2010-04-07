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
};
Aiga.math.findPointOnCircumference = function(cx, cy, radius, radian) {
  var angle = radian * Math.PI / 180.0;
  return {
    x: cx + (radius * Math.cos(angle)),
    y: cy + (radius * Math.sin(angle))
  };
};

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
  
  var randomPlanetSize = function() { return r * (Math.random() % 0.20) + 0.10; }
  
  for (var i=0; i < moonCount; i++) {
    this.moons.push(function() {
      var moon = new Aiga.Moon(system.planet, randomPlanetSize(), radiansApart * i);
      moon.draw(bg);
      return moon;
    }());
  }
}
Aiga.PlanetarySystem.prototype.orbit = function() {
  var system = this;
  var moonCount = system.moons.length;
  var resetRotation = function() {
    system.planet.attr({"rotation": 0});
    system.orbit.call(system); // Don't do this if you want mouseover
  };
  if (system.planet.attr("rotation") == 0) {
    system.planet.animate({"rotation":360}, 30000, resetRotation).onAnimation(function() {
      for (var i=0; i < moonCount; i++) {
        system.moons[i].updateOrbit(system.planet.attr("rotation"));
      }
    });
  }
};
Aiga.PlanetarySystem.prototype.draw = function() {
  var system = this;
  // system.planet.mouseover(function(event) { system.orbit.call(system); });
  system.orbit.call(system);
};

// Make a moon. TODO: Clean up the code here. Find a better way to pass around bg or return a raphael moon.

Aiga.Moon = function(planet, radius, startingRadian) {
  this.cx = planet.attr("cx");
  this.cy = planet.attr("cy");
  this.radius = radius;
  this.orbitRadius = planet.attr("r") + (radius * 2);
  this.radian = startingRadian;
  this.moon = null;
};
Aiga.Moon.prototype.calculatePoint = function(radian) {
  return Aiga.math.findPointOnCircumference(this.cx, this.cy, this.orbitRadius, (radian % 360));
};
Aiga.Moon.prototype.draw = function(bg) {
  var centerPoint = this.calculatePoint(this.radian);
  this.moon = bg.circle(centerPoint.x, centerPoint.y, this.radius).attr({"fill":"yellow", "stroke":0});
};
Aiga.Moon.prototype.updateOrbit = function(radianDelta) {
  var centerPoint = this.calculatePoint(this.radian + radianDelta);
  this.moon.attr({"cx": centerPoint.x, "cy": centerPoint.y});
};

/*
 * The main platform. Handles creating a grid, drawing stuff, and capturing all events
 */

Aiga.FunWithShapes = function(raphael, options) {
  var scope = this;
  scope.bg = raphael;
  scope.shapes = [];
  scope.options = options;

  scope.shouldAddShape = function() {
    return Math.random() < scope.options.density;
  };

  scope.makeGrid = function(x, y, w, h) {
    var grids = [];
    function makeDimension(x,y,w,h) { return {"x":x, "y":y, "w":w, "h":h}; }
    grids.push(makeDimension(x, y, w/2, h/2));
    grids.push(makeDimension(x + w/2, y, w/2, h/2));
    grids.push(makeDimension(x, y + h/2, w/2, h/2));
    grids.push(makeDimension(x + w/2, y + h/2, w/2, h/2));
    return grids;
  };

  scope.gridify = function(x, y, w, h, depth) {
    if (depth > 0) {
      var squares = scope.makeGrid(x, y, w, h);
      for (var i=0; i < 4; i++) {
        var grid = squares[i];
        if (scope.shouldAddShape()) {
          scope.shapes.push(scope.options.createShape(scope.bg, grid));
        } else {
          scope.gridify(grid.x, grid.y, grid.w, grid.h, depth - 1);
        }
      }
    }
  };

};
Aiga.FunWithShapes.prototype.draw = function() {
  this.shapes.length = 0;
  this.bg.clear();
  this.gridify(0, 0, this.options.width, this.options.height, this.options.depth);
};
Aiga.FunWithShapes.prototype.checkMouseover = function(ev) {
  var shapeCount = this.shapes.length;
  var scope = this;
  for (var i=0; i < shapeCount; i++) {
    (function() {
      var shape = scope.shapes[i], bbox = scope.options.boundingBox(shape);
      var dx = ev.clientX - bbox.x, dy = ev.clientY - bbox.y;
      if ((dx >= 0 && dx <= bbox.width) && (dy >= 0 && dy <= bbox.height)) {
        scope.options.mouseover(shape, ev);
      }
    })();
  }
};
