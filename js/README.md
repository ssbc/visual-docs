# Converting an Anime.js timeline to CSS animations

This is a helper script to convert an anime.js timeline into CSS animation, currently in a very raw stage, which just logs data to the browser console.

## What does it do?
- gets the total duration of the timeline
- gets the `id` of each target (animated element) - they'll all need ids for now.
- converts relative time values to absolute values, then to percentages of total duration
- lists all keyframes, animated property and value changes for each target
- duplicates the first and last keyframe of each animation at 0% and 100%
- formats the data as CSS animations, and logs it to the console

There's still a bit of manual work required for now.
Here's what you need to do currently - I'm aiming to automate many of these steps, so this also serves as a To-Do list for the script:

## Prepare the SVG file
- Paste the the contents of _'convert-anime-to-css.js'_ file at the bottom of the `<script>` section of the SVG.
- if your anime timeline is not called `tl`, rename it to `tl` (or replace the references to `tl` in the script to your timeline name)
- Ensure that your animation target elements in the SVG always have an `id`.
For example, `targets: '#lights > circle'` (all `circle` elements that are direct descendants of `#lights`) won't convert properly if the `circle` elements don't have ids.
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

- save the file with a different name than your anime.js animated SVG (for example, I'm using _'name-of-animation**_anime**.svg'_ and _'name-of-animation**_css**.svg'_)


## Log animations and create CSS code

Now you can open the SVG in a browser, and open the Console in your browser dev tools.
Then you can copy the logged CSS animation and paste it into the `<style>` section of your SVG.

## Manual fixes

- if there's anything funny happening with the animation, you may need to change the order of some `transform` properties (`translate`, `rotate`, `scale`, and `skew`), i.e.:
```css
  10% { transform: scale(2) translate(20px, 40px); }
```
is quite different to:
```css
  10% { transform: translate(20px, 40px) scale(2); }
```
(CSS applies these transforms in order from right-to-left)

- At the top of the CSS Animations text there's a declaration about the duration, easing and fill-mode of the animations, it looks like this:
```css
#router, #light, #arrow-a, #arrow-b, #arrow-c, #internet-symbol {
  animation-duration: 46.6s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
```
Currently the script determines easing/timing-function for each target and logs the easing name to the console. This will be automatically applied soon!
Anytime an animation's easing deviates from your timeline's default, you can declare the `animation-timing-function` separately, eg:
```css
#router, #light, #arrow-a, #arrow-b, #arrow-c, #internet-symbol {
  animation-duration: 46.6s;
  animation-iteration-count: infinite;
}
#router, #light, #internet-symbol { animation-timing-function: ease-in-out; }
#arrow-a, #arrow-b, #arrow-c { animation-timing-function: linear; }
```

Now you've included all the animation details that you need!

## Final steps

- delete the entire `<script>` section of the SVG, you don't need it any more.
- if there is any text in the animation, you will likely want to embed the font file, depending on how you are going to use the SVG. (An SVG in an `img` element cannot access external resources like Google fonts). Make a second `<style></style>` section, just before the closing `</svg>` tag, and paste the contents of '[font/base64-font_dosis.css'](../font/base64-font_dosis.css) into it - it is a subset of the open source [Dosis](https://github.com/impallari/Dosis) typeface. You can now delete the line with the Google fonts link in the first `<style>` section:
```css
    @import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');
```
