var createFigure = function(){
    var createPoints = function(type){
        var points = [];
        //   first point is center of rotation
        if (type == 0){
            //  000
            //   0
            points.push({x: 4, y: -2});
            points.push({x: 4, y: -1});
            points.push({x: 3, y: -2});
            points.push({x: 5, y: -2});
        } else if (type == 1){
            //  0000
            points.push({x:4, y: -1});
            points.push({x:3, y: -1});
            points.push({x:5, y: -1});
            points.push({x:6, y: -1});
        } else if (type == 2){
            //  00
            //   00
            points.push({x:4, y: -2});
            points.push({x:4, y: -1});
            points.push({x:3, y: -2});
            points.push({x:5, y: -1});
        } else if (type == 3){
            //   00
            //  00
            points.push({x:4, y: -2});
            points.push({x:4, y: -1});
            points.push({x:3, y: -1});
            points.push({x:5, y: -2});
        } else if (type == 4){
            //  00
            //  00
            points.push({x:4, y: -2});
            points.push({x:4, y: -1});
            points.push({x:5, y: -1});
            points.push({x:5, y: -2});
        } else if (type == 5){
            //  00
            //  0
            //  0
            points.push({x:5, y: -3});
            points.push({x:5, y: -2});
            points.push({x:5, y: -1});
            points.push({x:6, y: -3});
        } else if (type == 6){
            //  00
            //   0
            //   0
            points.push({x:5, y: -3});
            points.push({x:5, y: -2});
            points.push({x:5, y: -1});
            points.push({x:4, y: -3});
        }
        return points
    };
    
    var shiftCoordDown = function(){
        var new_y, x, y, could_move = true;
        //   check if can move
        for (var i = 0; i < points.length; i += 1){
            x = points[i].x;
            y = points[i].y;
            new_y = y + 1;
            
            if ( new_y < cell_matrix.height){
                if (new_y >= 0){
                  if ( cell_matrix[ new_y ][ x ].occupied !== false ){
                      could_move = false;
                      break;
                  }
                }
            } else {
                could_move = false;
                break;
            }
        }
        //   if can move shift
        if (could_move === true){
          for (var i = 0; i < points.length; i += 1){
              points[i].y += 1;
          }
        }
        return could_move
    };
    
    var shiftCoordLeft = function(){
        var new_x, x, y, could_move = true;
        //   check if can move
        for (var i = 0; i < points.length; i += 1){
            x = points[i].x;
            y = points[i].y;
            new_x = x - 1;
            
            if (new_x >= 0){
                if (y >= 0){
                    if ( cell_matrix[ y ][ new_x ].occupied !== false ){
                        could_move = false;
                        break;
                    }
                }
            } else {
                could_move = false;
                break;
            }
        }
        //   if can move shift
        if (could_move === true){
          for (var i = 0; i < points.length; i += 1){
              points[i].x -= 1;
          }
        }
    };
    
    var shiftCoordRight = function(){
        var new_x, x, y, could_move = true;
        //   check if can move
        for (var i = 0; i < points.length; i += 1){
            x = points[i].x;
            y = points[i].y;
            new_x = x + 1;

            
            if (new_x < cell_matrix.width){
                if (y >= 0){
                    if ( cell_matrix[ y ][ new_x ].occupied !== false ){
                        could_move = false;
                        break;
                    }
                }
            } else {
                could_move = false;
                break;
            }
        }
        //   if can move shift
        if (could_move === true){
          for (var i = 0; i < points.length; i += 1){
              points[i].x += 1;
          }
        }
    };
    
    var rotate = function(){
        var new_points = [];
        var i, j, x, y, dx = 0;
        //var can_rotate = true;
        
        //   rotate
        var centerx = points[0].x, centery = points[0].y;
        for (i = 0; i < points.length; i += 1){
            x = - points[i].y + centery + centerx;
            y = points[i].x - centerx + centery;
        
            if (y > cell_matrix.height - 1){
          //      can_rotate = false;
                return
            }
            
            if (x < 0){
                if ( dx < -x ){
                    dx = -x;
                }
            }
            
            if (x > cell_matrix.width - 1){
                if ( dx > - x + cell_matrix.width - 1 ){
                    dx = - x + cell_matrix.width - 1;
                }
            }
            
            new_points.push({
              x: x,
              y: y
            });
        
        }

        //if (can_rotate === true){
          for (i = 0; i < points.length; i += 1){
              
              new_points[i].x += dx;
              if (new_points[i].y > 0){
                  if ( cell_matrix[ new_points[i].y ][ new_points[i].x ].occupied === true ){
            //          can_rotate = false;
                      return 
                  }
              }
          }
        //}
        
        
        //if ( can_rotate === true ){
            for (i = 0; i < points.length; i += 1){
                points[i] = new_points[i];
            }
        //}
    };
    
    var drawSelf = function(){
        var x, y;
        for (var i = 0; i < points.length; i += 1){
            x = points[i].x;
            y = points[i].y;
            if ( x >= 0 && y >= 0 ){
              if ( x < cell_matrix.width && y < cell_matrix.height ){
                //cell_matrix[ y ][ x ].style.background = 'red';
                cell_matrix[ y ][ x ].style.fillOpacity = 1;
              }
            } 
        }
    };
    
    //   0 .. 6, 7 figure types
    var type = Math.floor( Math.random() * 7 );
    //var type = 0;
    var points = createPoints(type);
    //var new_points = [];
    var that = {};
    
    that.points = points;
    
    that.down = shiftCoordDown;
    that.left = shiftCoordLeft;
    that.right = shiftCoordRight;
    
    if (type === 4){
        that.rotate = function(){};
    } else {
        that.rotate = rotate;
    }
    
    
    that.draw = drawSelf;
    
    return that
};

function createCells(){
    var rows = 20, cols = 10,
        cell_side = 20;
    var width = cols * cell_side;
    var i, j, left, top, cell, cell_row;
    
    var cell_matrix = [];
    cell_matrix.height = rows;
    cell_matrix.width = cols;
    
    for (i = 0; i < rows; i += 1){
        top = i * cell_side;
        
        cell_row = [];
        for (j = 0; j < cols; j += 1){
            left = j * cell_side;
            cell = document.createElement('div');
            cell.classList.add(cell_class_name);
            cell.occupied = false;
            cell.style.top = top + 'px';
            cell.style.left = left + 'px';
            cell.style.width = cell_side + 'px';
            cell.style.height = cell_side + 'px';
            holder.appendChild(cell);
            
            cell_row.push(cell);
        }
        cell_matrix.push(cell_row);
    }
    return cell_matrix
}

function remove_line(){
    var i, j;
    
    for ( i = cell_matrix.height - 1; i >= 0; i -= 1 ){
        
        all_occupied = true;
        for ( j = cell_matrix.width - 1; j >= 0; j -= 1 ){
            all_occupied *= cell_matrix[i][j].occupied;
        }
        if (all_occupied){
            for (ii = i; ii >= 1; ii -= 1 ){
                for (j = 0; j < cell_matrix.width; j += 1){
                    cell_matrix[ii][j].occupied = cell_matrix[ii-1][j].occupied;
                }
            }
            
            for (j = 0; j < cell_matrix.width; j += 1){
                cell_matrix[0][j].occupied = false;
            }
            
            return true;
        }
    }
    return false
};

document.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown'){
        fig.down();
    } else if (e.key === 'ArrowLeft'){
        fig.left();
    } else if (e.key === 'ArrowRight'){
        fig.right();
    } else if (e.key === ' '){
        fig.rotate();
    }
});


document.getElementById('btn-left').addEventListener('click', function(e){
    fig.left();
});
document.getElementById('btn-right').addEventListener('click', function(e){
    fig.right();
});
document.getElementById('btn-down').addEventListener('click', function(e){
    fig.down();
});
document.getElementById('btn-rot').addEventListener('click', function(e){
    fig.rotate();
});
document.getElementById('btn-init').addEventListener('click', function(e){
    init();
    this.style.display = 'none';
});


function update(delta) {
    var is_moved, x, y, game_over, i, j;
    is_moved = fig.down();
    
    //   if not moved
    if ( is_moved === false ){
        console.log();
        for (i = 0; i < fig.points.length; i += 1 ){
            x = fig.points[i].x;
            y = fig.points[i].y;
            
            if (y >= 0){
              cell_matrix[ y ][ x ].occupied = true;
            } else {
                game_over = true;
                break;
            }
        }
        if (game_over === true){
            stop();
            gameover();
            return
        }
        //  check for new score
        while (true){
            is_moved = remove_line();
            if (is_moved === false){
                break;
            }
            score += 1;
        }
        fig = createFigure();
    }
    
}

function draw(interp) {
    for (var i = 0; i < cell_matrix.length; i += 1){
        for (var j = 0; j < cell_matrix[i].length; j += 1){
            if ( cell_matrix[i][j].occupied === true ){
                //cell_matrix[i][j].style.background = 'black';
                cell_matrix[i][j].style.fillOpacity = 1;
            } else {
                //cell_matrix[i][j].style.background = 'grey';
                cell_matrix[i][j].style.fillOpacity = 0;
            }
        }
    }
    
    fig.draw();
    document.getElementById('score').innerHTML = 'Счёт: ' + score;
}

function panic() {
    delta = 0;
}

function begin() {
}

function stop() {
    running = false;
    started = false;
    cancelAnimationFrame(frameID);
}

function start() {
    if (!started) {
        started = true;
        frameID = requestAnimationFrame(function(timestamp) {
            draw(1);
            running = true;
            lastFrameTimeMs = timestamp;
            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            frameID = requestAnimationFrame(mainLoop);
        });
    }
}

function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        frameID = requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    begin(timestamp, delta);

    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;

        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);
        if (!running) {return}
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }
    
    draw(delta / timestep);

    
    frameID = requestAnimationFrame(mainLoop);
}

function gameover(){
    document.getElementById('btn-left').style.display = 'none';
    document.getElementById('btn-right').style.display = 'none';
    document.getElementById('btn-down').style.display = 'none';
    document.getElementById('btn-rot').style.display = 'none';
    
    document.getElementById('btn-init').style.display = 'block';
};

function createMatrixFromPathes(width, height){
    var path_list = document.querySelectorAll('path');
    var row, matrix = [], path;
    for (var i = 0; i < height; i += 1){
        row = [];
        for (var j = 0; j < width; j +=1){
            path = path_list[ width*i + j ];
            path.occupied = false;
            row.push(path);
        }
        matrix.push(row);
    }
    matrix.width = width;
    matrix.height = height;
    return matrix
}

function init(){
    holder = document.getElementById('grid');
    cell_class_name = 'cell';
    
    //  model variables
    matrix_width = 10;
    matrix_height = 20;
    cell_matrix = createMatrixFromPathes(matrix_width, matrix_height);
    
    //  view
    fig = createFigure();
    score = 0;
    
    document.getElementById('btn-left').style.display = 'block';
    document.getElementById('btn-right').style.display = 'block';
    document.getElementById('btn-down').style.display = 'block';
    document.getElementById('btn-rot').style.display = 'block';
    
    //   game cycle variables
    limit = 300;
    lastFrameTimeMs = 0;
    maxFPS = 60;
    delta = 0;
    fps = 2;
    timestep = 1000 / fps;
    framesThisSecond = 0;
    lastFpsUpdate = 0;
    running = false;
    started = false;
    frameID = 0;
    
    start();
}

var holder,
    cell_class_name,
    //  model variables
    matrix_width,
    matrix_height,
    cell_matrix,
    fig,
    score,
    
    //   game cycle variables
    limit,
    lastFrameTimeMs,
    maxFPS,
    delta,
    fps,
    timestep,
    framesThisSecond,
    lastFpsUpdate,
    running,
    started,
    frameID;

gameover();
