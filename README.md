# Visual Docs
**Diagrams and animations documenting SSB and Āhau**

Made as Scalable Vector Graphic (SVG) files, animated as needed with CSS or [anime.js](https://animejs.com).
These are made to accompany and illustrate text explanations.

## Table of Contents
- [Animations](#animations)
- [Icons](#icons)
- [How to use animations](./Using-Animations.md)
  - [in a website](./Using-Animations.md#using-animations-in-a-website)
  - [on social media / ssb / github](./Using-Animations.md#using-animations-on-social-media)
  - [in a video](./Using-Animations.md#using-animations-in-a-video)
- [How to edit animations](./Ediing-Animations.md)
  - [editing SVG](./Ediing-Animations.md#editing-svg)
  - [editing CSS](./Ediing-Animations.md#editing-css)
  - [editing anime.js](./Ediing-Animations.md#editing-anime-js)
  - [editing video](./Ediing-Animations.md#editing-video)
- [How to make videos or GIFs](#making-video-or-gif)
  - [recording your screen](#recording-your-screen)
  - [converting to gif](#converting-to-gif)
- [How to make static images](#making-static-images)
  - [making static SVG](#making-static-svgs)
  - [making PNG](#making-static-pngs)
  - [making JPEG](#making-static-jpegs)

----

## Animations
### Replication: connecting via a pātaka

![](gif/replication-via-internet.gif)

### Replication: connecting locally

![](gif/replication-local.gif)

_**Note:** These two 'replication' animations and the 'data-on-a-pātaka' animation have been written using [anime.js](https://animejs.com) within SVG, as it provides much, much more flexibility than writing animation directly in CSS within SVG.
As Github will not play JS animations within Markdown, the above embedded animation is a recording of the animation, converted to GIF so it can be played anywhere.
The source SVGs can also be downloaded and opened with a web browser to display the animation at full quality, or to inspect/edit the code. Once the animation has been finalized, I'll make a CSS-in-SVG version, as GIFs are worse by basically every measure - see this comparison using the 'local replication' animation:_

|            | SVG    | MP4    | GIF    |
|------------|--------|--------|--------|
| Resolution |  ∞     | 2000px | 1000px |
| Framerate  | ~60fps | 30fps  | 15fps  |
| Filesize   | 0.05Mb | 1.5Mb  | 2.9Mb  |

----
### Data on a Pātaka

![](gif/data-on-a-pātaka.gif)

_Three groups have their data backed up and synchronized on a Pātaka. Group members can only access files from their own groups - the Pātaka will update them with new data when they connect. Kaitiaki / sysadmin cannot access the files, they can only see which group created them. People can be members of more than one group._

----

### Infrastructure Comparison

![](svg/corporate-server.svg)

_Example text: With a 'normal' internet service, your data may be housed in a large
corporate data center overseas._

![](svg/alternative-servers.svg)

_Example text: A Pātaka server can be a small, simple device or a large professional
setup, depending on your needs and preferences._


### Port Forwarding (full animation)
![](svg/port-forwarding.svg)

In practice this would probably make more sense when split up and displayed alongside
the text explanations, like so:

![](svg/port-forwarding_01_scenario.svg)
_1. Explanation of how/why an internet request is made_

----
![](svg/port-forwarding_02_no-port-forwarding.svg)
_2. Explanation of ports, and a request for a specific port_

----
![](svg/port-forwarding_03_with-port-forwarding.svg)
_3. Explanation of port forwarding_

----

## Icons

Examples of the style and format of icons, in 48px and 96px:

![Ethernet icon (48px)](svg/icons/ethernet_48.svg) ![Laptop icon (48px)](svg/icons/laptop_48.svg)
![Mobile icon (48px)](svg/icons/mobile_48.svg)

![Router icon (48px)](svg/icons/router_48.svg) ![Static IP Address icon(48px)](svg/icons/static-ip_48.svg)
![WiFi icon(48px)](svg/icons/wifi_48.svg) ![Internet icon(48px)](svg/icons/internet_48.svg)

----
![Ethernet icon (96px)](svg/icons/ethernet_96.svg) ![Laptop icon (96px)](svg/icons/laptop_96.svg)
![Mobile icon (96px)](svg/icons/mobile_96.svg)

![Router icon (96px)](svg/icons/router_96.svg) ![Static IP Address icon(96px)](svg/icons/static-ip_96.svg)
![WiFi icon(96px)](svg/icons/wifi_96.svg) ![Internet icon(96px)](svg/icons/internet_96.svg)

----

The animation in the WiFi, Internet and Router icons can be removed by deleting or
commenting out the `<style>...</style>` section of the SVG.

----


## Making video or GIF
  - [recording your screen](#recording-your-screen)
  - [converting to gif](#converting-to-gif)

Animated SVG have tiny file sizes, are crisp at any zoom level, can be great for accessibility, and run at 60 frames-per-second. But they can't be embedded in most social media and they won't play in old versions of Internet Explorer. So sometimes you need a crummy old GIF instead.

### Recording your screen
Make a high-quality recording of your edited animation (lossless if possible).
On Linux, I use [SimpleScreenRecorder](https://www.maartenbaert.be/simplescreenrecorder/) to record a fixed rectangle (the dimensions of the SVG) in a full-screened browser window, recording at 30 frames per second, using H264 codec in an MP4 container.

You could also [use FFMPEG to record the screen](https://trac.ffmpeg.org/wiki/Capture/Desktop). On a Mac, you can [use Quicktime Player to record the screen](https://support.apple.com/en-nz/guide/quicktime-player/qtp97b08e666/mac).

### Converting to GIF
I use the incredible command line tool [FFMPEG](https://ffmpeg.org) to convert high-resolution, full-color, 30fps, efficiently-compressed MP4 videos into bloated, crappy GIFs that are half the resolution & framerate, only have 256 colors, and are twice the filesize. I weep softly to myself as I do it.

First, generate a 256-color palette (palette.png) from your source video:
```
ffmpeg -i data-on-a-pātaka.mp4 \
       -filter_complex "[0:v] palettegen" \
       palette.png
```
Then, using the source video and your new palette as inputs, convert the video to a GIF.
```
ffmpeg -i data-on-a-pātaka.mp4 \
       -filter_complex "[0:v] fps=15,scale=1000:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" \
       data-on-a-pātaka.gif
```
`scale=1000:-1` means 'make it 1000px wide, and scale the height according to the original aspect ratio'. Change this (or the `fps=15` framerate setting) if you like, but keep an eye on the resulting filesize of your GIF. GIF has a very old compression algorithm and it makes gigantic files.
