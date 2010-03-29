Raphael.fn.triangle = function(x, y, size) {
  var path = ["M", x, y];
  path = path.concat(["L", (x + size / 2), (y + size)]);
  path = path.concat(["L", (x - size / 2), (y + size)]);
  return this.path(path.concat(["z"]).join(" "));
};

var Aiga = { fx: {}};

Aiga.fx.rotator = function(event) {
  this.attr( {"rotation": 0});
  this.animate( {"rotation": 7200}, 10000, ">");
};

