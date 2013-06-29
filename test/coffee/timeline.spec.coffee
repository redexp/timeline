beforeEach ->
    this.addMatchers
        toBeInstanceOf: (constructor) ->
            this.actual instanceof constructor

describe 'Timeline', ->
    ops =
        node: '#timeline'
        duration: 60 + 25
        tags: [
            title: 'first'
            start: 25
            end:   37
        ,
            title: 'second'
            start: 10
            end:   20
        ]

    line = new Timeline(ops)

    it 'should have jQuery node', ->
        expect(line.getNode() instanceof jQuery).toEqual(true)

    it 'should have tags from ops', ->
        expect(line.getTags().length).toEqual(ops.tags.length)

