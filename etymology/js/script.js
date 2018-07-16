function slickNext(){
    $cards.slick("slickNext");
}

function showCount(){
    var s = " " + q_num + " / " + NUM_OF_QUESTIONS;
    p_counter.text(s);
    p_counter.css("display", "block");
}

function hideCount(){
    p_counter.css("display", "none");
}

function moveFromStartToQuestion(){
    slickNext();
    state = 1;
    q_num = 1;
    p_title.text(TITLES["q"]);
    btn_start.css("display", "none");
    btns_ans.css("display", "flex");
    showCount();
}

function moveToQuestion(){
    state = 1;
    q_num++;
    p_title.text(TITLES["q"]);
    btn_next.css("display", "none");
    btns_ans.css("display", "flex");
    slickNext();
    showCount();
}

function moveToAnswer(ans){
    var corr_ans = ANSWERS[q_num-1];
    if ( ans == corr_ans ){
        p_title.text(TITLES["corr"]);
        score++;
    } else {
        p_title.text(TITLES["wrong"]);
    }
    state = 2;
    hideCount();
    btns_ans.css("display", "none");
    btn_next.css("display", "flex");
    slickNext();
}

function getRating(){
    var rate = score / NUM_OF_QUESTIONS;
    if ( rate < 0.075 ){return 0}
    else if ( (rate >= 0.075) && (rate < 0.2375) ){return 1}
    else if ( rate >= 0.2375 && rate < 0.4){return 2}
    else if ( rate >= 0.4 && rate < 0.6){return 3}
    else if ( rate >= 0.6 && rate < 0.7625){return 4}
    else if ( rate >= 0.7625 && rate < 0.925){return 5}
    else if ( rate >= 0.925 && rate < 1){return 6}
    else if (score == NUM_OF_QUESTIONS){return 7}
}
/*
function testRating(){
    for (var i=0;i<34;i++){
        score=i;
        r=getRating();
        var s = i + " " + RANKS[r];
        console.log(s);
    }
}*/

function moveToEnd(){
    var score_str = score + " из " + NUM_OF_QUESTIONS;
    var rank_obj = RANKS[ getRating() ];
    
    state = 3;
    p_title.text(TITLES["end"]);
    $("#score").text(score_str);
    $("#nickname").text(rank_obj["name"]);
    //$(".ya-share2").attr("data-image", rank_obj["img"] );
    $(".ya-share2").attr("data-description", "TEST DESCRIPTION" );
    
    btn_next.css("display", "none");
    btn_share.css("display", "flex");
    slickNext();
}

const TITLES = {"q": "Наше?","corr": "Верно!", "wrong": "Не-а...", "end": "Поздравляем!"};

const NUM_OF_QUESTIONS = ( document.getElementsByClassName("card-wrapper").length - 2 ) / 2 ;
const ANSWERS = [true, true, false, true, false, false, true, false, false, true, true, false, false, false, true, false, false, false, true, false, true, true, false, true, false, true, true, false, true, true, false, false, true];
const RANKS = [{"name":"дикарь","img":"https://stepanzh.github.io/etymology/img/Risovach.jpg"}, "профан", "простак","школяр","грамотей","эрудит","лингвист","Макс Фасмер"]

const p_title = $("#title p");
const p_counter = $("#counter");
const btn_start = $(".btn#start");
const btns_ans = $(".btns#yes-no");
const btn_next = $(".btn#next");
const btn_share = $(".btn#share");

var state = 0; /* 0=start 1=question 2=answer 3=end */
var q_num = 0;
var score = 0;

var $cards = $("#deck");
var on_click = false;


$cards.slick({
  arrows: false,
  slidesToShow: 1,
    infinite: false,
    
    draggable: false,
    accessibility: false,
    touchMove: false,
    swipe: false,
    
    speed: 500,
    responsive: [
        {
            breakpoint: 768,
            settings: {
            speed: 1000
            }
        }
    ]
});

/* CLICK events */
btn_start.on("click", function(){
    if ( ! on_click ){
        moveFromStartToQuestion();
    }
});
btn_next.on("click", function(){
    if ( ! on_click ){
        if ( q_num == NUM_OF_QUESTIONS ){
            moveToEnd();
        } else {
            moveToQuestion();
        }
    }
});
$(".btn#yes").on("click", function(){
    if ( ! on_click ){
        moveToAnswer(true);
    }
});
$(".btn#no").on("click", function(){
    if ( ! on_click ){
        moveToAnswer(false);
    }
});
$cards.on("beforeChange", function(){
    on_click = true;
});
$cards.on("afterChange", function(){
    on_click = false;
});

$(document).on("keypress", function (e){
    var key = e.originalEvent.keyCode;
    if ( key == 0){
        key = e.originalEvent.which;
    }
    console.log(e);
    console.log(key);
    if (key == 13 || key == 32){
        if ( state == 0 ){
            btn_start.trigger("click");
        } else if ( state == 2 ){
            btn_next.trigger("click");
        }
    }
    if ( key == 37 ){
        if ( state == 1 ){
            $(".btn#yes").trigger("click");
        } else if ( state == 0 ){
            btn_start.trigger("click");
        } else if ( state == 2 ){
            btn_next.trigger("click");
        }
    }
    if ( key == 39 ){
        if ( state == 1 ){
            $(".btn#no").trigger("click");
        } else if ( state == 0 ){
            btn_start.trigger("click");
        } else if ( state == 2 ){
            btn_next.trigger("click");
        }
    }
  
}); 
