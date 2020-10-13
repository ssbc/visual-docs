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
  console.log('targets object:', targets)
  let stringTargets = JSON.stringify(targets)
  // here comes some verbose and repetitive regex!

  // remove quotation marks
  stringTargets = stringTargets.replace(/['"]+/g, '')
  // remove colons, except in css declaration
  stringTargets = stringTargets.replace(/:{+/g, '{')
  // find target names, add #, create an animation-name & keyframes declaration
  stringTargets = stringTargets.replace(/([^{%, .]{2,}){/g, '\n#$1 { animation-name: $1-anim; } \n@keyframes $1-anim {\n  ')
  // find commas in css declarations, replace them with a space
  stringTargets = stringTargets.replace(/(?<=[a-z0-9]),/g, ' ')
  // add a space to the end of css declarations
  stringTargets = stringTargets.replace(/(?<=[a-z0-9])}/g, ' }')
  // find spaces in css declarations, precede with a semicolon
  stringTargets = stringTargets.replace(/(?<=[a-z0-9]) (?=[a-z0-9}])/g, '; ')
  // remove commas after closing curly braces
  stringTargets = stringTargets.replace(/},/g, '}')
  // add spaces to keyframe declarations
  stringTargets = stringTargets.replace(/%{/g, '% { ')
  // separate two closing braces with a newline
  stringTargets = stringTargets.replace(/}}/g, '}\n}')
  // separate keyframes with a newline
  stringTargets = stringTargets.replace(/}([0-9])/g, '}\n  $1')
  // camelCase to kebab-case
  stringTargets = stringTargets.replace(/(?<=[a-z]*)([A-Z])(?=[a-z]*)/g, '-$1')
  stringTargets = stringTargets.replace(/(?<=[a-z]*-)([A-Z])(?=[a-z]*)/g, u => u.toLowerCase())
  console.log(stringTargets)
}
tl.finished.then(timelineComplete)
tl.play()
