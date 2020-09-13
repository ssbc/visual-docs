# Making static images

Maybe you need static images for a PDF, or for print? You may be able to make static vector images by just editing the SVG files with a text editor, or you may need a vector editing program like Inkscape or Illustrator, particularly if you want to create PNG images.

  - [**making static SVG**](#making-static-svg)
  - [**making PNG**](#making-static-png)
  - [**making JPEG**](#making-static-jpeg)

## Making static SVG
Open the file with a text editor / IDE. If the SVG is animated with anime.js, you'll see a big `<script>` section at the bottom of the file. 
Delete this entire section, up to and including the closing `</script>` tag (but not the final `</svg>` tag!). 
If the SVG is animated with CSS, you can delete or comment out all of the `@keyframes` rules. 

```css
/* comments in CSS are wrapped like this */
```

Does your static SVG look as you had hoped? Probably not, I'm guessing.

You can remove unnecessary items from the image by reading their `id` property to find it in the code, and either adding an `opacity="0"` attribute to that element, or commenting out the code by wrapping that part in `<!-- ` and ` -->`:

```html

<rect id="background"
      width="1000" height="1000"
      opacity="0"/>                  <- this rect has no opacity, it will not be visible

<!-- <rect id="background" width="1000" height="1000"/> -->     <- this is commented out

```

Similarly, you may have to remove some `opacity="0"` attributes if some things aren't showing that you think _should_ be showing.
You'll also want to make sure that there aren't any specific CSS rules being applied which you don't want to be applied. Check the `<style>` section near the top of the SVG.

If your static SVG is looking good (check it in a browser if you haven't already!) then you're all done. Just save the SVG and it can be used in websites.
If you want to do more tweaking, or if you want to make PNG images from it, you can open it with [Inkscape](inkscape.org) or another vector editor.

## Making static PNG
Instructions for [Inkscape](inkscape.org):

When you open the SVG in a graphical vector editor like Inkscape, the colors might not display properly or at all. This may be due to the use of CSS variables to set colors in the SVG, i.e. rather than:
```html
<rect width="1000" height="1000" fill="blue">
```
there will be a ruleset in the `<style>` section setting variables:
```css
:root {
  --background-color: blue;
}
```
These are then applied on the individual elements like so:

```html
<rect width="1000" height="1000" fill="var(--background-color)">
```

This works great in a browser, but not necessarily in a graphical editor like Inkscape. The way to fix this is to open the SVG in a text editor and use 'Find & Replace' to replace every instance of `var(--background-color)` with `blue`, and repeat for any other variables that are being used. Once that's done and the file is saved, you should be able to see everything when opened in Inkscape.

In order to move items around in Inkscape, or hide/reveal items, you may need to 'ungroup' them. If you can't click on the specific thing you're trying to click on, but rather a larger area is being highlighted, it's probably in a group. Under the **Object** menu you'll find options to _'Group'_, _'Ungroup'_, or _'Pop Selected Objects out of Group'_ and their corresponding keyboard shortcuts.

If you want to hide something but not necessarily delete it, you can make and name a new layer in the Layers panel, copy the object, click your new Layer, paste it, and then turn off visibility for that layer using the eye icon by its name.

Now you can export a PNG image. PNG are raster images, i.e. an image described in **pixels**, not in lines, shapes, text etc, (that's a vector image). So you'll want to make sure that you export the PNG at the appropriate resolution (number of pixels) for your use case - you don't want a gigantic filesize, but then you don't want a tiny blurry image, either!

**Shift + Ctrl + E** will bring up Inkscape's _'Export PNG Image'_ pane.
1. Unless you only want to export a specific area, choose _Export Area: > Page_
2. Set your desired _Width_ for your PNG. The _Height_ should adjust automatically.
3. Click _Export As..._ to choose a folder and filename for your PNG.
4. Click _Export_

----
_or..._ instead of all that, you could try a :construction:**DIRTY HACK**:hocho:

(Just take a screenshot while you're playing the animation in a browser.)

## Making static JPEG

Please don't.

JPEG is an excellent file format for photos, or for roughly textured complex images. These images don't have any rough textures, or gradients, or anything complicated, so a JPEG's compression will do nothing to help them. They will look much worse that a PNG, they won't have an alpha channel (transparency) and won't be a big improvement in file size.
