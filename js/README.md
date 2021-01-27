# Converting an Anime.js timeline to CSS animations

This is a helper script to convert an anime.js timeline into CSS animation.

The aim is to have self-contained looping SVG animations which can be used as the source of an `<img>` element, and therefore can be used in places where you're not able to use inline SVG (such as Github Markdown). `<img>` elements cannot access any external resources or even run an inline `<script>`, so if you want a looping SVG animation in your `<img>`, it has to be animated with CSS, or ye olde [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL).

I've written complex CSS animations before, and it's a horrible experience - I much prefer the straightforward and flexible approach to animation writing that anime.js timelines offer.

So this script should enable writing animations with anime.js, but publishing as either anime or CSS. You paste the script into the `<script>` element in your SVG document which contains the anime timeline, save and open the SVG in a browser, and it will be converted.
I'm writing with SVG files in mind, but it should also work on anime.js timelines in HTML documents (I haven't tested it though...🙈️)

## What does it do?

- gets (or assigns) the `id` of each target (animated element)
- converts Penner's easing equations to cubic-bezier easings
- converts relative time values to percentages of total duration
- lists all keyframes, animated property and value changes for each target
- formats the data as CSS animations, and adds it to the document
- deletes all script elements from the document

It doesn't account for everything that you may be able to do with an anime.js timeline, and many of those things wouldn't work in CSS anyway (interaction, animating non-presentation attributes like `viewBox`, using [function-based values](https://animejs.com/documentation/#functionBasedPropVal), using multiple different easings for the same target...)
So if your end goal is CSS animations, make sure you stick within the limitations of CSS when you're writing.

## Using the script
There's still a small amount of manual work required for now:

### Prepare the SVG file
- Paste the the contents of _'convert-anime-to-css.js'_ at the bottom of the `<script>` section of the SVG.
- if your anime timeline is not called `tl`, rename it to `tl` (or replace the references to `tl` in the script to your timeline name)
- Your animation target elements in the SVG should have an `id`. But if they don't, one will be generated for them.
For example, `targets: '#lights > circle'` (all `circle` elements that are direct descendants of `#lights`) wouldn't convert properly if the `circle` elements didn't have ids.
```xml
<g id="lights">
  <circle cx="276" cy="219" r="4"/>
  <circle cx="290.9" cy="211" r="4"/>
</g>
```
If each target has an id, and then `targets: '#lights > circle'` will convert nicely. The script will generate an id of `parentNode.id`-`tagName`-`uniqueLetter`, eg.
```xml
<g id="lights">
  <circle id="lights-circle-a"
          cx="276" cy="219" r="4"/>
  <circle id="lights-circle-b"
          cx="290.9" cy="211" r="4"/>
</g>
```
If you would like the ids to be more meaningful than the generated ids, add them manually before running the script.

### Convert timeline to CSS

Now you can open the SVG in a browser, and it will be converted to CSS. _Right-click_ -> _Save Page As_ and choose a new name for the file (eg. `Original-Name_css.svg`)
If you're lucky, that's it!

### Manual fixes

- if there's anything funny happening with the animation, you may need to change the order of some `transform` properties (`translate`, `rotate`, `scale`, and `skew`), i.e.:
```css
  10% { transform: scale(2) translate(20px, 40px); }
```
is quite different to:
```css
  10% { transform: translate(20px, 40px) scale(2); }
```
(CSS applies these transforms in order, from right-to-left)


### Final steps - embedding fonts

- if there is any text in the animation, you will likely want to embed the font file, depending on how you are going to use the SVG. (An SVG in an `<img>` element cannot access external resources like Google fonts).
- Here's some help with embedding the font: [_Creating Embeddable Fonts as Data URIs_](https://oreillymedia.github.io/Using_SVG/extras/ch07-dataURI-fonts.html) by Amelia Bellamy-Royds.

- Once you've got an embeddable font, make a second `<style></style>` section, just before the closing `</svg>` tag, and paste the contents of `your-embeddable-font.css` into it. For these animations, the file is [font/base64-font_dosis.css](../font/base64-font_dosis.css) - it is a subset of the open source [Dosis](https://github.com/impallari/Dosis) typeface.

- With the font now embedded, you can delete the line with the Google fonts link in the first `<style>` section:
```css
    @import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');
```

# How the script works

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

## The anime timeline object

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
          // "easing": function (r) - this is a private function that anime.js runs, so I'm using a lookup table of different easings' fingerprints to work out which one it is
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
4. Do a whole lot of nested looping and string manipulation to format the object as CSS
5. Insert the CSS animations into a new `<style>` section of the document
6. Delete all `<script>` elements
