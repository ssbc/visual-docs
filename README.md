# Visual Docs
**Diagrams and animations documenting SSB and Āhau**

Made as Scalable Vector Graphic (SVG) files. Animations primarily written with [anime.js](https://animejs.com), and converted to CSS animation.
These are made to accompany and illustrate text explanations.

## Repo


- [📁️ **documentation**](documentation) ← _how to use or adapt animations_

- [📁️ **font**](font) ← _base64 encoding of Dosis typeface, for embedding_

- [📁️ **js**](js) ← _anime.js to css conversion script_

- [📁️ **png**](png) ← _static raster icons_

- [📁️ **svg**](svg) ← _the good stuff, it's all in here_

- [ 📄️ **ROADMAP.md**](ROADMAP.md) ← _overview of progress and planned animations_

- [ 📄️ **README.md**](README.md) ← _YOU ARE HERE. 📍️ Read me!_

## Table of Contents
- [Documentation](#documentation)
- [Animations](#animations)
- [Icons](#icons)

----

### Documentation
- [**How to use animations**](documentation/Using-Animations.md)
  - [in a website](documentation/Using-Animations.md#using-animations-in-a-website)
  - [on social media / ssb / github](documentation/Using-Animations.md#using-animations-on-social-media)
- [**How to edit animations**](documentation/Editing-Animations.md)
  - [editing SVG](documentation/Editing-Animations.md#editing-svg)
  - [changing fonts](documentation/Editing-Animations.md#changing-fonts)
  - [editing CSS](documentation/Editing-Animations.md#editing-css)
  - [editing anime.js](documentation/Editing-Animations.md#editing-animejs)
  - [converting an anime.js timeline to CSS](documentation/Editing-Animations.md#converting-an-animejs-timeline-to-css)
- [**How to make videos or GIFs**](Making-Video-or-GIF.md)
  - [recording your screen](documentation/Making-Video-or-GIF.md#recording-your-screen)
  - [converting to gif](documentation/Making-Video-or-GIF.md#converting-to-gif)
- [**How to make static images**](documentation/Making-Static-Images.md)
  - [making static SVG](documentation/Making-Static-Images.md#making-static-svg)
  - [making PNG](documentation/Making-Static-Images.md#making-static-png)
  - [making JPEG](documentation/Making-Static-Images.md#making-static-jpeg)

----

## Animations
### Replication: connecting via a pātaka

![](svg/replication-via-internet_css.svg)

### Replication: connecting locally

![](svg/replication-local_css.svg)

### Replication: Multiple pātaka

![](svg/multiple-pātaka_css.svg)

### Data on a Pātaka

![](svg/data-on-a-pātaka_css.svg)

_Three groups have their data backed up and synchronized on a Pātaka. Group members can only access files from their own groups - the Pātaka will update them with new data when they connect. Kaitiaki / sysadmin cannot access the files, they can only see which group created them. People can be members of more than one group._

### Infrastructure Comparison

![](svg/corporate-server.svg)

_Example text: With a 'normal' internet service, your data may be housed in a large
corporate data center overseas._

![](svg/alternative-servers.svg)

_Example text: A Pātaka server can be a small, simple device or a large professional
setup, depending on your needs and preferences._

### Port Forwarding
![](svg/port-forwarding_01_without-port-forwarding.svg)
_1. Explanation of ports, and a request for a specific port_

![](svg/port-forwarding_02_with-port-forwarding.svg)
_2. Explanation of port forwarding_

----

## Icons

Examples of the style and format of icons, in 48px and 96px:

![Ethernet icon (48px)](svg/icons/ethernet_48.svg) ![Laptop icon (48px)](svg/icons/laptop_48.svg)
![Mobile icon (48px)](svg/icons/mobile_48.svg)

![Router icon (48px)](svg/icons/router_48.svg) ![Static IP Address icon(48px)](svg/icons/static-ip_48.svg)
![WiFi icon(48px)](svg/icons/wifi_48.svg) ![Internet icon(48px)](svg/icons/internet_48.svg)

![Ethernet icon (96px)](svg/icons/ethernet_96.svg) ![Laptop icon (96px)](svg/icons/laptop_96.svg)
![Mobile icon (96px)](svg/icons/mobile_96.svg)

![Router icon (96px)](svg/icons/router_96.svg) ![Static IP Address icon(96px)](svg/icons/static-ip_96.svg)
![WiFi icon(96px)](svg/icons/wifi_96.svg) ![Internet icon(96px)](svg/icons/internet_96.svg)


The animation in the WiFi, Internet and Router icons can be removed by deleting or
commenting out the `<style>...</style>` section of the SVG.
