timeline
========

timeline component with tags for video players

## Requirements

* jQuery
* jQueryUI (only Draggable and Resizable components)

## Usage

Full example you can find in [example/simple/index.html](example/simple/index.html)

Init timeline
```javascript
var timeline = new Timeline('#timeline', options);
```

## Timeline class

### Options

* width - Width of timeline
* duration - Length of video in seconds
* framesNumber - Number of frames
* framesOrder - Array of frames classes names
* align - Boolean, should tags align to top or not
* tags - Array of TimelineTag class options

### Methods

* getRootNode() - Return root element
* goToNextSecond() - Move pointer on one second forvard
* goToPrevSecond() - Move pointer on one second backvard
* goTo(seconds) - Move pointer to exac position on timeline
* addTag(options) - Add tag to timeline
* getTags() - Return array of objects of TimelineTag class
* setFramesNumber(int) - set number of frames
* formatTime(int) - function which converts seconds to format "mm:ss", you can overwrite this function to change frames time format
* toJSON() - returns copy of timeline object cleared from internal fields

All methods except getters will returns timeline itself.

### Properties

* pointer - jQuery object of current second pointer
* currentSecond - number of current position of pointer in seconds

## TimelineTag class

### Options

* title - Title of tag
* start - Start time in seconds. Default to 0
* length - Length in seconds
* line - Number of line
* draggable - Boolean, default to true, shows can tag to be draggable and resizable or not
* events - Hash of events names and their callbacks

### Methods

* setTitle(string) - set title of tag
* setStart(int) - set start of tag in seconds
* setLength(int) - set length of tag in seconds
* setLine(int) - set tag on line in timeline
* getFreeLine() - get free line for this tag on timeline
* on(event, callback) - bind callback to event of tag
* trigger(event, arguments) - trigger event of tag with optional arguments in array
* remove() - remove tag from timeline

### Properties

* rootNode - jQuery object of tag
* title - Title of tag
* start - Start time in seconds. Default to 0
* length - Length in seconds
* line - Number of line

### Events

Scope (this keyword) in callback will be tag itself.
First parameter of all callback will be event object

* setTitle
* setStart
* setLength
* setLine
* remove

## Templating

Base html is
```html
<div>
    <ul class="frames">
        <li class="pointer"></li>
        <li class="frame">
            <div class="time"></div>
        </li>
    </ul>
    <ul class="tags-lines">
        <li>
            <div class="tag">
                <span class="title"></span>
            </div>
        </li>
    </ul>
</div>
```
And you can customize it as you want. For example I added to "pointer" and "frame" div with class "line", to show vertical line.
You can add to "pointer" some element for arrow. Or you can add to "tag" some image.