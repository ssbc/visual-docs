# Converting an Anime.js timeline to CSS animations

This is a helper script to convert an anime.js timeline into CSS animation, which will be logged to the browser console. It has been written with SVG files in mind, but it should also work on anime.js timelines in HTML documents.

Head this way if you want to know [how it works](./how-it-works.md).

## What does it do?
- gets the total duration of the timeline
- gets (or assigns) the `id` of each target (animated element) - they'll all need ids for now.
- converts Penner's easing equations to cubic-bezier easings
- converts relative time values to absolute values, then to percentages of total duration
- lists all keyframes, animated property and value changes for each target
- formats the data as CSS animations, and logs it to the console

It doesn't account for everything that you may be able to do with an anime.js timeline, and many of those things wouldn't work in CSS anyway (interaction, animating non-presentation attributes like `viewBox`, using [function-based values](https://animejs.com/documentation/#functionBasedPropVal), using multiple different easings for the same target...)

To use it, there's still a small amount of manual work required for now:

## Prepare the SVG file
- Paste the the contents of _'convert-anime-to-css.js'_ file at the bottom of the `<script>` section of the SVG.
- if your anime timeline is not called `tl`, rename it to `tl` (or replace the references to `tl` in the script to your timeline name)
- Your animation target elements in the SVG should have an `id`. If they don't, one will be generated for them.
For example, `targets: '#lights > circle'` (all `circle` elements that are direct descendants of `#lights`) wouldn't convert properly if the `circle` elements didn't have ids.
```xml
<g id="lights">
  <circle cx="276" cy="219" r="4"/>
  <circle cx="290.9" cy="211" r="4"/>
</g>
```
If each target has an id, and then `targets: '#lights > circle'` will convert nicely. The script will generate an id of `tagName`-`parentNode.id`-`uniqueLetter`, eg.
```xml
<g id="lights">
  <circle id="lights-circle-a"
          cx="276" cy="219" r="4"/>
  <circle id="lights-circle-b"
          cx="290.9" cy="211" r="4"/>
</g>
```

- save the file with a different name than your anime.js animated SVG (for example, I'm using _'name-of-animation**_anime**.svg'_ and _'name-of-animation**_css**.svg'_)


## Convert timeline to CSS

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
(CSS applies these transforms in order, from right-to-left)


## Final steps

- delete the entire `<script>` section of the SVG, you don't need it any more.
- if there is any text in the animation, you will likely want to embed the font file, depending on how you are going to use the SVG. (An SVG in an `img` element cannot access external resources like Google fonts). Make a second `<style></style>` section, just before the closing `</svg>` tag, and paste the contents of '[font/base64-font_dosis.css'](../font/base64-font_dosis.css) into it - it is a subset of the open source [Dosis](https://github.com/impallari/Dosis) typeface. You can now delete the line with the Google fonts link in the first `<style>` section:
```css
    @import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');
```
