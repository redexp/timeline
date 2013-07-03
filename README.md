timeline
========

timeline component with tags for video players

# Requirements

* jQuery
* jQueryUI (only Draggable and Resizable components)

# Usage

Full example you can find in [example/index.html](example/index.html)

# Options

* duration - Length of video in seconds
* framesNumber - Number of frames
* width - Width of timeline
* tags - Array of tags option objects. Parameters described below
  * title - Title of tag
  * line - Line on which should be placed tag
  * time - Start time in seconds
  * length - Length in seconds

# Templating

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