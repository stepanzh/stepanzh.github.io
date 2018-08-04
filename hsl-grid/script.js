var math_engine = function(max_k, inner_r, outter_r){
  
  max_k = typeof max_k !== 'undefined' ? max_k : .5;
  inner_r = typeof inner_r !== 'undefined' ? inner_r : 20;
  outter_r = typeof outter_r !== 'undefined' ? outter_r : 100;
  
  var src_x, src_y;
  
  var k_func = function(r){
    var res;
    if (r <= inner_r){
      res = max_k;
    } else if ( r >= outter_r){
      res = 0;
    } else {
      res = - max_k / (outter_r-inner_r) * (r - outter_r)
    }
    return res
  }
  
  var that = {  
    set_source: function(x,y){
      src_x = x; src_y = y;
    },
    move_points: function(){
      console.log('Moving points coords');
      var i, point, k, r01, dx10, dy10;
      
      for (i = 0; i < points.length; i+= 1){
        point = points[i];
        
        dx10 = src_x - point.x0;
        dy10 = src_y - point.y0;
        
        r01 = Math.sqrt(dx10*dx10 + dy10*dy10);
        
        k = k_func(r01);
        
        point.x = point.x0 + k*dx10;
        point.y = point.y0 + k*dy10;
        
        point.scale_side(1-k);
//        point.scale_opacity(k);
        point.scale_lightness(r01 / outter_r);
      }
    },
    get_spheres_r: function(){
      return {outter: outter_r, inner: inner_r}
    }
  };
  
  return that;
}

var create_grid = function (params){
  
  var container, hx, hy, side, padding;
  
  if (typeof params !== 'undefined'){
    if (typeof params.container === 'undefined'){
      throw 'Container isnt specified';
    } else {
      container = params.container;
    }
    hx = typeof params.height_x !== 'undefined' ? params.height_x : 10;
    hy = typeof params.height_y !== 'undefined' ? params.height_y : 10;
    side = typeof params.side !== 'undefined' ? params.side : 5;
    padding = typeof params.padding !== 'undefined' ? params.padding : engine.get_spheres_r().outter;
  } else {
    throw 'No params specified';
  }
    
  var get_point = function (x, y, side, hue) {
    var default_side = typeof side !== 'undefined' ? side : 10;
    var default_opacity = 0;
    
    var lightness_min = 50, lightness_max = 95;
    
    hue = typeof hue !== 'undefined' ? hue : 120;
    
    var pointDOM = document.createElement("div");
    pointDOM.className = "js__point";
    pointDOM.style.width = side+"px";
    pointDOM.style.height = side+"px";

    var that = {
      x0: x, y0: y,

      x: x, y: y,
      xp: x, yp: y,
      xpp: x, ypp: y,
    
      reset_pos: function(){
        this.x = this.x0;
        this.y = this.y0;
      },

      side: default_side,
      scale_side: function(scale){
        this.side = default_side * scale;
      },
      reset_side: function(){
        this.side = default_side;
      },
      hue: hue,
      lightness: lightness_max,
      scale_lightness: function(scale){
        if (scale > 1){
          this.lightness = lightness_max;
        }
        else {
          this.lightness = lightness_min + (lightness_max - lightness_min) * scale;
        }
      },
      
      reset: function(){
        this.reset_pos();
        this.reset_side();
      },
      
      DOM: pointDOM,
      sync_dom: function(){
        this.DOM.style.left = this.x - this.side / 2 + "px";
        this.DOM.style.top = this.y - this.side / 2 + "px";
        this.DOM.style.height = this.side + "px";
        this.DOM.style.width = this.side + "px";
        this.DOM.style.backgroundColor = "hsl("+this.hue+", 100%, "+this.lightness+"%)";
      }
    }
    return that
  };

  var width = container.clientWidth - 2 * padding;
  var height = container.clientHeight - 2 * padding;

  var points = [];
  var nx = Math.floor(width / hx) + 1;
  var ny = Math.floor(height / hy) + 1;

  var point;
  var x, y, hue = 0, hue_step = 360/(nx*ny);
  
  x = padding;
  for ( var i = 0; i < nx; i += 1 ){
    y = padding;
    for ( var j = 0; j < ny; j += 1){
      point = get_point(x, y, side, hue);
      points.push(point);
      container.appendChild(point.DOM);
      y += hy;
      
      hue += hue_step;
      
    }
    x += hx;
  }
  points.sync_dom = function(){
    console.log('Sync points coords and DOMs');
    requestAnimationFrame(function(){
      for (var i = 0; i < points.length; i+= 1){
        points[i].sync_dom();
      }
    });
  };
  points.reset = function(){
    console.log('Reset points pos');
    for (var i = 0; i < this.length; i += 1){
      points[i].reset();
    }
  }
  
  return points
};

var create_renderer = function (container) {
  
  var get_container_origin = function(){
      var x, y;
      x = container.getBoundingClientRect().x;
      y = container.getBoundingClientRect().y;
      return {x: x, y: y}
  };
  
  var that = {
    start: function () {
      console.log('Start rendering');
      points.sync_dom();
    },
    render: function () {
      console.log('Rendering new positions');
      points.sync_dom();
    },
    stop: function () {
      console.log('Stop rendering');
      points.sync_dom();
    },
    
    reset_offsets: function(){
      var offsets_obj = get_container_origin();
      OFFSET_X = offsets_obj.x;
      OFFSET_Y = offsets_obj.y;
    }
  };
  
  that.reset_offsets();
  that.start();
  
  return that
};

var change_src_by_mouse = function (e){
//  console.log(e.target.id);
  if (e.target.id === FIELD_ID){
    var x = e.clientX - OFFSET_X;
    var y = e.clientY - OFFSET_Y;
    engine.set_source(x, y);
    engine.move_points();
    renderer.render();
//    requestAnimationFrame(function(){
//      renderer.render();
//    });
  }
};


var stop_animation = function (e) {
//  console.log("M-out target id", e.target.id);
//  console.log(e);
  if (e.relatedTarget.parentElement.id !== FIELD_ID){
    points.reset();
    renderer.stop();
  }
};


var FIELD_ID = "js__field";
var fieldDOM = document.getElementById(FIELD_ID);
var OFFSET_X, OFFSET_Y;

var engine = math_engine(.2, 30, 60);

var points = create_grid({
  container: fieldDOM,
  height_x: 20,
  height_y: 20,
  side: 14,
//  padding: 30
});



var renderer = create_renderer(fieldDOM);

fieldDOM.addEventListener("mousemove", change_src_by_mouse);


fieldDOM.addEventListener("mouseout", stop_animation);

window.onresize = function(e){
  renderer.reset_offsets();
};
