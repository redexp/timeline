(function($){

    window.Timeline = function(cont, ops) {
        var root = $(cont);

        this.cont = root;

        root
            .css('width', ops.width + 'px')
            .data({
                'px/sec':   ops.width / ops.duration,
                'tagTpl':   root.find('.tag').detach(),
                'frameTpl': root.find('.frame').detach()
            })
        ;

        resetFrames(root, ops);

        if( ops.tags ) {
            for(var i = 0; i < ops.tags.length; i++) {
                addTag(root, ops.tags[i]);
            }
        }

        root.find('.pointer').css('left', '0px');

        root.data('timeline', this);
    };
    Timeline.prototype.tick = function(){
        this.cont.find('.pointer').css('left', '+=' + this.cont.data('px/sec'));
        return this;
    };
    Timeline.prototype.goTo = function(sec){
        this.cont.find('.pointer').css('left', sec * this.cont.data('px/sec') + 'px');
        return this;
    };
    Timeline.prototype.addTag = function(tag){
        addTag(this.cont, tag);
        return this;
    };
    Timeline.prototype.getTags = function(){
        var arr   = [],
            pxSec = this.cont.data('px/sec');

        this.cont.find('.tag').each(function(){
            var tag = $(this);
            arr.push({
                title:  tag.find('.title').text(),
                line:   tag.data('line'),
                time:   parseInt(tag.css('left'), 10) / pxSec,
                length: parseInt(tag.css('width'), 10) / pxSec
            })
        });

        return arr;
    };

    $.fn.timeline = function(ops){
        if( typeof ops === 'string' ) {
            var args = Array.prototype.slice.call(arguments, 1);

            if( ops.substr(0, 3) === 'get' ) {
                var timeline = this.data('timeline');
                return timeline[ops].apply(timeline, args);
            }

            return this.each(function(){
                var timeline = $(this).data('timeline');
                timeline[ops].apply(timeline, args);
            });
        }

        ops = $.extend({
            width: 600,
            duration: 1,
            framesNumber: 0
        }, ops || {});

        return this.each(function(){
            new Timeline(this, ops);
        });
    };

    var helper, helperLine, curTag, tagsList, tagsLines, linesCount, fakeLine;

    function onStart(e, ui){
        curTag = ui.helper;

        helper = curTag.clone()
            .appendTo(curTag.closest('.tags-lines').find('li').first())
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
                frameTpl = cont.data('frameTpl'),
                secFrame = ops.duration / (ops.framesNumber - 1);

            frames.find('.frame').remove();

            if( ops.framesNumber == 0 ) return;

            secFrame = secFrame - secFrame % 5;

            for(var i = 0; i <= ops.duration; i += secFrame) {
                frameTpl.clone()
                    .appendTo(frames)
                    .css('left', i * pxSec + 'px')
                    .find('.time').html(formatTime(i))
                ;
            }

            if( ops.duration % secFrame > 0 ) {
                frameTpl.clone()
                    .appendTo(frames)
                    .css('left', ops.duration * pxSec + 'px')
                ;
            }
        }
    })();

})(jQuery);