$ = jQuery

class Tag
    constructor: (ops) ->
        this.data = $.extend(
            title: ''
            start: 0
            end:   0
        , ops)

    getStart: -> this.data.start
    setStart: (value) -> this

    getEnd: -> this.data.end
    setEnd: (value) -> this

class window.Timeline
    constructor: (ops) ->
        this.data = $.extend(
            node:     'body'
            duration: 0
        , ops)

        this.data.node = $(this.data.node)
        this.data.tags = []

        this.setTags(ops.tags) if 'tags' of ops

    getNode: -> this.data.node

    getDuartion: -> this.data.duration

    setDuration: (duration) ->
        this.data.duration = duration
        this.redraw()

    getTags: -> this.data.tags
    setTags: (tags) ->
        for tag in this.getTags()
            this.delTag(tag)

        for tag in tags
            this.addTag(tag)
        @

    addTag: (tag) ->
        this.getTags().push(new Tag(tag))
        @

    delTag: (tag) ->
        i = this.getTags().indexOf(tag)
        this.getTags().splice(i, 1)
        @

    redraw: ->
