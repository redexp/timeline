jQuery(function($){

    var timeline = new Timeline('.timeline', {
        width: 600 - 18 * 2,
        duration: 46.54,
        framesNumber: 10
    });

    videojs.options.flash.swf = "js/video-js/video-js.swf";

    videojs(
        "video-player",
        {
            width: 600,
            height: 400,
            controls: true,
            autoplay: false,
            preload: "auto"
        }
    ).ready(function(){
            var player = this;

            player.src({type: 'video/mp4', src: 'http://video-js.zencoder.com/oceans-clip.mp4'});

            player.on('timeupdate', function(){
                timeline.goTo(player.currentTime());
            });
        });

    var buttons = $('.tag-buttons button').click(function(){
        buttons.removeClass('active');
        $(this).addClass('active');
    });

    $('.sidebar form').submit(function(){
        var tag = {
            title:  buttons.filter('.active').html(),
            start:  this['start'].value,
            length: this['length'].value
        };

        timeline.addTag(tag);

        return false;
    });

});
