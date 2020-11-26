# How the script works

An explanation of what I'm trying to do with the script and how I'm going about it, in order to clarify things for myself and allow others to help me.

To get a quick general overview of how anime.js timelines vs CSS animations work, I recommend reading the corresponding sections of the [Editing Animations](../documentation/Editing-Animations.md) documentation. But the core difference is that an anime.js timeline lists every change _chronologically_, eg:
```javascript
.add({
  // animate this,
})
.add({
  // then this,
})
.add({
  // then this.
})
```
Whereas CSS animations are organised by the animation _target_ - we can compare an anime.js timeline with its CSS equivalent to make the distinction clearer:

### anime.js
```javascript
const tl = anime.timeline({})

tl.add({
    targets: 'rect, circle',
    opacity: [0, 1]
  })
  .add({
    targets: 'rect',
    translateX: [0, 10]
  })
  .add({
    targets: 'circle',
    translateX: [0, 10]
  })
  .add({
    targets: 'rect',
    translateX: [10, 0]
  })
  .add({
    targets: 'rect, circle',
    opacity: [1, 0]
  })
```
### CSS

```css
rect { animation: 2.5s rect-animation; }

@keyframes rect-animation {
  0% { opacity: 0; }
  20% { opacity: 1; transform: translateX(0); }
  40% { transform: translateX(10); }
  60% { transform: translateX(10); }
  80% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; }
}


circle { animation: 2.5s circle-animation; }

@keyframes circle-animation {
  0% { opacity: 0; }
  20% { opacity: 1; }
  40% { transform: translateX(0); }
  60% { transform: translateX(10); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
```

CSS gets _way harder_ to read as an animation gets complex, and can be a real shit to sync up nicely.

## How the script works

You can log an anime.js `timeline` object to the console and see that it contains `children`, one for every one of its `.add({})` chronological sections, which seems to be referred to as an `anim` object in anime.js.

An `anim` looks kinda like this:

```javascript
{
  "update": null,
  "begin": null,
  "loopBegin": null,
  "change": null,
  "changeComplete": null,
  "loopComplete": null,
  "complete": null,
  "loop": 1,
  "direction": "normal",
  "autoplay": false,
  "timelineOffset": 1000,
  "id": 1,  // I think this is an internal id that anime assigns to this animation section
  "children": [],
  "animatables": [
    {
      "target": {}, // DOM node of target, eg. <circle r="1" cy="3" cx="3" style="opacity: 0; transform: translateX(10px);">
      "id": 0,
      "total": 1,
      "transforms": {
        "list": { "translateX": "10px" }, // this isn't the exact syntax in the browser console, there it says Map(1) size: 1 <entries> 0: translateX → "10px"
        "last": "translateX"
      }
    }
  ],
  "animations": [
    {
      "type": "css",
      "property": "opacity",
      "animatable": { // anim.animations[i].animatables is exactly the same as anim.animatables[i] from earlier ↑     
      },
      "tweens": [
        {
          "value": [0, 1],
          "delay": 0,
          "endDelay": 0,
          // "easing": function (r) - this goes to some incomprehensible part of the minified anime.js library
          "duration": 300,
          "round": 0,
          "from": {
            "original": "0",
            "numbers": [0],
            "strings": []
          },
          "to": {
            "original": "1",
            "numbers": [1],
            "strings": []
          },
          "start": 0,
          "end": 300,
          "isPath": false,
          "isPathTargetInsideSVG": false,
          "isColor": false
        }
      ],
      "duration": 300,
      "delay": 0,
      "endDelay": 0,
      "currentValue": 1
    },
    {
      "type": "transform",
      "property": "translateX",
      "animatable": { // anim.animations[i].animatables is exactly the same as anim.animatables[i] from earlier ↑     
      },
      "tweens": [
        {
          "value": [0, 10],
          "delay": 0,
          "endDelay": 0,
          "duration": 300,
          "round": 0,
          "from": {
            "original": "0px",
            "numbers": [0],
            "strings": ["","px"]
          },
          "to": {
            "original": "10px",
            "numbers": [10],
            "strings": ["","px"]
          },
          "start": 0,
          "end": 300,
          "isPath": false,
          "isPathTargetInsideSVG": false,
          "isColor": false
        }
      ],
      "duration": 300,
      "delay": 0,
      "endDelay": 0,
      "currentValue": "10px"
    }
  ],
  "duration": 300,
  "delay": 0,
  "endDelay": 0,
  "finished": Promise { <state>: "pending" },
  "passThrough": false,
  "currentTime": 300,
  "progress": 100,
  "paused": true,
  "began": true,
  "loopBegan": true,
  "changeBegan": false,
  "completed": true,
  "changeCompleted": true,
  "reversePlayback": false,
  "reversed": false,
  "remaining": 0
}
```

So my general approach for the script is:
1. Grab the data that I need from each `anim` object in the `timeline`
2. Perform calculations on that data where necessary
3. Put the data into an object with the same general shape as a CSS animation declaration
4. Do a whole lot of nested looping and string manipulation to format ithe object as CSS
