(function($){

    //====================== Timeline class ================================

    window.Timeline = function(cont, ops) {
        var root = $(cont);

        this.cont      = root;
        this.duration  = ops.duration;
        this['px/sec'] = ops.width / ops.duration;
        this.tags      = [];
        this.tagTpl    = root.find('.tag').detach();
        this.frameTpl  = root.find('.frame').detach();
        this.pointer   = root.find('.pointer');
        this.currentSecond = 1;

        root.css('width', ops.width + 'px');

        this.resetFrames(ops.framesNumber);
        this.goTo(0);

        if( ops.tags ) {
            for(var i = 0; i < ops.tags.length; i++) {
                this.addTag(ops.tags[i]);
            }
        }

        root.data('timeline', this);
    };
    Timeline.prototype.getRootNode = function(){
        return this.cont;
    };
    Timeline.prototype.goTo = function(sec){
        if( this.currentSecond != sec ) {
            this.pointer.css('left', sec * this['px/sec'] + 'px');
            this.currentSecond = sec;
        }
        return this;
    };
    Timeline.prototype.goToNextSecond = function(){
        this.goTo(this.currentSecond + 1);
        return this;
    };
    Timeline.prototype.goToPrevSecond = function(){
        this.goTo(this.currentSecond - 1);
        return this;
    };
    Timeline.prototype.addTag = function(tag){
        if( tag instanceof TimelineTag == false ) {
            tag['px/sec'] = this['px/sec'];
            tag.tpl = this.tagTpl.clone();
            tag = new TimelineTag(tag);
        }

        tag.addTo(this);

        this.tags.push(tag);

        return this;
    };
    Timeline.prototype.getTags = function(){
        return this.tags;
    };
    Timeline.prototype.resetFrames = function(framesNumber){
        this.cont.find('.frame').remove();
        if( ! framesNumber ) return;

        var pxSec    = this['px/sec'],
            frames   = this.cont.find('.frames'),
            secFrame = this.duration / (framesNumber - 1);

        secFrame = secFrame - secFrame % 5;

        for(var i = 0; i <= this.duration; i += secFrame) {
            this.frameTpl.clone()
                .appendTo(frames)
                .css('left', i * pxSec + 'px')
                .find('.time').html(this.formatTime(i))
            ;
        }

        if( this.duration % secFrame > 0 ) {
            this.frameTpl.clone()
                .appendTo(frames)
                .css('left', this.duration * pxSec + 'px')
            ;
        }
    };
    Timeline.prototype.formatTime = function(seconds){
        function pad(num, size) {
            num = "" + num;
            var s = "000000000" + num;
            return num.length < size ? s.substr(s.length - size) : num;
        }

        var $m = Math.floor(seconds / 60),
            $s = seconds % 60;
        return pad($m, 2) + ':' + pad($s, 2);
    };

    //====================== TimelineTag class =============================

    window.TimelineTag = function(ops){
        this.title  = '';
        this.start  = 0;
        this.length = 1;
        this.line   = null;
        this['px/sec'] = ops['px/sec'];

        var root = $(ops.tpl);
        this.getRootNode = function(){
            return root;
        };

        root.data('tag', this);

        this
            .setTitle(ops.title)
            .setStart(ops.start   || this.start)
            .setLength(ops.length || this.length)
        ;
    };
    TimelineTag.prototype.addTo = function(timeline){
        this.getRootNode().appendTo(
            timeline.cont.find('.tags-lines li').first()
        );

        this.setLine(this.getFreeLine());

        if( ! this.getRootNode().data('initDnD') ) {
            this.getRootNode()
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
            ;
            this.getRootNode().data('initDnD', true);
        }
    };
    TimelineTag.prototype.setTitle = function(title){
        this.getRootNode().find('.title').html(this.title = title);
        return this;
    };
    TimelineTag.prototype.setStart = function(start){
        this.getRootNode().css('left', (this.start = start) * this['px/sec'] + 'px');
        this.setLine(this.getFreeLine());
        return this;
    };
    TimelineTag.prototype.setLength = function(length){
        this.getRootNode().css('width', (this.length = length) * this['px/sec'] + 'px');
        this.setLine(this.getFreeLine());
        return this;
    };
    TimelineTag.prototype.setLine = function(line){
        if( this.line === line ) return this;

        var lines = this.getRootNode().closest('.tags-lines');

        for(var i = lines.find('li').length; i <= line; i++) {
            lines.append('<li>');
        }

        this.getRootNode().appendTo( lines.find('li').eq(this.line = line) );

        return this;
    };
    TimelineTag.prototype.getFreeLine = function(){
        var lines = this.getRootNode().closest('.tags-lines');

        return getTagFreeLine(this.getRootNode(), lines.find('.tag'));
    };

    //====================== jQuery plugin =================================

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

    //====================== Helpers =======================================

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
        var tag = curTag.data('tag');
        tag.start  = parseInt(curTag.css('left'))  / tag['px/sec'];
        tag.length = parseInt(curTag.css('width')) / tag['px/sec'];

        helperLine = getTagFreeLine(curTag, tagsList);

        if( helperLine == curTag.data('tag').line ) {
            helper.hide();
        }
        else {
            helper
                .css(curTag.css(['left', 'width']))
                .css('top', 30 * helperLine + 'px')
                .show()
            ;
        }

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
        curTag.data('tag').setLine(helperLine);

        helper.remove();

        tagsLines.find('li').not(':first').find('.tag').not(curTag).each(function(){
            var $this = $(this);
            $this.data('tag').setLine( getTagFreeLine($this, tagsList) );
        });

        var lastLi = tagsLines.find('li').last();
        if( lastLi.children().length == 0 ) {
            lastLi.remove();
        }
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
            if( list.length === 0 ) return 0;

            dummy
                .appendTo(list.eq(0).closest('ul').children().first())
                .css(tag.css(['left', 'width']))
                .css('top', '0px')
            ;

            var line = moveHelperOnFreeLine(dummy, list.not(tag), 0);

            dummy.detach();

            return line;
        }
    })();

})(jQuery);