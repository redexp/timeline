(function($){

    $.fn.timeline = function(ops){
        ops = $.extend({
            width: 600,
            duration: 1,
            sectionDuration: 1
        }, ops || {});

        this
            .css('width', ops.width + 'px')
            .data({
                'px/sec':   ops.width / ops.duration,
                'tagTpl':   this.find('.tag').detach(),
                'frameTpl': this.find('.frame').detach()
            })
        ;

        resetFrames(this, ops);

        if( ops.tags ) {
            for(var i = 0; i < ops.tags.length; i++) {
                addTag(this, ops.tags[i]);
            }
        }

        return this;
    };

    var helper, helperLine, curTag, tagsList, tagsLines, linesCount, fakeLine;

    function onStart(e, ui){
        curTag = ui.helper;

        helper = curTag.clone()
            .appendTo('.tags-lines li:first')
            .addClass('helper')
        ;

        tagsLines  = curTag.closest('.tags-lines');
        tagsList   = tagsLines.find('.tag').not(helper);
        linesCount = tagsLines.find('li').length - 1;
        helperLine = 0;
        fakeLine   = false;
    }

    function onDrag(){
        helperLine = getTagFreeLine(curTag, tagsList);

        if( helperLine == curTag.data('line') ) {
            helper.hide();
            return;
        }

        helper
            .css(curTag.css(['left', 'width']))
            .css('top', 30 * helperLine + 'px')
            .show()
        ;

        if( helperLine > linesCount && ! fakeLine ) {
            tagsLines.append('<li>');
            fakeLine = true;
        }
        else if(helperLine <= linesCount && fakeLine) {
            tagsLines.find('li').last().remove();
            fakeLine = false;
        }
    }

    function onStop(){
        setTagToLine(curTag, helperLine);

        helper.remove();

        tagsLines.find('li').not(':first').find('.tag').not(curTag).each(function(){
            var $this = $(this);
            setTagToLine($this, getTagFreeLine($this, tagsList));
        });

        var lastLi = tagsLines.find('li').last();
        if( lastLi.children().length == 0 ) {
            lastLi.remove();
        }
    }

    function addTag(cont, tag) {
        var lines = cont.find('.tags-lines'),
            pxSec = cont.data('px/sec');

        for(var i = lines.find('li').length; i <= tag.line; i++) {
            lines.append('<li>');
        }

        var li = lines.find('li').eq(tag.line);

        cont.data('tagTpl').clone()
            .appendTo(li)
            .data('line', li.index())
            .css({
                left:  tag.time * pxSec + 'px',
                width: tag.length * pxSec + 'px'
            })
            .draggable({
                containment: '.tags-lines',
                axis:        "x",
                zIndex:      1000,
                start:       onStart,
                drag:        onDrag,
                stop:        onStop
            })
            .resizable({
                containment: '.tags-lines',
                handles:     "e",
                start:       onStart,
                resize:      onDrag,
                stop:        onStop
            })
            .find('.title').html(tag.title)
        ;
    }

    var getTagFreeLine = (function(){
        var dummy = $('<div class="tag">').css('opacity', 0);

        function moveHelperOnFreeLine(elem, list, line) {
            for(var i = 0; i < list.length; i++) {
                if( overlaps(elem, list[i]) ) {
                    elem.css('top', 30 * ++line + 'px');
                    return moveHelperOnFreeLine(elem, list, line);
                }
            }

            return line;
        }

        var overlaps = (function(){
            function getPositions(elem) {
                var rect = $(elem).get(0).getBoundingClientRect();
                return [ [ rect.left, rect.left + rect.width ], [ rect.top, rect.top + rect.height ] ];
            }

            function comparePositions(p1, p2) {
                var r1 = p1[0] < p2[0] ? p1 : p2,
                    r2 = p1[0] < p2[0] ? p2 : p1;
                return r1[1] > r2[0] || r1[0] === r2[0];
            }

            return function (a, b) {
                var pos1 = getPositions(a),
                    pos2 = getPositions(b);
                return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
            };
        })();

        return function(tag, list){
            dummy
                .appendTo(tag.closest('ul').children().first())
                .css(tag.css(['left', 'width']))
                .css('top', '0px')
            ;

            var line = moveHelperOnFreeLine(dummy, list.not(tag), 0);

            dummy.detach();

            return line;
        }
    })();

    function setTagToLine(tag, line) {
        if( line == tag.data('line') ) return;

        var li = tag.closest('.tags-lines').find('li').eq(line);
        tag
            .appendTo(li)
            .data('line', line)
        ;
    }

    var resetFrames = (function(){
        function pad(num, size) {
            num = "" + num;
            var s = "000000000" + num;
            return num.length < size ? s.substr(s.length - size) : num;
        }

        function formatTime($value) {
            var $m = Math.floor($value / 60),
                $s = $value % 60;
            return pad($m, 2) + ':' + pad($s, 2);
        }

        return function(cont, ops) {
            var pxSec    = cont.data('px/sec'),
                frames   = cont.find('.frames'),
                frameTpl = cont.data('frameTpl');

            frames.find('.frame').remove();

            for(var i = 0; i <= ops.duration; i += ops.sectionDuration) {
                frameTpl.clone()
                    .appendTo(frames)
                    .css('left', i * pxSec + 'px')
                    .find('.time').html(formatTime(i))
                ;
            }
        }
    })();

})(jQuery);

jQuery(function($){

    $('.timeline').timeline({
        duration: 60 * 2,
        sectionDuration: 30,
        width: 600,
        tags: [
            {title: 'One', line: 0, time: 0, length: 15},
            {title: 'Two', line: 0, time: 30, length: 15},
            {title: 'Three', line: 1, time: 5, length: 20},
            {title: 'Four', line: 1, time: 30, length: 10}
        ]
    });

});