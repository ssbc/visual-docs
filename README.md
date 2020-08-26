# Visual Docs
### Diagrams and animations documenting SSB and Āhau

Made as Scalable Vector Graphic (SVG) files, animated as needed with CSS.
These are made to accompany and illustrate text explanations.

## Animations
### Replication: connecting via a pātaka

![](gif/replication-via-internet.gif)

### Replication: connecting locally

![](gif/replication-local.gif)

_**Note:** These two 'replication' animations have been written using [anime.js](https://animejs.com) within SVG, as it provides much, much more flexibility than writing animation directly in CSS within SVG.
As Github will not play JS animations within Markdown, the above embedded animation is a recording of the animation, converted to GIF so it can be played anywhere.
The source SVGs can also be downloaded and opened with a web browser to display the animation at full quality, or to inspect/edit the code. Once the animation has been finalized, I'll make a CSS-in-SVG version, as GIFs are worse by basically every measure - see this comparison using the 'local replication' animation:_

|            | SVG    | MP4    | GIF    |
|------------|--------|--------|--------|
| Resolution |  ∞     | 2000px | 1000px |
| Framerate  | ~60fps | 30fps  | 15fps  |
| Filesize   | 0.05Mb | 1.5Mb  | 2.9Mb  |

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
