# Using Animations
How to use these depends on _where_ you will be using them:

- [**in a website**](#using-animations-in-a-website)
- [**on social media / forums / github**](#using-animations-on-social-media)

## Using animations in a website
Good choice! :thumbsup:
Using these animations in a website that you control gives you the
best combination of performance, filesize, accessibility and flexibility.
You should be able to just copy and paste the entire content of the SVG file into
the body of your HTML page, like this:
```html
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>SSB Animation</h1>
    <figure>
      <svg>
        <!-- Content of the SVG, including <style>, <script> etc -->
      </svg>
      <figcaption>Animation showing data replication</figcaption>
    </figure>
  </body>
</html>

```
However, there are some tweaks that you could make to reduce filesize and ensure
that everything works as expected - this is particularly important when you're
using multiple SVGs in the same site.

- [Removing embedded Javascript libraries](#removing-embedded-javascript-libraries)
- [Removing embedded fonts](#removing-embedded-fonts)
- [Adjusting IDs as needed](#adjusting-ids-as-needed)
- [Targeting SVGs from your site's CSS](#targeting-svgs-from-your-sites-css)
- [Extra Homework](#extra-homework) (for nerds)

### Removing embedded Javascript libraries
In the code of the SVG, you'll see whether it has been animated with CSS or
[anime.js](animejs.com). (There will either be a bunch of CSS rules in the
`<style>` section starting with `@keyframes`, or there will be a huge `<script>`
section at the end, starting with 'anime.js')

If you're putting multiple SVGs inline in your HTML, it doesn't make much sense
to redundantly serve a 16.9kb copy of anime.js within each one. Instead you should link to or
serve anime.js once, in a `<script>` tag in your HTML, and then each animation
can reference that.

_**TODO:** explain how ↑_

### Removing embedded fonts
Similarly, the CSS animations have been designed to work as `<img>` elements, so
they can be embedded in places like Github markdown or SSB, and they'll loop happily
forever, like a super-lightweight, high-resolution, high-framerate GIF.
(The anime.js animations will not work as `<img>` - they must be inline or in an
`<object>`) As `<img>` elements cannot reference external resources (like fonts)
I have embedded a subset of the '[Dosis](https://fonts.google.com/specimen/Dosis)'
typeface, which is used [on the Āhau website](https://www.ahau.io/).
There will be `<style>` section at the end of the file, which starts like this
and is followed by and a whole of of base64 data (garbled text):
```css
    @font-face {
      font-family: 'dosis';
      src: url(data:application/font-woff2;charset=utf-8;base64,...);
    }
```

Wherever possible, I would always recommend using animations (whether CSS or JS)
**inline**. If you _can_ do this, then you should also remove the embedded font
from the SVGs (delete that whole `<style>` section) and serve/link the font in
your site's CSS instead.

_**TODO:** explain how ↑_

### Adjusting IDs as needed
If a bunch of these animations are inline in the same page, there may be some
conflicting `id` attributes, meaning that an animation that references `#pātaka`
or `#laptop` may in fact animate an element with the same `id` in a different SVG.
I haven't yet tested this or done anything to mitigate it. If this happens, you
may need to use a text editor's Find & Replace functionality to replace generic
ids with more specific ones, eg.
`id="pātaka"` and `#pātaka` with `id="pātaka-replication-via-internet"` and
`pātaka-replication-via-internet`. Please let me know about your experience by
opening an [issue](https://github.com/ssbc/visual-docs/issues)!

### Targeting SVGs from your site's CSS
Currently all the SVGs are self-contained, so they all have `height` and `width`
attributes set on the main `<svg>` tag. This is fine, but if you have multiple
SVGs in your site, or if you want the image size to adjust based on media queries
(i.e. different sizes for mobile vs. desktop) it's better to set the `width` and
`height` of `svg` elements in your site's CSS, and delete those attributes from
the SVGs themselves. Don't worry, they still have a `viewBox` which will maintain
the correct aspect ratio. If you like, you could also apply other rules (like
setting colors) from the site's CSS which makes changing/updating in the future
easier, as you only have to make changes in one part of your site, not in every
single SVG.

### Extra homework
- Anime.js has a bunch of helper functions to control playback of animations. If
you know how, or you're willing to learn, you could add functionality to your
site for people to play/pause/skip animations. Have a look through the
[anime.js documentation](https://animejs.com/documentation/#playPause) and see
what you can come up with.
- Using the same helper functions, you could come up with a way to show relevant
text explanations at the relevant point in the animations.

## Using animations on social media
Unfortunately most communication on the web happens on websites which you don't
control - and most social media sites don't allow animated SVGs. Many website
builders (like Squarespace) don't allow SVG either.

Even when sites or social media _do_ allow SVGs (like Github or SSB clients) it's
only as an `<img>` - you can't embed a Javascript animation or load external
resources (like fonts) in those situations. In these cases you can only upload
the animations I've made with (or converted to) CSS.

In all other situations (eg. sharing an animation on Facebook or Twitter) you
will need to make MP4 or GIF versions. If possible, please add an `alt` text
to your GIF so that everybody can at least get a description of what you're
sharing, even if they can't see or load the GIF.

[Twitter - How to make images accessible for people](https://help.twitter.com/en/using-twitter/picture-descriptions)

[How to add alternative text to Facebook photos](https://www.lireo.com/how-to-add-alternative-text-to-facebook-photos/)
