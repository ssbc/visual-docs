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
      }
      if (!targets[targetId][tweenEnd][animatedProperty]) {
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

  targetIds.forEach(id => {
    const absoluteKeyframes = Object.keys(targets[id])
    let percentageKeyframe = ''
    // convert absolute time keyframes to percentages
    absoluteKeyframes.forEach(keyframe => {
      percentageKeyframe = Math.round(keyframe / cumulativeTimelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'

      targets[id][percentageKeyframe] = targets[id][keyframe]
      delete targets[id][keyframe]
    })
    const percentageKeyframes = Object.keys(targets[id])
    // add a 0% & 100% keyframe to each animation so they start in the
    // correct initial position and hold at the end
    const oldFirstKeyframe = percentageKeyframes[0]
    const oldLastKeyframe = percentageKeyframes[percentageKeyframes.length - 1]
    if (oldFirstKeyframe !== '0%') {
      const newFirstKeyframe = '0%, ' + oldFirstKeyframe
      targets[id][newFirstKeyframe] = targets[id][oldFirstKeyframe]
      delete targets[id][oldFirstKeyframe]
    }
    if (oldLastKeyframe !== '100%') {
      const newLastKeyframe = oldLastKeyframe + ', 100%'
      targets[id][newLastKeyframe] = targets[id][oldLastKeyframe]
      delete targets[id][oldLastKeyframe]
    }
  })

  let animDetails = JSON.stringify(targets)
  // here comes some verbose and repetitive regex!

  // remove quotation marks
  animDetails = animDetails.replace(/['"]+/g, '')
  // remove colons, except in css declaration
  animDetails = animDetails.replace(/:{+/g, '{')
  // find target names, add #, create an animation-name & keyframes declaration
  animDetails = animDetails.replace(/([^{%, .]{2,}){/g, '\n#$1 { animation-name: $1-anim; } \n@keyframes $1-anim {\n  ')
  // find commas in css declarations, replace them with a space
  animDetails = animDetails.replace(/(?<=[a-z0-9]),/g, ' ')
  // add a space to the end of css declarations
  animDetails = animDetails.replace(/(?<=[a-z0-9])}/g, ' }')
  // separate css declarations with a semicolon
  animDetails = animDetails.replace(/([a-zA-ZĀā]*:[0-9][0-9]*\.*[0-9]*[px|deg|%]* *[0-9]*\.*[0-9]*[px|deg|%]* *[0-9]*\.*[0-9]*[px|deg|%]*)/g, '$1; ')
  animDetails = animDetails.replace(/ ;/g, ';')
  // remove commas after closing curly braces
  animDetails = animDetails.replace(/},/g, '}')
  // add spaces to keyframe declarations
  animDetails = animDetails.replace(/%{/g, '% { ')
  // separate two closing braces with a newline
  animDetails = animDetails.replace(/}}/g, '}\n}')
  // separate keyframes with a newline
  animDetails = animDetails.replace(/}([0-9])/g, '}\n  $1')
  // camelCase to kebab-case
  animDetails = animDetails.replace(/(?<=[a-z]*)([A-Z])(?=[a-z]*)/g, '-$1')
  animDetails = animDetails.replace(/(?<=[a-z]*-)([A-Z])(?=[a-z]*)/g, u => u.toLowerCase())
  // remove enclosing curly braces
  animDetails = animDetails.substring(1, animDetails.length - 1)

  targetIds.forEach((id, index) => { targetIds[index] = '#' + id })
  const selectorList = targetIds.toString()
  const durationTimingDeclaration = ' {\n\tanimation-duration:' + cumulativeTimelineDuration + 'ms;\n\tanimation-timing-function: ease-in-out;\n\tanimation-iteration-count: infinite;\n}\n'
  const cssAnimations = selectorList + durationTimingDeclaration + animDetails

  console.log('CSS animations: ', cssAnimations)
}

tl.finished.then(timelineComplete)
tl.play()
