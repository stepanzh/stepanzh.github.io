function runChapter(chapter){
  var half_op = 0.6;
  chapter.addClass("visited");
  chapter.animate({opacity: 1}, 3000, function(){
    chapter.find(".marker-chapter #outter").animate({opacity: half_op}, 1000, function(){
      chapter.find(".scroll-bar.non-filled").animate({height: "100%"}, 1000, function(){
        chapter.find(".chapter-header").animate({opacity: 1}, 1000);
        chapter.find(".marker-chapter #inner").animate({fillOpacity: 1}, 1000, function(){
          chapter.find(".marker-chapter #outter").animate({opacity: 1}, 500, function(){
            var slide_time = 5000;
            chapter.find(".chapter-text").slideDown(slide_time);
            chapter.find(".scroll-bar.filled").animate({height: "100%"}, slide_time, function(){
              chapter.find(".chapter-gallery").animate({opacity: 1}, 3000);
            });
          });
        });
        
      });
    });
  });
}

function runHead(){
  $(".header").animate({opacity: 1}, 2000, function(){
    $(this).find(".caption").animate({opacity: 1}, 1000, function(){
      $("#menu").animate({opacity: 1}, 100, function(){
        var dur = 500;
        var delay = 0;
        $(this).find("li").each(function(){
          $(this).delay(delay).animate({opacity: 1}, dur);
          delay += dur;
        });
      });
    });
  });
}

var curChap = $("li:first-child");

$("#menu li").each(function(){
  $(this).on("click", function(){
    var isActive = $(this).hasClass("active");
    var isCurrent = $(this).hasClass("current");
    
    var chap = $("#ch"+$(this).text().slice(-1));
    
    if ( !isActive ){
      return;
    } else if ( isCurrent ){
      $("html, body").animate({scrollTop: chap.offset().top});
    } else if (isActive){
      
      curChap.removeClass("current");
      
      curChap = $(this);
      
      
      $(this).addClass("current");
      $(this).next().addClass("active");
      $(this).next().removeClass("non-active");
      
      if ( ! chap.hasClass("visited") ){
        /*chap.css("display", "grid");*/
        $("html, body").animate({scrollTop: chap.offset().top});
        runChapter(chap);
        
        
        $("#menu .scroll-bar.filled").animate({height: "0%"}, 250);
        $("#menu .scroll-bar.non-filled").delay(250).animate({height: "0%"}, 750);
        
        $("#menu .scroll-bar.non-filled").delay(2000).animate({height: "100%"}, 1000)
          .next().delay(5000).animate({height: "100%"}, 1000);
        
      } else {
        $("html, body").animate({scrollTop: chap.offset().top});
      }
      
    }
  });
});

function loopMsg(){
  $("#menu li:first-child div.menu.marker").animate({opacity: 1}, 500, function(){
    $("#menu li:first-child div.menu.marker").animate({opacity: 0}, 500, loopMsg());
  });
}

$(document).ready(function(){
  runHead();

  /* LOOP UX for 1st click */

  var isClicked = false;

  loopMsg();

  $("#menu li:first-child").on("click", function(){
    if (!isClicked) {  
      isClicked = true;
      $(this).find("div.menu.marker").stop(true).css({opacity:1});
    }
  });

});
