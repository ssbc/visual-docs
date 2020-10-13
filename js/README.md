# Converting an Anime.js timeline to CSS animations

This is a helper script to convert an anime.js timeline into CSS animation, currently in a very raw stage, which just logs data to the browser console.

## What does it do?
- calculates the total duration of the timeline
- gets the `id` of each target (animated element) - they'll all need ids for now.
- converts relative time values to absolute values (keyframes)
- converts those keyframes to percentages of total duration
- lists all keyframes, animated property and value changes for each target
- duplicates the first and last keyframe of each animation at 0% and 100%
- logs the `targets` object to the console.

There's still a bit of manual work required for now.
Here's what you need to do currently - I'm aiming to automate many of these steps, so this also serves as a To-Do list for the script:

- Paste the the contents of _'convert-anime-to-css.js'_ into the `<script>` section of the SVG.
- Add a function that uses the `changeBegin` hook of each timeline section, calling `logAnimations` at the start of each section. (You can use find-and-replace to put it between all instances of `.add({` and `targets:`)

```javascript
.add({
  changeBegin: function(anim) { logAnimations(anim) },
  targets: '#light-a-on',
  opacity: [0, 1],
})
```

in the timeline declaration, set `loop:` and `autoplay:` to `false`

```javascript
const tl = anime.timeline({
  autoplay: false,
  loop: false,
  duration: 500,
  easing: 'easeInOutQuad'
})
```

after your timeline, paste the `timelineComplete` section:
```javascript
function timelineComplete () {
  ...
}
tl.finished.then(timelineComplete)
tl.play()
```

Ensure that your animation target elements in the SVG always have an `id`:

For example, `targets: '#lights > circle'` (all `circle` elements that are direct descendents of `#lights`) won't convert properly if the `circle` elements don't have ids.

```xml
<g id="lights">
  <circle cx="276" cy="219" r="4"/>
  <circle cx="290.9" cy="211" r="4"/>
</g>
```

Give each target an id, and then `targets: '#lights > circle'` will convert nicely.

```xml
<g id="lights">
  <circle id="light-a"
          cx="276" cy="219" r="4"/>
  <circle id="light-b"
          cx="290.9" cy="211" r="4"/>
</g>
```

Now you can open the SVG in a browser - run the animation all the way through.
Then you can copy the logged CSS animation - there's a couple more manual changes to make however:

- combine any `translate`, `rotate`, `scale`, and `skew` properties into a single `transform` property
```css
#arrow { animation-name: arrow-anim; }
@keyframes arrow-anim {
  0%, 17.17% { transform: scale(0); }
  18.24% { transform: scale(1); }
  34.12% { opacity: 1;
           transform: scale(1); }
  35.19%, 100% { opacity: 0;
                 transform: scale(0.8); }
}
```
- Currently there's a bug where sometimes the last keyframe of a multi-keyframe section has a percentage value, but no information about the animated property or its value, like this:
```css
  0%, 17.17% { transform: scale(0); }
  18.24% { transform: scale(1); }
  34.12% { opacity: 1;
           transform: scale(1); }
  35.19%, 100% {}
}
```
For now, just check the anime.js timeline and add update it with the correct information.

There's still nothing in the CSS about the duration, easing and fill-mode of the animations, so you need to add that to the top of the CSS section:

- Copy the **target list** (_right-click -> copy object_) which was outputted to the console immediately before the final logging of the `targets` object. It will be a long list of ids, like `#router, #light, #arrow-a, #arrow-b...` etc.

- Paste this at the top of the CSS section, followed by a ruleset where you declare the `duration` of each of their animations, the `timing-function` (otherwise known as _easing_) and the `iteration-count` (how many times they will play). These animations are designed to loop, so you'll set that to `infinite`.
```css
#router, #light, #arrow-a, #arrow-b, #arrow-c, #internet-symbol {
  animation-duration: 46.6s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
```
You can use the Find functionality of your text editor to check if different timing functions are being used, or if all sections are the same. Look for "easing" in your anime.js document to see where it is declared. Anytime an animation's easing deviates from your timeline's default, you can separate that target from the main list of targets, eg:
```css
#router, #light, #arrow-a, #arrow-b, #arrow-c, #internet-symbol {
  animation-duration: 46.6s; /* You can convert the duration from milliseconds to seconds to make it more human-friendly */
  animation-iteration-count: infinite;
}
#router, #light, #internet-symbol { animation-timing-function: ease-in-out; }
#arrow-a, #arrow-b, #arrow-c { animation-timing-function: linear; }
```
Now we've included all the animation details that we need!

- delete the entire `<script>` section of the SVG, you don't need it any more.
- if there is any text in the animation, you will likely want to embed the font file, depending on how you are going to use the SVG. (An SVG in an `img` element cannot access external resources like Google fonts). Make a second `<style></style>` section, just before the closing `</svg>` tag, and paste the contents of '[font/base64-font_dosis.css'](../font/base64-font_dosis.css) into it - it is a subset of the open source [Dosis](https://github.com/impallari/Dosis) typeface. You can now delete the line with the Google fonts link in the first `<style>` section:
```css
    @import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');
```
