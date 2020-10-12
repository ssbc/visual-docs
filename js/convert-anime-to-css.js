// to be added to each timeline section:
// changeBegin: function(anim) { logAnimations(anim) },

let cumulativeTimelineDuration = 0
const targets = {}

const logAnimations = (anim) => {
  const sectionOffset = anim.timelineOffset
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
      const tweenStart = currentTween.start + currentTween.delay + sectionOffset
      const tweenEnd = currentTween.end + sectionOffset
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
  }
}

function timelineComplete () {
  console.log('total timeline duration:', cumulativeTimelineDuration)

  const targetIds = Object.keys(targets)
  console.log('target list:', targetIds)

  targetIds.forEach(id => {
    const absoluteKeyframes = Object.keys(targets[id])
    let percentageKeyframe = ''
    // convert absolute time keyframes to percentages
    absoluteKeyframes.forEach(keyframe => {
      percentageKeyframe = Math.round(keyframe / cumulativeTimelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'

      targets[id][percentageKeyframe] = targets[id][keyframe]
      delete targets[id][keyframe]
      console.log(targets[id])
    })
    const percentageKeyframes = Object.keys(targets[id])
    // add a 0% & 100% keyframe to each animation so they start in the
    // correct initial position and hold at the end
    const oldFirstKeyframe = percentageKeyframes[0]
    const oldLastKeyframe = percentageKeyframes[percentageKeyframes.length - 1]
    const newFirstKeyframe = '0%, ' + oldFirstKeyframe
    const newLastKeyframe = oldLastKeyframe + ', 100%'
    targets[id][newFirstKeyframe] = targets[id][oldFirstKeyframe]
    targets[id][newLastKeyframe] = targets[id][oldLastKeyframe]
    delete targets[id][oldFirstKeyframe]
    delete targets[id][oldLastKeyframe]
  })
  console.log('targets object:', targets)
}
tl.finished.then(timelineComplete)
tl.play()
