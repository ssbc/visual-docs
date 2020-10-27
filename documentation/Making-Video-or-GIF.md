# Making video or GIF
  - [recording your screen](#recording-your-screen)
  - [converting to gif](#converting-to-gif)

Animated SVG have tiny file sizes, are crisp at any zoom level, can be great for accessibility, and run at 60 frames-per-second. But they can't be embedded in most social media and they won't play in old versions of Internet Explorer. So sometimes you need a crummy old GIF instead.

## Recording your screen
Make a high-quality recording of your edited animation (lossless if possible).
On Linux, I use [SimpleScreenRecorder](https://www.maartenbaert.be/simplescreenrecorder/) to record a fixed rectangle (the dimensions of the SVG) in a full-screened browser window, recording at 30 frames per second, using H264 codec in an MP4 container.

You could also [use FFMPEG to record the screen](https://trac.ffmpeg.org/wiki/Capture/Desktop). On a Mac, you can [use Quicktime Player to record the screen](https://support.apple.com/en-nz/guide/quicktime-player/qtp97b08e666/mac).

## Converting to GIF
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
`scale=1000:-1` means 'make it 1000px wide, and scale the height according to the original aspect ratio'. Change this (or the `fps=15` framerate setting) if you like, but keep an eye on the resulting filesize of your GIF. GIF has a very old compression algorithm [(from 1984! 🤯)](https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Welch) and it makes gigantic files by modern standards.
