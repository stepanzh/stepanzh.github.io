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

function make_draggable(svgelement, callback){
    var move = function(e){
        svgelement.cx(e.layerX);
        svgelement.cy(e.layerY);
        
        callback(svgelement);
    }
    svgelement.on('mousedown', function(e){
        svgelement.on('mousemove', move);
        document.addEventListener('mousemove', move);
        svgelement.on('mouseup', function(){
            this.off('mousemove');
            document.removeEventListener('mousemove', move);
            callback(this);
        });
        document.addEventListener('mouseup', function(e){
            svgelement.off('mousemove');
            document.removeEventListener('mousemove', move);
        });
    });
    svgelement.on('mouseout', function(){
        this.off('mousemove');
    });
}
function sqrdistance(c1, c2){
    return (c1[0] - c2[0])*(c1[0] - c2[0]) + (c1[1] - c2[1])*(c1[1] - c2[1])
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
    var origin_coords = [[100, 100], [ 400, 100 ], [400, 400], [100, 400]];
    var fractals = [];
    var relative_koef;
    var depth; // parent + children
    var width = 500, height = 500;
    var svgobj, bgrect;
    
    var polystack = [];         /* SVG.Polygon */
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

    var update_fractals = function() {
        var i, j, child_coords, points, parent_coords;
//        console.log('depth/last: ', depth, last_draw_depth);
//        console.log('fractals before update', fractals);
//        console.log('rel/last', relative_koef, last_relative_koef);
        
        /* rel_koef change? */
        if (relative_koef != last_relative_koef){
//            console.log('rel_koef changed!');
            /* go through childs, update its coordinates and synchronize_coords */
            for (i = 1; i < fractals.length; i += 1){
                parent_coords = [];
                for (j = 0; j < fractals[i-1].length; j += 1){
                    parent_coords.push([ fractals[i-1][j][0], fractals[i-1][j][1] ]);
                }
                child_coords = calc_child(parent_coords);
                fractals[i] =  child_coords;
//                console.log('parent: ', parent_coords);
//                console.log('child: ', child_coords);
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
//            console.log('popping');
            fractals.pop();
            polystack.pop().remove().forget();
        }
        
//        console.log('fractals after update', fractals);
        last_draw_depth = depth;
    };
    
    var synchronize_coords = function(){
        var i, j;
        console.log('fractals: ', fractals);
        console.log('polystack = ', polystack);
        for (i = 0; i < fractals.length; i += 1){
            console.log('i=', i);
            console.log(polystack[i].node.points);
            for (j = 0; j < fractals[i].length; j += 1){
                /* move point j */
                console.log('j=', j);
                polystack[i].node.points[j].x = fractals[i][j][0];
                polystack[i].node.points[j].y = fractals[i][j][1];
            }
        }
    };

    var set_depth = function(d){
        console.log('model set depth d=', d);
        depth = d;
        update_fractals();
    };
    
    var set_origin = function(coords){
        if ( origin_coords.length != coords.length ){
            /* vertex is added or removed */
        } else {
            /* vertex is moved */
        }
        origin_coords = coords;
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
        /* coords must be < width, < height */
        
        /* find index where to put new vertex */
        var i, imin, imin_second, minr, r, imin1, imin2, r1, r2;
        var orig = fractals[0];
        /* find closest vertex */
        imin = 0;
        minr = sqrdistance(orig[0], target);
        for (i = 1; i < orig.length; i += 1){
            r = sqrdistance(orig[i], target);
            if (r < minr){
                imin = i;
            }
        }
        console.log('imin=', imin);
        /* find second closest vertex */
        imin1 = imin != origin_coords.length ? (imin+1)%origin_coords.length : 0;
        imin2 = imin != 0 ? (imin-1)%origin_coords.length : origin_coords.length-1;
        
        console.log('imin1/imin2', imin1, imin2);
        
        r1 = sqrdistance(orig[imin1], target);
        r2 = sqrdistance(orig[imin2], target);

        imin_second = r1 < r2 ? imin1 : imin2;
        
        console.log('imin_second=',imin_second);
        
        /* update origin_coords */
        if (imin > imin_second){
            if (imin == orig.length-1){
                // between i=N and i=0
                origin_coords.push(target);
            } else {
                // other
                origin_coords.splice(imin_second+1, 0, target);
            }
        } else {
            if (imin_second == orig.length-1){
                origin_coords.push(target);
            } else {
                origin_coords.splice(imin+1, 0, target);
            }
        }
        reload();
    };
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
            controller.dragon();
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
                        console.log(el);
                        move_origin_vertex(i, [el.cx(), el.cy()]);
                    }
                    return f
                }(i)
            );
        }
        return calls
    };
    
    var that = {};

    that.width = width;
    that.height = height;

    that.set_depth = set_depth;
    that.set_relative_koef = function(k){ relative_koef = k; update_fractals(); };
    that.set_origin = function ( coords ){ origin_coords = coords; update_fractals(); } // ??? length(coords) != length()
    
    that.get_bgrect = function(){ return bgrect };
    that.get_polys = function(){ return polystack }
    that.get_fractals = function() { return fractals }; // array of fractals' coords
    that.get_draggers = function(){ return origindraggers };
    that.get_draggers_callbacks = get_draggers_callbacks;
    that.get_origin_coords = function(){ return origin_coords }

    that.move_origin_vertex = move_origin_vertex;
    that.add_origin_vertex = add_origin_vertex;
    
    that.set_view = function(v){ view = v; }
    that.set_controller = function(c){ controller = c; }
    
    that.init = function(){
        var i;
        svgobj = SVG('draw').size(width, height);
        bgrect = svgobj.rect(width, height);

        polygroup = svgobj.group();
        
        relative_koef = document.getElementById('range--corners').value;
        last_relative_koef = relative_koef;
        
        depth = document.getElementById('range--children').value;
        draggers_group = svgobj.group();
        
        reload();        
//        fractals.push( origin_coords );
//        polystack.push( polygroup.polygon(origin_coords) );
//        last_draw_depth = 1;
//        
//        draggers_group = svgobj.group();
//        for (i = 0; i < origin_coords.length; i += 1){
//            origindraggers.push( draggers_group.circle(20) );
//            origindraggers[i].attr({cx: origin_coords[i][0], cy: origin_coords[i][1]})
//        }
//        update_fractals();
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
    
    var draggers_common_attr = {fill: 'blue', r: 10};
    
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
        }
            
    }
    
    var that = {};
    
    
    that.render = function(){
        draw_fractals();
        ui_update();
    };
    that.set_polycolor_1 = function(rgb){
        color_set.bgpoly[0] = rgb;
        that.render();
    };
    that.set_polycolor_2 = function(rgb){
        color_set.bgpoly[1] = rgb;
        that.render();
    };
    that.set_linecolor_1 = function(rgb){
        color_set.lines[0] = rgb;
        that.render();
    };
    that.set_linecolor_2 = function(rgb){
        color_set.lines[1] = rgb;
        that.render();
    };
    that.set_bgcolor = function(rgb){
        color_set.bg = rgb;
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
    var poly_bg_picker_1 = document.getElementById("color-poly--1");
    var poly_bg_picker_2 = document.getElementById("color-poly--2");
    var line_picker_1 = document.getElementById("color-lines--1");
    var line_picker_2 = document.getElementById("color-lines--2");
    var bg_picker = document.getElementById("color-bg");
    
    var check_poly = document.getElementById('check--showpoly');
    var check_lines = document.getElementById('check--showlines');
    
    var that = {};
    
    that.set_depth = function (depth){
        model.set_depth(depth);
        view.render();
    }
    
    that.set_relkoef = function(k){
        model.set_relative_koef(k);
        view.render();
    }
    
    /* ************************** */
    /* events */
    // adds EventListener for coloring
    function colorPickListener(inp, update_func){
        inp.addEventListener("change", function(e){
            var color = hex_string_to_colorobj(e.target.value)            
            update_func(color);
        });
    };
    
    function checkBoolListener(check, update_func){
        check.addEventListener('change', function(e){
            update_func( e.target.checked );
        });
    };
    
    function dragndropListener(){
        var draggers = model.get_draggers();
        var callbacks = model.get_draggers_callbacks();
        var i;
        for (i = 0; i < draggers.length; i += 1){
            make_draggable(draggers[i], callbacks[i]);
        }
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
    
    that.dragon = dragndropListener;

    that.dragon();
    model.set_controller(that);
    /* ************************** */
    return that
}
/* ************************************************************************** */


/* GLOBAL VARIABLES DEFINITION */
/* SVG.js objects */
var draw;
var M, V;

/* ************************ */
/* fractal parameters */

