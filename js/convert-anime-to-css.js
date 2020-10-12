let cumulativeTimelineDuration = 0

const targets = {}

const logAnimations = (anim) => {
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
    console.log('target list:', Object.keys(targets))
    console.log('targets object:', targets)
  }
}
