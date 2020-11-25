// currently, all elements that are animated must have an id.
// Add ids if they're missing.

// This script currently assumes an anime timeline called 'tl'

const timelineDuration = tl.duration
const targets = {}
const easings = {}

function getAnimations (anim) {
  const sectionOffset = anim.timelineOffset
  for (const animation of anim.animations) {
    const targetId = animation.animatable.target.id
    const animatedProperty = animation.property
    const fromValues = []
    const toValues = []

    // Without an id, keyframes will be written for an empty target.
    if (!targetId) console.log('⚠️ WARNING: missing id property for ' + animation.animatable.target.tagName + ' element in #' + animation.animatable.target.parentNode.id)

    for (const tween of animation.tweens) {
      const tweenStart = tween.start + tween.delay + sectionOffset
      const tweenEnd = tween.end + sectionOffset
      const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d']

      if (!easings[targetId]) easings[targetId] = []
      easings[targetId].push(getEasingName(tween))

      writeFromAndToValues(tween, animatedProperty, fromValues, toValues)
      createKeyframeObjects(targetId, tweenStart, tweenEnd)

      if (validTransforms.includes(animatedProperty)) {
        addValuesToTransformObject(targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues)
      } else {
        addValuesToPropertyObject(targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues)
      }
    }
  }
}

// Each section of the timeline has its own anim object with all its details

for (const anim of tl.children) {
  getAnimations(anim)
}

// Now that the 'targets' object has been completed, it can be converted to valid CSS

function timelineComplete () {
  const targetIds = Object.keys(targets)

  targetIds.forEach(id => {
    determineEasing(id)
    convertToPercentageKeyframes(id)
    addStartAndEndKeyframes(id)
  })

  convertObjectToCss(targetIds)
}

timelineComplete()

// component functions

function getEasingName (tween) {
  const fingerprint = [tween.easing(0.2), tween.easing(0.7)].join()
  const easingLookup = {
    '0.2,0.7': 'linear',
    '0.04894348370484647,0.5460095002604531': 'easeInSine',
    '0.30901699437494745,0.8910065241883679': 'easeOutSine',
    '0.09549150281252627,0.7938926261462365': 'easeInOutSine',
    '0.29389262614623657,0.5954915028125263': 'easeOutInSine',
    '0.020204102886728803,0.285857157145715': 'easeInCirc',
    '0.5999999999999999,0.9539392014169457': 'easeOutCirc',
    '0.041742430504416006,0.8999999999999999': 'easeInOutCirc',
    '0.4,0.541742430504416': 'easeOutInCirc',
    '-0.05600000000000001,0.04899999999999982': 'easeInBack',
    '0.7439999999999998,1.099': 'easeOutBack',
    '-0.064,1.036': 'easeInOutBack',
    '0.536,0.436': 'easeOutInBack',
    '0.06,0.31937499999999985': 'easeInBounce',
    '0.30249999999999977,0.9306249999999998': 'easeOutBounce',
    '0.11375000000000002,0.9550000000000001': 'easeInOutBounce',
    '0.45499999999999996,0.61375': 'easeOutInBounce',
    '-0.0031602226342771393,-0.10112712429686835': 'easeInElastic',
    '1.2022542485937366,1.0063204452685544': 'easeOutElastic',
    '0.0024141952685542796,0.9903432189257829': 'easeInOutElastic',
    '0.4903432189257829,0.5024141952685542': 'easeOutInElastic',
    '0.04000000000000001,0.48999999999999994': 'easeInQuad',
    '0.3599999999999999,0.9099999999999999': 'easeOutQuad',
    '0.08000000000000002,0.82': 'easeInOutQuad',
    '0.32,0.58': 'easeOutInQuad',
    '0.008000000000000002,0.3429999999999999': 'easeInCubic',
    '0.4879999999999999,0.973': 'easeOutCubic',
    '0.03200000000000001,0.8919999999999999': 'easeInOutCubic',
    '0.392,0.532': 'easeOutInCubic',
    '0.0016000000000000007,0.24009999999999992': 'easeInQuart',
    '0.5903999999999998,0.9919': 'easeOutQuart',
    '0.012800000000000006,0.9351999999999999': 'easeInOutQuart',
    '0.43520000000000003,0.5128': 'easeOutInQuart',
    '0.0003200000000000002,0.16806999999999994': 'easeInQuint',
    '0.6723199999999998,0.99757': 'easeOutQuint',
    '0.005120000000000003,0.96112': 'easeInOutQuint',
    '0.46112,0.50512': 'easeOutInQuint',
    '0.00006400000000000004,0.11764899999999995': 'easeInExpo',
    '0.7378559999999998,0.999271': 'easeOutExpo',
    '0.002048000000000001,0.976672': 'easeInOutExpo',
    '0.476672,0.502048': 'easeOutInExpo'
  }

  return easingLookup[fingerprint]
}

function writeFromAndToValues (tween, animatedProperty, fromValues, toValues) {
  // anime adds 'px' to strokeDashoffset values for some reason
  if (animatedProperty === 'strokeDashoffset') {
    fromValues.push(tween.from.numbers[0])
    toValues.push(tween.to.numbers[0])
  } else { // otherwise anime's extra formatting (eg. +px, +deg) is quite useful
    fromValues.push(tween.from.original)
    toValues.push(tween.to.original)
  }
}

function createKeyframeObjects (targetId, tweenStart, tweenEnd) {
  // make a new ruleset for the current target, if there isn't one already
  if (!targets[targetId]) targets[targetId] = { }
  // add an empty keyframe at the tweenStart time, if there isn't a keyframe there already
  if (!targets[targetId][tweenStart]) targets[targetId][tweenStart] = { }
  // add an empty keyframe at the tweenEnd time, if there isn't a keyframe there already
  if (!targets[targetId][tweenEnd]) targets[targetId][tweenEnd] = { }
}

function addValuesToTransformObject (targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  // add a 'transform' object to the starting keyframe, if it doesn't exist yet
  if (!targets[targetId][tweenStart].transform) targets[targetId][tweenStart].transform = { }

  // add the animated property and its value to the transform object, if it doesn't exist yet
  if (!targets[targetId][tweenStart].transform[animatedProperty]) {
    Object.defineProperty(targets[targetId][tweenStart].transform, animatedProperty, {
      value: fromValues[fromValues.length - 1],
      enumerable: true
    })
  }
  // if it does exist already, um, do nothing for now...
  // TODO: find out what is happening if it does exist!

  // add a 'transform' object to the ending keyframe, if it doesn't exist yet
  if (!targets[targetId][tweenEnd].transform) targets[targetId][tweenEnd].transform = { }

  // add the animated property and its value to the transform object, if it doesn't exist yet
  if (!targets[targetId][tweenEnd].transform[animatedProperty]) {
    Object.defineProperty(targets[targetId][tweenEnd].transform, animatedProperty, {
      value: toValues[toValues.length - 1],
      enumerable: true
    })
  }
}

function addValuesToPropertyObject (targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  // if the current property name isn't found in the starting keyframe, add it, and its starting value
  if (!targets[targetId][tweenStart][animatedProperty]) {
    Object.defineProperty(targets[targetId][tweenStart], animatedProperty, {
      value: fromValues[fromValues.length - 1],
      enumerable: true
    })
  }
  // if the current property name isn't found in the ending keyframe, add it, and its starting value
  if (!targets[targetId][tweenEnd][animatedProperty]) {
    Object.defineProperty(targets[targetId][tweenEnd], animatedProperty, {
      value: toValues[toValues.length - 1],
      enumerable: true
    })
  }
}

function determineEasing (id) {
  const easingNames = new Set(easings[id])

  if (easingNames.size > 1) {
    console.log(`⚠️ WARNING: #${id}'s animation has more than one easing: '${[...easingNames].join(', ')}'`)

    const easingFrequency = {}

    for (const name of easingNames) {
      const occurrences = easings[id].filter(x => x === name).length
      easingFrequency[name] = occurrences
    }

    const highestNoOfOccurrences = Object
      .values(easingFrequency)
      .sort((a, b) => (a > b) ? -1 : 1)[0]
    const mostFrequentEasings = Object.keys(easingFrequency).filter(key => easingFrequency[key] === highestNoOfOccurrences)

    console.log(`🔍️ most frequent easing: '${[...mostFrequentEasings].join(', ')}'`)
    console.log(`🤖️ choosing '${mostFrequentEasings[0]}' for #${id}'s animation.`)
  } else {
    console.log(`#${id} easing: '${[...easingNames].join(', ')}'`)
  }
}

function convertToPercentageKeyframes (id) {
  const absoluteKeyframes = Object.keys(targets[id])

  let percentageKeyframe = ''

  // convert absolute time keyframes to percentages
  absoluteKeyframes.forEach(keyframe => {
    percentageKeyframe = Math.round(keyframe / timelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'

    targets[id][percentageKeyframe] = targets[id][keyframe]
    delete targets[id][keyframe]
  })
}

function addStartAndEndKeyframes (id) {
  // add a 0% & 100% keyframe to each animation so they start in the
  // correct initial position and hold at the end

  const percentageKeyframes = Object.keys(targets[id])
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
  sortKeyframes(id)
}

function sortKeyframes (id) {
  // Keyframe -> Number
  const firstKeyframeNumber = (kf) => {
  // takes keyframe string (e.g. '0%, 19%')
  // returns first number in this string as an integer (e.g. 0)
    const first = kf
      .split(',')[0]
      .replace('%', '')
    return Number(first)
  }
  // build a new keyframes object where the keys are sorted by percentage
  // 0% (or 0,n%) should be first, 100 (or n%, 100%) should be last.
  const sortedKeyframes = Object.keys(targets[id])
    .sort((a, b) => firstKeyframeNumber(a) - firstKeyframeNumber(b))
    .reduce((keyframes, keyframe) => {
      // starting with an empty object, run through each key, in our sorted lisst
      // add it to the obj with the value being that same key in our targets[id]
      // when we are done, we'll have a full sorted object
      return {
        ...keyframes,
        [keyframe]: targets[id][keyframe]
      }
    }, {}) // here be the empty object that starts the reduce loop
  targets[id] = sortedKeyframes
}

function convertObjectToCss (targetIds) {
  let animDetails = JSON.stringify(targets)

  // remove quotation marks
  animDetails = animDetails.replace(/['"]+/g, '')
  // wrap transform property values in brackets
  animDetails = animDetails.replace(/(translateX|translateY|translateZ|rotateX|rotateY|rotateZ|rotate|scaleX|scaleY|scaleZ|scale|skewX|skewY|skew|perspective|matrix3d|matrix):(-*[0-9]*\.*[0-9]*[px|deg|%]*),*/g, '$1($2) ')
  // swap transforms' curly brace to a colon
  animDetails = animDetails.replace(/(transform:){/g, '$1 ')
  // add a semicolon to the end of the transform value
  animDetails = animDetails.replace(/\) }/g, ');')
  // remove colons, except in css declarations
  animDetails = animDetails.replace(/:{+/g, '{')
  // find target names, add #, create an animation-name & keyframes declaration
  animDetails = animDetails.replace(/([^{%, .]{2,}){/g, '\n#$1 { animation-name: $1-anim; } \n@keyframes $1-anim {\n  ')
  // find commas in css declarations, replace them with a space
  animDetails = animDetails.replace(/(?<=[a-z0-9]),/g, ' ')
  // add a space to the end of css declarations
  animDetails = animDetails.replace(/(?<=[a-z0-9;])}/g, ' }')
  // separate css declarations with a semicolon
  animDetails = animDetails.replace(/([a-zA-ZĀā]*:[0-9][0-9]*\.*[0-9]*[px|deg|%]* *[0-9]*\.*[0-9]*[px|deg|%]* *[0-9]*\.*[0-9]*[px|deg|%]*)/g, '$1; ')
  animDetails = animDetails.replace(/ ;/g, ';')
  // remove commas after closing curly braces or semicolons
  animDetails = animDetails.replace(/(}|;),/g, '$1')
  // add spaces to keyframe declarations
  animDetails = animDetails.replace(/%{/g, '% { ')
  // separate two closing braces with a newline
  animDetails = animDetails.replace(/}}/g, '}\n}')
  // separate keyframes with a newline
  animDetails = animDetails.replace(/}([0-9])/g, '}\n  $1')
  // camelCase to kebab-case
  // separate words with hyphen (don't include X/Y/Z transforms)
  animDetails = animDetails.replace(/([a-z])([A-W])/g, '$1-$2')
  // TODO: lowercase only the previous match, not the whole string
  // animDetails.toLowerCase()
  // remove enclosing curly braces
  animDetails = animDetails.substring(1, animDetails.length - 1)

  targetIds.forEach((id, index) => { targetIds[index] = '#' + id })
  const selectorList = targetIds.toString()
  const durationInSeconds = Math.round((timelineDuration) / 10 + Number.EPSILON) / 100
  const durationTimingDeclaration = ' {\n\tanimation-duration:' + durationInSeconds + 's;\n\tanimation-timing-function: ease-in-out;\n\tanimation-iteration-count: infinite;\n}\n'
  const cssAnimations = selectorList + durationTimingDeclaration + animDetails

  console.log('CSS animations: ', cssAnimations)
}
