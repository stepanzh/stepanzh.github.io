var randomInteger = function (min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand);
  return rand;
};

var randomElement = function(array_like){
  return array_like[ randomInteger(0, array_like.length-1) ]
};

var getStarCount = function(){
  var count;
  var screen_width = window.screen.width;
  
  if (screen_width <= 380){
    count = 20;
  } else if (screen_width < 800){
    count = 50;
  } else {
    count = 100;
  }
  
  return count
};

var getBlinkPeriod = function(){
  var period;
  var screen_width = window.screen.width;
  
  if (screen_width <= 380){
    period = 2000;
  } else if (screen_width < 800){
    period = 500;
  } else {
    period = 300;
  }
  
  return period
};

var setSize = function(el){
  var h;
  var pw = el.parentElement.clientWidth;
  var ph = el.parentElement.clientHeight;
  
  h = Math.floor(10 + 2 * Math.sqrt(pw*pw/4 + ph*ph));
  
  el.style.width = h + "px";
  el.style.height = h + "px";
};

var genStar = function(kwargs){
  var star = document.createElement("div");
  var star_class;
  
  x = kwargs.x;
  y = kwargs.y;
  size = kwargs.size;
  color = kwargs.color;
  
  star.style.left = x + "%";
  star.style.top = y + "%";
  
  star_class_size = "star--" + size;
  star_class_color = "star--" + color;
  
  star.className += "star" + " " + star_class_size + " " + star_class_color;
  
  return star
};

var genStars = function(kwargs){
  where = kwargs.where;
  n = kwargs.n;
  sizes = kwargs.sizes;
  colors = kwargs.colors;
  
  var i, star, size, color, x, y;
  var stars = [];
  console.log("Star generation");
  for ( i = 0; i < n; i += 1){
    x = randomInteger(0, 100);
    y = randomInteger(0, 100);
    size = randomElement(sizes);
    color = randomElement(colors);
    
    star = genStar(
      {x: x, y: y, size: size, color: color}
    );
    where.appendChild(star);
    stars.push(star);
  }
  return stars
};

var starBlink = function(star){
  var class_string = star.className;
  var xc, yc;
  xc = star.offsetLeft + star.offsetWidth / 2;
  yc = star.offsetTop + star.offsetHeight / 2;
  if (xc > 0 && yc > 0){
    if (class_string.indexOf(STAR_BLINK_CLASS) === -1){
      star.classList.add(STAR_BLINK_CLASS);
//      star.style.width = .7 * star.offsetWidth + "px";
//      star.style.height = .7 * star.offsetHeight + "px";
      setTimeout(function(){
        star.classList.remove(STAR_BLINK_CLASS);
//        star.style.width = "";
//        star.style.height = "";
      }, 300);
    };
  }
};

var randomStarsBlink = function(n, stars){
  var star, i;
  n = Math.min(n, stars.length);
  for (i = 0; i < n; i += 1){
    star = randomElement(stars);
    starBlink(star);
  }
};

const STAR_SIZES = [
  "big", "medium", "small"
];
const STAR_COLORS = [
  "yellow", "blue", "red", "white"
];

const STAR_COUNT = getStarCount();
const STAR_BLINK_CLASS = "js-blink";
const STAR_BLINK_PERIOD = getBlinkPeriod();

var stars_holder = document.getElementsByClassName('sky__stars')[0];

//setSize(stars_holder);

var stars = genStars(
  {
    where: stars_holder,
    n: STAR_COUNT,
    sizes: STAR_SIZES,
    colors: STAR_COLORS
  }
);

setInterval(function(){
  starBlink(randomElement(stars));
}, STAR_BLINK_PERIOD);