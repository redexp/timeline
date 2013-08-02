(function($){

    //====================== Timeline class ================================

    window.Timeline = function(cont, ops) {
        var root = $(cont);

        this.cont      = root;
        this.duration  = ops.duration;
        this['px/sec'] = ops.width / ops.duration;
        this.align     = ops.hasOwnProperty('align') ? ops.align : true;
        this.framesOrder = ops.hasOwnProperty('framesOrder') ? ops.framesOrder : ['.frame'];
        this.tags      = [];
        this.tagTpl    = root.find('.tag').detach();
        this.pointer   = root.find('.pointer');
        this.tagsLines = root.find('.tags-lines');
        this.currentSecond = 1;
        this.framesNumber  = ops.framesNumber || 0;

        root.css('width', ops.width + 'px');

        this.framesTpl = {};

        var i, name;
        for(i = 0; i < this.framesOrder.length; i++) {
            name = this.framesOrder[i];
            if( this.framesTpl.hasOwnProperty(name) ) continue;

            this.framesTpl[name] = root.find('.frames ' + name).detach();
        }

        this.setFramesNumber(this.framesNumber);
        this.goTo(0);

        if( ops.tags ) {
            for(i = 0; i < ops.tags.length; i++) {
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
        tag.timeline = this;
        tag.tpl      = this.tagTpl.clone();
        tag = new TimelineTag(tag);

        this.tags.push(tag);

        return tag;
    };
    Timeline.prototype.getTags = function(){
        return this.tags;
    };
    Timeline.prototype.setFramesNumber = function(num){
        this.framesNumber = num;
        this.cont.find('.frame').remove();
        if( ! num ) return;

        var pxSec    = this['px/sec'],
            frames   = this.cont.find('.frames'),
            secFrame = this.duration / (num - 1);

        secFrame = secFrame - secFrame % 5;

        for(var i = 0, n = 1; i <= this.duration; i += secFrame, n = n % this.framesOrder.length + 1) {
            this.framesTpl[this.framesOrder[n - 1]].clone()
                .appendTo(frames)
                .css('left', i * pxSec + 'px')
                .find('.time').html(this.formatTime(i))
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
    Timeline.prototype.toJSON = function(){
        var timeline = {
            duration:      this.duration,
            currentSecond: this.currentSecond,
            tags:          []
        };

        for(var i = 0; i < this.tags.length; i++) {
            timeline.tags.push({
                title:  this.tags[i].title,
                start:  this.tags[i].start,
                length: this.tags[i].length,
                line:   this.tags[i].line
            });
        }

        return timeline;
    };
    Timeline.prototype.removeEmptyLines = function(){
        this.tagsLines.children().each(function(){
            var li = $(this);
            if( li.children().length === 0 ) {
                li.remove();
            }
        });
        return this;
    };

    //====================== TimelineTag class =============================

    var TimelineTag = function(ops){
        this.title  = '';
        this.start  = 0;
        this.length = 1;
        this.line   = null;
        this.disabled = ops.hasOwnProperty('disabled') ? ops.disabled : false;
        this.timeline  = ops.timeline;
        this.data      = ops.data;

        this.rootNode = $(ops.tpl);

        this
            .setTitle(ops.title)
            .setStart(ops.start   || this.start)
            .setLength(ops.length || this.length)
            .setLine(ops.hasOwnProperty('line') ? ops.line : this.getFreeLine())
        ;

        if( this.disabled === false ) {
            this.rootNode
                .draggable({
                    containment: 'parent',
                    axis:        "x",
                    zIndex:      1000,
                    start:       onStart,
                    drag:        onDrag,
                    stop:        onStop
                })
                .resizable({
                    containment: 'parent',
                    handles:     "w, e",
                    start:       onStart,
                    resize:      onDrag,
                    stop:        onStop
                })
            ;
        }

        if( ops.hasOwnProperty('events') ) {
            for(var event in ops.events) {
                if( ! ops.events.hasOwnProperty(event) ) continue;

                this.on(event, ops.events[event]);
            }
        }

        this.rootNode.data('tag', this);
    };
    TimelineTag.prototype.on = function(event, callback){
        var tag = this;
        this.rootNode.on(event, function(){
            callback.apply(tag, Array.prototype.slice.call(arguments));
        });
        return this;
    };
    TimelineTag.prototype.trigger = function(event, args){
        this.rootNode.trigger(event, args);
        return this;
    };
    TimelineTag.prototype.setTitle = function(title){
        this.rootNode.find('.title').html(this.title = title);
        this.trigger('setTitle', [title]);
        return this;
    };
    TimelineTag.prototype.setStart = function(start){
        this.rootNode.css('left', (this.start = start) * this.timeline['px/sec'] + 'px');
        this.trigger('setStart', [start]);
        return this;
    };
    TimelineTag.prototype.setLength = function(length){
        this.rootNode.css('width', (this.length = length) * this.timeline['px/sec'] + 'px');
        this.trigger('setLength', [length]);
        return this;
    };
    TimelineTag.prototype.setLine = function(line){
        if( this.line === line ) return this;

        var lines = this.timeline.tagsLines;

        for(var i = lines.find('li').length; i <= line; i++) {
            lines.append('<li>');
        }

        this.rootNode.appendTo( lines.find('li').eq(this.line = line) );

        this.trigger('setLine', [line]);

        return this;
    };
    TimelineTag.prototype.getFreeLine = function(){
        var lines = this.timeline.tagsLines;

        return getTagFreeLine(this.rootNode, lines.find('.tag'));
    };
    TimelineTag.prototype.remove = function(){
        this.trigger('remove');
        this.rootNode.remove();
        this.timeline.tags.splice(this.timeline.tags.indexOf(this), 1);
        this.timeline.removeEmptyLines();
    };

    //====================== Helpers =======================================

    var helper, helperLine, curTag, $curTag, tagsList, tagsLines, linesCount, fakeLine;

    function onStart(e, ui){
        $curTag = ui.helper;
        curTag  = $curTag.data('tag');

        if( curTag.timeline.align === false ) return;

        helper = $curTag.clone()
            .appendTo(curTag.timeline.tagsLines.children().first())
            .addClass('helper')
        ;

        tagsLines  = curTag.timeline.tagsLines;
        tagsList   = tagsLines.find('.tag').not(helper);
        linesCount = tagsLines.find('li').length - 1;
        helperLine = 0;
        fakeLine   = false;
    }

    function onDrag(){
        var start = parseInt($curTag.css('left'))  / curTag.timeline['px/sec'],
            length = parseInt($curTag.css('width')) / curTag.timeline['px/sec'];

        if( start  != curTag.start )  curTag.trigger('setStart', [curTag.start = start]);
        if( length != curTag.length ) curTag.trigger('setLength', [curTag.length = length]);

        if( curTag.timeline.align === false ) return;

        helperLine = getTagFreeLine($curTag, tagsList);

        if( helperLine == $curTag.data('tag').line ) {
            helper.hide();
        }
        else {
            helper
                .css($curTag.css(['left', 'width']))
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
        if( curTag.timeline.align === false ) return;

        curTag.setLine(helperLine);

        helper.remove();

        tagsLines.find('li').not(':first').find('.tag').not($curTag).each(function(){
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