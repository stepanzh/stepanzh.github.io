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
    var origin_coords = [[0, 0], [500, 0], [250, 500]];
    var fractals = [];
    var relative_koef;
    var depth; // parent + children
    var width = 500, height = 500;
    var svgobj;
    
    var polystack = [];
    var last_draw_depth = 0, last_draw_vertexes, last_relative_koef;
    
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
        console.log('depth/last: ', depth, last_draw_depth);
        console.log('fractals before update', fractals);
        console.log('rel/last', relative_koef, last_relative_koef);
        /* origin_coords change? */
        /* rel_koef change? */
        if (relative_koef != last_relative_koef){
            console.log('rel_koef changed!');
            /* go through childs, update its coordinates and synchronize_coords */
            for (i = 1; i < fractals.length; i += 1){
                parent_coords = [];
                for (j = 0; j < fractals[i-1].length; j += 1){
                    parent_coords.push([ fractals[i-1][j][0], fractals[i-1][j][1] ]);
                }
                child_coords = calc_child(parent_coords);
                fractals[i] =  child_coords;
                console.log('parent: ', parent_coords);
                console.log('child: ', child_coords);
            }
            synchronize_coords();
            last_relative_koef = relative_koef;
        };
        
        /* number of fractals change? */
        /* number of fractals raise */
        for ( i = last_draw_depth; i < depth; i += 1){
            child_coords = calc_child( fractals[i-1] );
            fractals.push( child_coords );
            polystack.push( svgobj.polygon(child_coords) );//fractals[i] ) );
        }
        /* number of fractals decrease: depth < last_draw_depth */
        for ( i = depth; i < last_draw_depth; i += 1){
            console.log('popping');
            fractals.pop();
            polystack.pop().remove().forget();
        }
        
        console.log('fractals after update', fractals);
        last_draw_depth = depth;
    };
    
    var synchronize_coords = function(){
        var i, j;
        console.log(fractals);
        for (i = 0; i < fractals.length; i += 1){
            for (j = 0; j < fractals[i].length; j += 1){
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
   
    
    var that = {};
    that.width = width;
    that.height = height;
    that.get_fractals = function() { return fractals }; // array of fractals' coords
    that.set_depth = set_depth;
    that.set_relative_koef = function(k){ relative_koef = k; update_fractals(); };
//    that.set_origin = function ( coords ){ origin_coords = coords; update_fractals(); }
    that.init = function(){
        svgobj = SVG('draw').size(width, height);
        
        relative_koef = document.getElementById('range--corners').value;
        last_relative_koef = relative_koef;
        
        depth = document.getElementById('range--children').value;
        
        fractals.push( origin_coords );
        polystack.push( svgobj.polygon(origin_coords) );
        last_draw_depth = 1;

        update_fractals();
    }
    that.get_polys = function(){ return polystack }
    
    
    that.init();
    return that
};
/* ************************************************************************** */



/* View */
/* ************************************************************************** */
var View = function(model) {
    var svgobj = model.svgobj;
    var polystack; /* actual stack of SVG.Polygon objects */
    var poly_bg_colors = [
        {
            r: 255,
            g: 0,
            b: 0
        },
        {
            r: 0,
            g: 255,
            b: 0
        }
    ];

    function draw_fractal(p, bgfill, sfill){
        p.attr({
              fill: bgfill,
              'fill-opacity': 1,
              stroke: '#000',
              'stroke-width': 1,
        });
    }
    
    function draw_fractals(){
        var i, d, f, bgc;
        var ps = model.get_polys(); // coords of fractals
        var depth = ps.length;
        
        for (d = 0; d < depth; d += 1){
            p = ps[d];
            bgc = gradient(poly_bg_colors, d / ( (depth > 1 ? depth : 2) - 1 ));
            draw_fractal(p, bgc);
        }
    }
    
    var that = {};
    
    
    that.render = draw_fractals;
    that.set_bgcolor_1 = function(rgb){
        poly_bg_colors[0] = rgb;
        that.render();
    };
    that.set_bgcolor_2 = function(rgb){
        poly_bg_colors[1] = rgb;
        that.render();
    };
    
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
    
    depth_input.oninput = function(){
        that.set_depth( parseInt(this.value) );
    }
    rel_koef_input.oninput = function(){
        that.set_relkoef( parseFloat(this.value) );
    }
    colorPickListener(poly_bg_picker_1, view.set_bgcolor_1);
    colorPickListener(poly_bg_picker_2, view.set_bgcolor_2);
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

