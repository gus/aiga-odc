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

// Make a path from a polygon point string
Raphael.fn.polygon = function(point_string) {
  var path = ["M"];
  var points = point_string.split(" ");
  for (var i=0; i < points.length; i++) {
    path.push(points[i]);
    if (i == 0) { path.push("L"); }
  };
  return this.path(path.concat(["Z"]).join(" "));
};

/*
 * AIGA/ODC specific things
 */

var Aiga = { fx: {}, math: {}, template: {}};

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
    toRotate.animate({"rotation": 720}, 6000, ">", function() { toRotate.animate({"rotation": 0}); });
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
Aiga.PlanetarySystem = function(bg, options) {
  this.options = options;
  var displayAttrs = {"fill": this.options.color, "stroke": (this.options.stroke || 1)}
  this.planet = bg.circle(this.options.cx, this.options.cy, this.options.radius).attr(displayAttrs);
  this.moons = [];

  var system = this;
  var randomPlanetSize = function() { return system.options.radius * (Math.random() % 0.20) + 0.10; }
  var radiansApart = 360 / this.options.moonCount;
  for (var i=0; i < this.options.moonCount; i++) {
    this.moons.push(function() {
      var moon = new Aiga.Moon(system.planet, randomPlanetSize(), radiansApart * i);
      moon.draw(bg, displayAttrs);
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
Aiga.Moon.prototype.draw = function(bg, attrs) {
  var centerPoint = this.calculatePoint(this.radian);
  this.moon = bg.circle(centerPoint.x, centerPoint.y, this.radius).attr(attrs);
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
    var shapes = [];
    if (depth > 0) {
      var squares = scope.makeGrid(x, y, w, h);
      for (var i=0; i < 4; i++) {
        var grid = squares[i];
        if (scope.shouldAddShape()) {
          shapes.push(scope.options.createShape(scope.bg, grid));
        } else {
          shapes.concat(scope.gridify(grid.x, grid.y, grid.w, grid.h, depth - 1));
        }
      }
    }
    return shapes;
  };

};
Aiga.FunWithShapes.prototype.draw = function() {
  this.shapes.length = 0;
  this.bg.clear();
  if (this.options.bootstrap) {
    this.shapes = this.options.bootstrap.call(this);
  } else {
    this.shapes = this.gridify(0, 0, this.options.width, this.options.height, this.options.depth);
  }
};
Aiga.FunWithShapes.prototype.checkMouseover = function(ev) {
  var shapeCount = this.shapes.length;
  var scope = this;
  if (!scope.options.mouseover) { return; }
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

/*
 * Configuration
 */

$(document).ready(function() {
  // Configure platforms
  var pageWidth = $(window).width(), pageHeight = $(window).height();
  var raphael = Raphael("shapescanvas", "100%", "100%");
  var shapeApps = {};

  shapeApps["#square"] = new Aiga.FunWithShapes(raphael, {
    width: pageWidth, height: pageHeight, depth: 4, density: 0.25,
    createShape: function(raphael, grid) {
      var attrs = {"stroke":0, "fill":"#8DC63F"};
      return raphael.rect(grid.x, grid.y, grid.w, grid.h).attr(attrs).mouseover(Aiga.fx.pulsator);
    },
    boundingBox: function(shape) { return shape.getBBox(); },
    bootstrap: function() {
      var scope = this;
      var shapes = [];
      var squareDimensions = Aiga.template.squares();
      var set = scope.bg.set();
      for (var i=0; i < squareDimensions.length; i++) {
        var shape = scope.options.createShape(scope.bg, squareDimensions[i]);
        shapes.push(shape);
        set.push(shape);
      }
      return shapes;
    },
    mouseover: function(shape, ev) { Aiga.fx.pulsator.call(shape, ev); }
  });

  shapeApps["#triangle"] = new Aiga.FunWithShapes(raphael, {
    width: pageWidth, height: pageHeight, depth: 4, density: 0.5,
    createShape: function(raphael, grid) {
      var attrs = {"stroke":0, "fill":"#44C8F5"};
      return raphael.triangle((grid.x + grid.w/2), grid.y, grid.h).attr(attrs);
    },
    boundingBox: function(shape) { return shape.getBBox(); },
    bootstrap: function() {
      var attrs = {"stroke":0, "fill":"#44C8F5"};
      var shapes = [];
      var trianglePoints = Aiga.template.trianglePoints();
      for (var i=0; i < trianglePoints.length; i++) {
        shapes.push(this.bg.polygon(trianglePoints[i]).attr(attrs));
      }
      (function randomSpinning(triangles) {
        var triangleCount = triangles.length;
        var trianglesToRotate = Math.round(triangles.length * 0.07);
        for (var i=0; i < trianglesToRotate; i++) {
          var randomIdx = Math.round(Math.random() * triangleCount);
          Aiga.fx.rotator.call(triangles[randomIdx]);
        }
        setTimeout(function() { randomSpinning(triangles); }, 10000);
      })(shapes);
      return shapes;
    }
  });

  shapeApps["#circle"] = new Aiga.FunWithShapes(raphael, {
    width: pageWidth, height: pageHeight, depth: 3, density: 0.5,
    createShape: function(raphael, grid) {
      var moonCount = Math.ceil(Math.random() * 10);
      var cx = (grid.x + grid.w/2), cy = (grid.y + grid.h/2), radius = grid.w/2;
      var system = new Aiga.PlanetarySystem(raphael, {
        moonCount: moonCount, cx: cx, cy: cy, radius: radius, stroke: 0, color: "yellow"
      });
      system.draw();
      return system;
    },
    boundingBox: function(shape) { return shape.planet.getBBox(); },
    bootstrap: function() {
      var scope = this;
      var shapes = [];
      var planetDimensions = Aiga.template.planets();
      for (var i=0; i < planetDimensions.length; i++) {
        shapes.push(scope.options.createShape(scope.bg, planetDimensions[i]));
      }
      return shapes;
    }
  });

  // Making it all go
  var currentShape = null;
  var switchToShape = function(name) {
    (currentShape = shapeApps[name] || shapeApps["#triangle"]).draw();
    $.cookie("shape", name);
  };
  $("#cornershapes a").click(function() { switchToShape($(this).attr("href")); return false; });
  switchToShape($.cookie("shape"));

  // Deal with mouseovers for movements not over the canvas; pass them along to the stuff below
  $("*:not(#example)").mousemove(function(ev) { currentShape.checkMouseover(ev); });
});
