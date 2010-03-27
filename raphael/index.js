window.onload = function() {
  Raphael.fn.triangle = function(x, y, size) {
    p1 = "L" + (x + size / 2) + " " + (y + size);
    p2 = "L" + (x - size / 2) + " " + (y + size);
    p3 = "L" + x + " " + y;
    return this.path("M" + x + " " + y + p1 + p2 + p3);
  };

  var rotator = function(event) {
    this.attr( {"rotation": 0});
    this.animate( {"rotation": 7200}, 10000, ">");
  };

  var bg = Raphael(document.getElementById("example"), 800, 400);

  bg.triangle(300, 0, 100).attr({"fill": "yellow", "stroke": 0}).mouseover(rotator);
  bg.triangle(200, 50, 100).attr({"fill": "yellow", "stroke": 0}).mouseover(rotator);
  bg.triangle(200, 150, 50).attr({"fill": "yellow", "stroke": 0}).mouseover(rotator);
  bg.triangle(325, 125, 50).attr({"fill": "yellow", "stroke": 0}).mouseover(rotator);
};
