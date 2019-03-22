/* lib */
/* ************************************************************************** */
function gradient(colors, frac) {
    var r = Math.trunc(colors[0].r + frac * (colors[1].r - colors[0].r));
    var g = Math.trunc(colors[0].g + frac * (colors[1].g - colors[0].g));
    var b = Math.trunc(colors[0].b + frac * (colors[1].b - colors[0].b));
    
    return 'rgb(' + r + ',' + g + ',' + b + ')'
}
function hex_string_to_colorobj(s){
    var color = {};
    
    color.r = parseInt( s.slice(1,3), 16 );
    color.g = parseInt( s.slice(3,5), 16 );
    color.b = parseInt( s.slice(5,7), 16 );
    
    return color
}
function rgb_to_hexstring(rgb){
    return "#" + ("0" + rgb.r.toString(16)).slice(-2) + ("0" + rgb.g.toString(16)).slice(-2) + ("0" + rgb.b.toString(16)).slice(-2)
}
function gradient_css_string(rgb1, rgb2){
    return "linear-gradient(to right, " + rgb_to_hexstring(rgb1) +  " 5% , "+ rgb_to_hexstring(rgb2) + " 95%)"
}
function make_draggable(svgelement, callback){
    var move = function(e){
        svgelement.cx(e.layerX);
        svgelement.cy(e.layerY);
        
        callback(svgelement);
    }
    svgelement.on('mousedown', function(e){
        svgelement.on('mousemove', move);
        document.addEventListener('mousemove', move);
        
        svgelement.style("cursor", "move");
        document.body.style.cursor = "move";
        
        svgelement.on('mouseup', function(){
            this.off('mousemove');
            document.removeEventListener('mousemove', move);
            svgelement.style("cursor", "pointer");
            document.body.style.cursor = "default";
            callback(this);
        });
        document.addEventListener('mouseup', function(e){
            svgelement.off('mousemove');
            document.removeEventListener('mousemove', move);
            svgelement.style("cursor", "pointer");
        });
    });
    svgelement.on('mouseout', function(){
        this.off('mousemove');
    });
}
function gen_regular_polygon(w, h, n, phi0 = 0, offset = 0.05) {
    if (n < 3 ){ // assert
        console.log('trying to generate polygon with n of vertexes < 3');
        return
    }
    
    let xc = w / 2, yc = h / 2;
    let r = (1 - 2 * offset) * Math.min(w, h) / 2;
    let coords = [];
    
    for (let i = 0; i < n; i += 1){
        coords.push([ xc + r * Math.cos(phi0 + 2*Math.PI * i / n), yc + r * Math.sin(phi0 + 2*Math.PI * i / n)])
    }
    return coords
}
/* ************************************************************************** */




SVG.on(document, 'DOMContentLoaded', function() {  
    M = Model();
    
    V = View(M);
    V.render();
    
    C = Controller(M, V);
})


/* Model */
/* ************************************************************************** */
var Model = function(svgobj) {
//    var origin_coords = [[0, 0], [500, 0], [250, 500]];
    var origin_coords = [[100, 100], [ 400, 100 ], [400, 400]];//, [100, 400]];
    var fractals = [];
    var relative_koef;
    var depth; // parent + children
    var height;
    var width;
    var svgobj, bgrect;
    
    var polystack = [];      /* SVG.Polygon */
    var origindraggers = []; /* SVG.Circle */
    var polygroup, draggers_group;
    
    var last_draw_depth = 0, last_draw_vertexes, last_relative_koef;
    
    var view, controller;
    
    function calc_child(parent_coords) {
        var child = [];
        var i, N, j;
        N = parent_coords.length;
        for (i = 0; i < N; i += 1){
            child.push( [ parent_coords[0][0], parent_coords[0][1]] );
            for (j = 0; j < i; j += 1){
                child[i][0] += parent_coords[j+1][0] - parent_coords[j][0];
                child[i][1] += parent_coords[j+1][1] - parent_coords[j][1];
            }
            child[i][0] += relative_koef * ( parent_coords[(i+1)%N][0] - parent_coords[(i)%N][0] );
            child[i][1] += relative_koef * ( parent_coords[(i+1)%N][1] - parent_coords[(i)%N][1] );
        }
        return child
    };

    /* when rel_koef or depth is changed call it */
    var update_fractals = function() {
        var i, j, child_coords, points, parent_coords;
        
        /* rel_koef change? */
        if (relative_koef != last_relative_koef){
            /* go through childs, update its coordinates and synchronize_coords */
            for (i = 1; i < fractals.length; i += 1){
                parent_coords = [];
                for (j = 0; j < fractals[i-1].length; j += 1){
                    parent_coords.push([ fractals[i-1][j][0], fractals[i-1][j][1] ]);
                }
                child_coords = calc_child(parent_coords);
                fractals[i] =  child_coords;
            }
            synchronize_coords();
            last_relative_koef = relative_koef;
        };
        
        /* number of fractals change? */
        /* number of fractals raise */
        for ( i = last_draw_depth; i < depth; i += 1){
            child_coords = calc_child( fractals[i-1] );
            fractals.push( child_coords );
            polystack.push( polygroup.polygon(child_coords) );//fractals[i] ) );
        }
        /* number of fractals decrease: depth < last_draw_depth */
        for ( i = depth; i < last_draw_depth; i += 1){
            fractals.pop();
            polystack.pop().remove().forget();
        }
        last_draw_depth = depth;
    };
    
    var synchronize_coords = function(){
        var i, j;
        for (i = 0; i < fractals.length; i += 1){
            for (j = 0; j < fractals[i].length; j += 1){
                /* move point j */
                polystack[i].node.points[j].x = fractals[i][j][0];
                polystack[i].node.points[j].y = fractals[i][j][1];
            }
        }
    };

    var set_depth = function(d){
        depth = d;
        update_fractals();
        view.render();
    };
    
    var set_origin = function(coords){
        if (coords.length > 2){
            origin_coords = coords;
            reload();
        } else { console.log("trying to set origin <= 2"); }
    };
    
    /* origin' vertex changed position */
    var move_fractals = function(){
        var i;
        for (i = 1; i < fractals.length; i += 1){
            fractals[i] = calc_child(fractals[i-1]);
        }
    };
    var move_origin_vertex = function(i, coords){
        if (i < fractals[0].length){
            fractals[0][i] = coords;
            move_fractals();
            synchronize_coords();
        } else {
            console.log('move_origin_vertex: trying to move unexisting vertex = ', i);
        }
    };    
    var add_origin_vertex = function(target){
        var orig = fractals[0];
        var N = orig.length;
        var k, b, dx, dy, rcx, rcy;
        var apphere = -1;
        
        rcx = 0; rcy =0;
        for (i=0; i < N; i+= 1){
            rcx += orig[i][0];
            rcy += orig[i][1]
        }
        rcx = rcx / N;
        rcy = rcy / N;
        for ( let i = 0; i < N-1; i += 1){
            console.log('i=', i);
            dy = orig[i+1][1] - orig[i][1];
            dx = orig[i+1][0] - orig[i][0];
            
            if ( dx != 0){
                k = dy / dx;
                b = orig[i][1] - orig[i][0] * k;
                
                if ( (( k*target[0] + b < target[1]) && !(k*rcx +b < rcy)) || 
                        ( !( k*target[0] + b < target[1]) && (k*rcx +b < rcy) ) ){ 
                    apphere = i + 1;
                    break
                }
                
            } else {
                // XOR !!!!
                if ( !((target[0] < orig[i][0]) && (rcx < orig[i][0])) ){ 
                    apphere = i + 1;
                    break
                }
            }
        }
        // N, 0
        if (apphere == -1){
            origin_coords.push(target);
        } else {
            origin_coords.splice(apphere, 0, target);
        }
        reload();
    };
    
    var remove_origin_vertex = function(i){
//        console.log('removing ', i);

        if ( origin_coords.length > 3){
            controller.manipulate_listeners_off();
            if (i >= 0 && i <= origin_coords.length-1){ // production unnesseeary
                origin_coords.splice(i, 1);
                reload();
            } else {
                console.log('Unbound: trying to remove origin vertex ', i);
            }
        }
    };
    /* when origin_coords is changed number of vertexes do it */
    var reload = function(){
        /* clear polygons */ // is change possible? ...... ???
        forget_obj(polystack, fractals);
        /* create new polygons */
        fractals.push( origin_coords );
        polystack.push( polygroup.polygon(origin_coords) );
        last_draw_depth = 1;
        update_fractals();
        /* update draggers */
        forget_obj(origindraggers);
        for (i = 0; i < origin_coords.length; i += 1){
            origindraggers.push( draggers_group.circle(0) );
            origindraggers[i].attr({cx: origin_coords[i][0], cy: origin_coords[i][1]});
        }
        if (controller){
            controller.manipulate_listeners_off();
            controller.manipulate_listeners_on();
        }
        if (view){ 
            view.reinit();
            view.render();
        }
    };
    
    var forget_obj = function(objs, coord_arr){
        var i, N = objs.length;
        for (i = 0; i < N; i += 1){
            objs.pop().remove().forget();
            if (coord_arr){
                coord_arr.pop();
            }
        }
    }
    
    /* when points dragged callback(SVG.Circle) is called */
    var get_draggers_callbacks = function(){
        var calls = [];
        var i;
        for (i = 0; i < origindraggers.length; i += 1){
            calls.push(
                function(i){ 
                    var f = function(el){
                        move_origin_vertex(i, [el.cx(), el.cy()]);
                    }
                    return f
                }(i)
            );
        }
        return calls
    };
    
    var that = {};

    that.get_width = function(){return width};
    that.get_height = function(){return height};

    that.set_depth = set_depth;
    that.set_relative_koef = function(k){ relative_koef = k; update_fractals(); view.render();};
//    that.set_origin = function ( coords ){ origin_coords = coords; update_fractals(); } // ??? length(coords) != length()
    
    that.get_bgrect = function(){ return bgrect };
    that.get_polys = function(){ return polystack };
    that.get_fractals = function() { return fractals }; // array of fractals' coords
    that.get_draggers = function(){ return origindraggers };
    that.get_draggers_callbacks = get_draggers_callbacks;
    that.get_origin_coords = function(){ return origin_coords };
    that.get_bgobj = function(){ return bgrect };
    that.get_svgobj = function(){ return svgobj };

    that.move_origin_vertex = move_origin_vertex;
    that.add_origin_vertex = add_origin_vertex;
    that.remove_origin_vertex = remove_origin_vertex;
    
    that.set_view = function(v){ view = v; }
    that.set_controller = function(c){ controller = c; }
    that.set_origin = set_origin;
    
    that.resize = function(){
        svgobj.remove().forget();
        width = document.getElementById('draw').clientWidth;
        height = document.getElementById('draw').clientHeight;
        that.init();
    };
    
    that.init = function(){
        var i;
        width = document.getElementById('draw').clientWidth;
        height  = document.getElementById('draw').clientHeight;
        svgobj = SVG('draw').size(width, height);
        bgrect = svgobj.rect(width, height);
        polygroup = svgobj.group();
        
        relative_koef = document.getElementById('range--corners').value;
        last_relative_koef = relative_koef;
        
        depth = document.getElementById('range--children').value;
        draggers_group = svgobj.group();
        
        reload();
    }
    
    that.init();
    return that
};
/* ************************************************************************** */



/* View */
/* ************************************************************************** */
var View = function(model) {
    var polystack; /* actual stack of SVG.Polygon objects */
//    var bgrect = model.bgrect;
    
    var color_set = {
        bgpoly: [
                    hex_string_to_colorobj(document.getElementById("color-poly--1").value),
                    hex_string_to_colorobj(document.getElementById("color-poly--2").value)
                ],
        lines: [
                    hex_string_to_colorobj(document.getElementById("color-lines--1").value),
                    hex_string_to_colorobj(document.getElementById("color-lines--2").value)
        ],
        bg: hex_string_to_colorobj(document.getElementById("color-bg").value)
    };
    
    var showpoly = document.getElementById('check--showpoly').checked;
    var showlines = document.getElementById('check--showlines').checked;
    
    var color_showers = {
        poly:  document.getElementById('show-color-poly'),
        lines: document.getElementById('show-color-lines'),
        bg:    document.getElementById('show-color-bg')
    };
    
    var menu_item_gradient = {
        poly:  document.getElementById('menu__item--poly'),
        lines: document.getElementById('menu__item--lines')
    }
    var classes = {
        disable: "disabled"
    };
    
    
    var draggers_common_attr = {fill: '#ffffff', 'stroke': '#8f868f', 'stroke-width': 1, r: 12, };
    
    function draw_fractal(p, bgfill, sfill, swidth=1){
        p.attr({
              fill: bgfill,
              'fill-opacity': showpoly ? 1 : 0,
              stroke: sfill,
              'stroke-width': swidth,
              'stroke-opacity': showlines ? 1 : 0,
        });
    }
    
    function draw_fractals(){
        var i, d, f, bgc, linesc, swidth;
        var ps = model.get_polys(); // coords of fractals
        var depth = ps.length;
        
        for (d = 0; d < depth; d += 1){
            p = ps[d];
            clevel = d / ( (depth > 1 ? depth : 2) - 1 );
            
            bgc = gradient(color_set.bgpoly, clevel);
            linesc = gradient(color_set.lines, clevel);
            swidth = 0.5 + 1 * clevel;
            
            draw_fractal(p, bgc, linesc, swidth);
        }
    }
    
    function ui_update(){
        var i, drgs;
        model.get_bgrect().attr({fill: color_set.bg});
        drgs = model.get_draggers();
        for (i=0; i < drgs.length; i += 1){
            drgs[i].attr(draggers_common_attr);
            drgs[i].style("cursor", "pointer");
        }
        /* disabling gradient choosers */
        {
            let inputs_poly = document.querySelectorAll("#" + menu_item_gradient.poly.id + " input[type=color]");
            let inputs_lines = document.querySelectorAll("#" + menu_item_gradient.lines.id + " input[type=color]");
            for (i = 0; i < inputs_poly.length; i += 1) {
                inputs_poly[i].disabled = !showpoly;
                inputs_lines[i].disabled = !showlines;
            }
           showpoly ?   menu_item_gradient.poly.classList.remove(classes.disable) : 
                        menu_item_gradient.poly.classList.add(classes.disable);
                        
           showlines ?  menu_item_gradient.lines.classList.remove(classes.disable) : 
                        menu_item_gradient.lines.classList.add(classes.disable);
        }
        /* color showers */
//        console.log('color-showers upd');
//        console.log(gradient_css_string(color_set.bgpoly[0], color_set.bgpoly[1]));
//        console.log(gradient_css_string(color_set.lines[0], color_set.lines[1]));
//        console.log(rgb_to_hexstring(color_set.bg));
        
        color_showers.poly.style.background  = gradient_css_string(color_set.bgpoly[0], color_set.bgpoly[1]);
        color_showers.lines.style.background = gradient_css_string(color_set.lines[0], color_set.lines[1]);
        color_showers.bg.style.background    = rgb_to_hexstring(color_set.bg);
    }
    
    function set_draggers(show = true){
        var ds = model.get_draggers();  
        for (let i = 0; i < ds.length; i += 1){
            if (show){
                ds[i].attr({'fill-opacity': 1, 'stroke-opacity': 1});
            } else {
                ds[i].attr({'fill-opacity': 0, 'stroke-opacity': 0});
            }
        }
    };
    
    var that = {};
    
    that.render = function(){
        draw_fractals();
        ui_update();
    };
    that.set_polycolor_1 = function(hex_string){
        color_set.bgpoly[0] = hex_string_to_colorobj(hex_string);
        that.render();
    };
    that.set_polycolor_2 = function(hex_string){
        color_set.bgpoly[1] = hex_string_to_colorobj(hex_string);
        that.render();
    };
    that.set_linecolor_1 = function(hex_string){
        color_set.lines[0] = hex_string_to_colorobj(hex_string);
        that.render();
    };
    that.set_linecolor_2 = function(hex_string){
        color_set.lines[1] = hex_string_to_colorobj(hex_string);
        that.render();
    };
    that.set_bgcolor = function(hex_string){
        color_set.bg = hex_string_to_colorobj(hex_string);
        that.render();
    };    
    
    that.set_showpoly = function(f){
        showpoly = f;
        that.render();
    };
    that.set_showlines = function(f){
        showlines = f;
        that.render();
    };
    that.set_draggers = set_draggers;
    
    /* call it when model is reload */
    that.reinit = function(){
        model.get_bgobj().style('cursor', 'copy');
    }
    
    that.set_draggers(false);
    that.reinit();
    model.set_view(that);
    return that
};
/* ************************************************************************** */

/* Controller */
/* ************************************************************************** */
var Controller = function(model, view){
    /* model controller */
    var rel_koef_input = document.getElementById('range--corners');
    var depth_input = document.getElementById('range--children');

    /* view controller */
    /* color pickers */
    var poly_bg_picker_1 = document.getElementById("color-poly--1");
    var poly_bg_picker_2 = document.getElementById("color-poly--2");
    var line_picker_1 = document.getElementById("color-lines--1");
    var line_picker_2 = document.getElementById("color-lines--2");
    var bg_picker = document.getElementById("color-bg");
    
    /* checkboxes */
    var check_poly = document.getElementById('check--showpoly');
    var check_lines = document.getElementById('check--showlines');
    
    var that = {};
    
    that.set_depth = function (depth){
        model.set_depth(depth);
    }
    
    that.set_relkoef = function(k){
        model.set_relative_koef(k);
    }
    function colorPickListener(inp, update_func){
        inp.addEventListener("change", function(e){
//            var color = hex_string_to_colorobj(e.target.value)            
//            update_func(color);
            update_func(e.target.value);
        });
    };
    
    function checkBoolListener(check, update_func){
        check.addEventListener('change', function(e){
            update_func( e.target.checked );
        });
    };
    
    function origin_manipulation_listeners(){
        /* drag and drop */
        var draggers = model.get_draggers();
        var callbacks = model.get_draggers_callbacks();
        var f;

        var rms = [];
        var rm = function(j){
            return function b() {model.remove_origin_vertex(j);}
        }
        /* drag and drop */
        for (let i = 0; i < draggers.length; i += 1){
            make_draggable(draggers[i], callbacks[i]);
            rms.push(rm(i));
            draggers[i].on('dblclick', function(e){
                rms[i]();
            });
        }
        /* adding a vertex */
        model.get_bgobj().on('dblclick', function(e){
            console.log('dblclick add: ', e.layerX, " ", e.layerY);
            model.add_origin_vertex([e.layerX, e.layerY]);
        });
    };
    function manipulate_listeners_off(){
        var draggers = model.get_draggers();
        var i;
        for (i=0; i < draggers.length; i += 1){
            draggers[i].off('dblclick');
            draggers[i].off('mousedown');   
        }
        model.get_bgobj().off('dblclick');
        
        
        
    };
    
    depth_input.oninput = function(){
        that.set_depth( parseInt(this.value) );
    }
    rel_koef_input.oninput = function(){
        that.set_relkoef( parseFloat(this.value) );
    }

    colorPickListener(poly_bg_picker_1, view.set_polycolor_1);
    colorPickListener(poly_bg_picker_2, view.set_polycolor_2);
    colorPickListener(line_picker_1, view.set_linecolor_1);
    colorPickListener(line_picker_2, view.set_linecolor_2);
    
    colorPickListener(bg_picker, view.set_bgcolor);
    
    checkBoolListener(check_poly, view.set_showpoly);
    checkBoolListener(check_lines, view.set_showlines);
    
    that.manipulate_listeners_on = origin_manipulation_listeners;
    that.manipulate_listeners_off = manipulate_listeners_off;    
    that.upd_svg_listeners = function(){
        model.get_svgobj().on('mouseover', function(e){
            view.set_draggers(true);
            that.manipulate_listeners_on();
        });
        model.get_svgobj().on('mouseout', function(e){
            view.set_draggers(false);
            that.manipulate_listeners_off();
        });
    }

    window.addEventListener('resize', function(e){
        model.resize();
        that.upd_svg_listeners();
    });

    that.upd_svg_listeners();
//    that.manipulate_listeners_on();
    model.set_controller(that);
    return that
}
/* ************************************************************************** */

var M, V;
let hided = document.getElementsByClassName('js--hided');
for (let i = 0; i < hided.length; i += 1){
    hided[i].style.opacity = 0;
    hided[i].disabled = true;
}
