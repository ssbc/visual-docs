// this is a partial helper script to convert an anime.js timeline into CSS animation.
// it converts relative time values to absolute values, then to percentages, and
// lists property and value changes per element, as required by CSS. There's still
// a bit of manual work required for now.
// How this script currently works:
// a 'beginSection' function is called in the 'changeBegin' hook of each timeline section:

// .add({
//   changeBegin: function(anim) { beginSection(anim) },
//   targets: '#light-a-on',
//   opacity: [0, 1],
// })

// to set this up on an animation, use find-and-replace in your text editor
// to add 'changeBegin' to each section.
// in the timeline declaration, set 'loop: false'
// run the animation all the way through once, to get the timeline duration,
// which will be the last (and highest) logged 'timeline duration' number.
// paste this number as the value of the 'timelineDuration' variable
// run the animation again.
// now you can copy the last logged 'targets' object and use it as the basis for
// your CSS animation. (Currently you'll need to do a bunch of regex find-and-
// replace to fit the CSS syntax)

let cumulativeTimelineDuration = 0

const targets = {}

const beginSection = (anim) => {
  const sectionOffset = anim.timelineOffset
  const timelineDuration = 30000 // change value to your animation's timeline duration
  let i
  for (i = 0; i < anim.animations.length; i++) {
    const currentAnimation = anim.animations[i]
    const targetId = currentAnimation.animatable.target.id
    const fromValues = []
    const toValues = []
    const animatedProperty = currentAnimation.property

    let j
    for (j = 0; j < currentAnimation.tweens.length; j++) {
      const currentTween = currentAnimation.tweens[j]
      const tweenStart = Math.round((currentTween.start + currentTween.delay + sectionOffset) / timelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'
      const tweenEnd = Math.round((currentTween.end + sectionOffset) / timelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'
      fromValues.push(currentTween.from.original)
      toValues.push(currentTween.to.original)
      if (!targets[targetId]) targets[targetId] = { }
      if (!targets[targetId][tweenStart]) targets[targetId][tweenStart] = { }
      if (!targets[targetId][tweenEnd]) targets[targetId][tweenEnd] = { }
      if (!targets[targetId][tweenStart][animatedProperty]) {
        Object.defineProperty(targets[targetId][tweenStart], animatedProperty, {
          value: fromValues[j],
          enumerable: true
        })
        Object.defineProperty(targets[targetId][tweenEnd], animatedProperty, {
          value: toValues[j],
          enumerable: true
        })
      }
      const duration = Math.round((currentAnimation.duration - currentAnimation.delay) * 100 + Number.EPSILON) / 100
      cumulativeTimelineDuration = duration + sectionOffset
      console.log('timeline duration:', cumulativeTimelineDuration)
    }
    console.log(JSON.stringify(targets))
  }
}
