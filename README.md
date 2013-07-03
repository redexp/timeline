timeline
========

timeline component with tags for video players

## Requirements

* jQuery
* jQueryUI (only Draggable and Resizable components)

## Usage

Full example you can find in [example/index.html](example/index.html)

You can init timeline with native style like
```javascript
var timeline = new Timeline('#timeline', options);
```
or jQuery style
```javascript
$('.timeline').timeline(options);
```
Difference that with native style you can initialize only one time line, when with jQuery style you can setup all selected timelines.
Also another difference that with native tyle it's very easy to call Timeline methods
```javascript
timeline.goTo(75);
```
when with jQuery style you need to do that like this
```javascript
$('.timeline').timeline('goTo', 75);
```

## Options

* duration - Length of video in seconds
* framesNumber - Number of frames
* width - Width of timeline
* tags - Array of tags option objects. Parameters described below
  * title - Title of tag
  * line - Line on which should be placed tag
  * time - Start time in seconds
  * length - Length in seconds

## Methods

* goToNextSecond() - Move pointer on one second forvard
* goToPrevSecond() - Move pointer on one second backvard
* goTo(seconds) - Move pointer to exac position on timeline
* addTag(options) - Add tag to timeline
* getTags() - Return array of tags option objects
* getRootNode() - Return root element

All methods except getters will returns timeline itself.

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