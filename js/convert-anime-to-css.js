// paste this script after the anime timeline in your SVG document (within the same `<script>`, so that it can access the timeline).
// Open the SVG in a browser and it will be converted to CSS animation.

const animeData = getAnimeJsData(tl) // change 'tl' to name of your timeline
const css = convertDataToCss(animeData)
appendCssToDocument(css)
deleteAllScripts() // (including this one)

function getAnimeJsData (timeline) {
  const timelineDuration = timeline.duration
  const keyframeData = {}
  const easings = {}

  getTargetIds(timeline).forEach(id => {
    keyframeData[id] = []
    easings[id] = []
  })

  // Each section of the timeline has its own anim object with all its details
  timeline.children.forEach(anim => {
    anim.animations.forEach(animation => {
      const targetId = animation.animatable.target.id
      const animatedProperty = animation.property

      animation.tweens.forEach(tween => {
        const tweenStart = tween.start + tween.delay + anim.timelineOffset
        const tweenEnd = tween.end + anim.timelineOffset
        const { fromValues, toValues } = getFromAndToValues(tween, animatedProperty)
        keyframeData[targetId] = getKeyframeTimings(keyframeData[targetId], tweenStart, tweenEnd)
        keyframeData[targetId] = (isTransform(animatedProperty))
          ? addValuesToTransformObject(keyframeData[targetId], animatedProperty, tweenStart, tweenEnd, fromValues, toValues)
          : addValuesToPropertyObject(keyframeData[targetId], animatedProperty, tweenStart, tweenEnd, fromValues, toValues)

        easings[targetId].push(getEasingName(tween))
      })
    })
  })
  return { keyframeData, easings, timelineDuration }
}

function convertDataToCss (animeData) {
  const { keyframeData, easings, timelineDuration } = animeData
  const targetIds = Object.keys(keyframeData)
  const cssEasings = {}
  const percentageKeyframes = {}

  targetIds.forEach(id => {
    const easing = determineEasing(id, easings)
    cssEasings[id] = convertEasingToBezier(easing)
    const loopSafeKeyframes = makeLoopSafe(keyframeData[id])
    percentageKeyframes[id] = convertToPercentageKeyframes(loopSafeKeyframes, timelineDuration)
  })

  const timingDeclaration = combineTargetsAndDuration(targetIds, timelineDuration)
  const easingDeclaration = makeTargetListForEachEasing(cssEasings)
  const keyframesDeclaration = formatKeyframesAsCss(percentageKeyframes)
  const css = `${timingDeclaration}${easingDeclaration}${keyframesDeclaration}`

  return css
}

// getAnimeJsData component functions
function getTargetIds (timeline) {
  const ids = new Set()
  timeline.children.forEach(anim => {
    assignMissingIds(anim)
    anim.animations.forEach(animation => {
      ids.add(animation.animatable.target.id)
    })
  })
  return ids
}

function assignMissingIds (anim) {
  let uniqueIdLetter = 'a'

  anim.animations.forEach(animation => {
    // Without an id, keyframes would be written for an empty target
    if (!animation.animatable.target.id) {
      const element = animation.animatable.target.tagName
      const parentNode = animation.animatable.target.parentNode
      const parent = parentNode.id ? parentNode.id : parentNode.tagName

      let generatedId = `${parent}-${element}-${uniqueIdLetter}`
      console.log('⚠️ WARNING: missing id property for ' + element + ' element in #' + parent)

      // check if the proposed id already exists
      while (document.getElementById(generatedId)) {
        uniqueIdLetter = nextChar(uniqueIdLetter)
        generatedId = `${parent}-${element}-${uniqueIdLetter}`
      }

      console.log(`giving target an id of '${generatedId}'`)
      animation.animatable.target.setAttribute('id', generatedId)

      return animation.animatable.target.id
    }
  })
}

function nextChar (letter) {
  return String.fromCharCode(letter.charCodeAt(0) + 1)
}

function getEasingName (tween) {
  // TODO: add cubicBezier easing
  // TODO: add steps() easing
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

  return (easingLookup[fingerprint])
    ? easingLookup[fingerprint]
    : 'invalid'
}

function getFromAndToValues (tween, animatedProperty) {
  // anime adds 'px' to strokeDashoffset values for some reason
  return (animatedProperty === 'strokeDashoffset')
    ? { fromValues: [tween.from.numbers[0]], toValues: [tween.to.numbers[0]] }
    : { fromValues: [tween.from.original], toValues: [tween.to.original] }
}

function getKeyframeTimings (keyframesForTarget, tweenStart, tweenEnd) {
  const keyframeTimings = { ...keyframesForTarget }
  // add an empty keyframe at the tweenStart/tweenEnd times, if there aren't keyframes there already
  if (!keyframeTimings[tweenStart]) keyframeTimings[tweenStart] = { }
  if (!keyframeTimings[tweenEnd]) keyframeTimings[tweenEnd] = { }

  return keyframeTimings
}

function isTransform (property) {
  const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d']
  return validTransforms.includes(property)
}

function addValuesToTransformObject (keyframesForTarget, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  const keyframeValues = { ...keyframesForTarget }
  if (!('transform' in keyframeValues[tweenStart])) keyframeValues[tweenStart].transform = { }
  // add the animated property and its value to the transform object
  keyframeValues[tweenStart].transform[animatedProperty] = fromValues[fromValues.length - 1]
  // do the same for the ending keyframe
  if (!('transform' in keyframeValues[tweenEnd])) keyframeValues[tweenEnd].transform = { }
  keyframeValues[tweenEnd].transform[animatedProperty] = toValues[toValues.length - 1]

  return keyframeValues
}

function addValuesToPropertyObject (keyframesForTarget, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  const keyframeValues = { ...keyframesForTarget }
  // add the current property name to the starting/ending keyframe, with its value
  keyframeValues[tweenStart][animatedProperty] = fromValues[fromValues.length - 1]
  keyframeValues[tweenEnd][animatedProperty] = toValues[toValues.length - 1]

  return keyframeValues
}

// convertDataToCss component functions
function determineEasing (id, easings) {
  const easingFrequencies = easings[id].reduce((acc, easing) => ({
    ...acc,
    [easing]: acc[easing] ? acc[easing] + 1 : 1
  }), {})
  const validEasingsUsed = checkForInvalidEasing(easingFrequencies, id)

  return (validEasingsUsed.length > 1)
    ? calculateMostFrequentEasings(validEasingsUsed, easingFrequencies, id)
    : validEasingsUsed[0]
}

function checkForInvalidEasing (easingFrequencies, id) {
  const easingsUsed = Object.keys(easingFrequencies)
  const checkedForKnownInvalids = checkForKnownInvalids(easingsUsed, id)
  const checkedForUnknownInvalids = checkForUnknownInvalids(checkedForKnownInvalids, id)

  return checkedForUnknownInvalids
}

function checkForKnownInvalids (easingsUsed, id) {
  const knownInvalidEasings = [
    'easeInElastic',
    'easeOutElastic',
    'easeInOutElastic',
    'easeInBounce',
    'easeOutBounce',
    'easeInOutBounce'
  ]
  const isInvalid = (easing) => knownInvalidEasings.includes(easing)
  const isValid = (easing) => !knownInvalidEasings.includes(easing)
  const invalidEasings = easingsUsed.filter(isInvalid)
  const remainingEasings = easingsUsed.filter(isValid)

  invalidEasings.forEach(easingName => {
    console.log(`⚠️ WARNING! '${easingName}' cannot be implemented as a CSS timing function.
  See https://easings.net/#${easingName} for more details.`)
  })

  if (!remainingEasings.length) {
    console.log(`🤖️ Setting #${id}'s easing to 'linear'.`)
    return ['linear']
  } else {
    return remainingEasings
  }
}

function checkForUnknownInvalids (easingsUsed, id) {
  if (easingsUsed.includes('invalid')) {
    const validEasingsUsed = easingsUsed.filter(easing => !'invalid')
    console.log(`⚠️ WARNING: #${id}'s animation uses an easing this script can't convert yet.`)

    if (validEasingsUsed.length === 0) {
      console.log(`🤖️ choosing 'linear' for #${id}'s animation.`)
      return ['linear']
    } else {
      return validEasingsUsed
    }
  } else return easingsUsed
}

function calculateMostFrequentEasings (easingsUsed, easingFrequencies, id) {
  // TODO: check easingFrequencies and remove anything that isn't in easingsUsed!
  console.log(`⚠️ WARNING: #${id}'s animation has more than one easing: '${[...easingsUsed].join(', ')}'`)

  const descendingByValues = (a, b) => (a[1] > b[1]) ? -1 : 1
  const highestNoOfOccurrences = Object.entries(easingFrequencies).sort(descendingByValues)[0][1]
  const mostFrequentEasings = easingsUsed.filter(key => easingFrequencies[key] === highestNoOfOccurrences)

  console.log(`🔍️ most frequent easing: '${[...mostFrequentEasings].join(', ')}'`)
  console.log(`🤖️ choosing '${mostFrequentEasings[0]}' for  #${id}'s animation.`)

  return mostFrequentEasings[0]
}

function convertEasingToBezier (easingName) {
  const validEasings = {
    linear: 'linear',
    easeInSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
    easeOutSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
    easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
    easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
    easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
    easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
    easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
    easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
    easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
    easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
    easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
    easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
    easeInExpo: 'cubic-bezier(0.7, 0, 0.84, 0)',
    easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
    easeInCirc: 'cubic-bezier(0.55, 0, 1, 0.45)',
    easeOutCirc: 'cubic-bezier(0, 0.55, 0.45, 1)',
    easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
    easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeInOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  }
  return validEasings[easingName]
}

function makeLoopSafe (keyframesForTarget) {
  // repeat a property's last stated value if it isn't mentioned in the final keyframe
  // this stops CSS automatically tweening towards the starting value as it nears the end
  const orderedTimings = Object.keys(keyframesForTarget).sort((a, b) => { return a - b })
  const finalKeyframe = orderedTimings.slice(-1)[0]
  const isNotInFinalKeyframe = (property) => !(Object.keys(keyframesForTarget[finalKeyframe]).includes(property))
  const allAnimatedProperties = new Set()

  orderedTimings.forEach(keyframe => {
    Object.keys(keyframesForTarget[keyframe]).forEach(property => allAnimatedProperties.add(property))
  })

  const missingProperties = [...allAnimatedProperties].filter(isNotInFinalKeyframe)

  if (missingProperties.length) {
    missingProperties.forEach(property => {
      const propertyKeyframes = orderedTimings.reduce((acc, keyframe) => {
        if (keyframesForTarget[keyframe][property]) acc.push(keyframesForTarget[keyframe][property])
        return acc
      }, [])

      if (propertyKeyframes[0] !== propertyKeyframes.slice(-1)[0]) {
        keyframesForTarget[finalKeyframe][property] = propertyKeyframes.slice(-1)[0]
      }
    })
  }
  return keyframesForTarget
}

function convertToPercentageKeyframes (keyframesForTarget, timelineDuration) {
  const percentageKeyframesAndValues = {}
  const absoluteKeyframes = Object.keys(keyframesForTarget).sort((a, b) => { return a - b })
  const precision = calculatePrecisionRequired(absoluteKeyframes, timelineDuration)

  absoluteKeyframes.forEach(absoluteKeyframe => {
    const percentageKeyframe = getPercentageString(absoluteKeyframe, timelineDuration, precision)
    const bookendedKeyframe = addZeroAndHundredPercentStrings(absoluteKeyframe, absoluteKeyframes, percentageKeyframe)
    percentageKeyframesAndValues[bookendedKeyframe] = keyframesForTarget[absoluteKeyframe]
  })
  return percentageKeyframesAndValues
}

function calculatePrecisionRequired (keyframeArray, duration) {
  const smallestDifference = keyframeArray.reduce((acc, keyframe, index, arr) =>
    (keyframe - arr[index - 1] < acc || acc === '0') ? keyframe - arr[index - 1] : acc)
  const precision = duration / smallestDifference
  const precisionLevelRequired = (n) => Math.max(100, Math.pow(10, Math.floor(Math.log(n) / Math.LN10 + 0.000000001)) / 10)

  return precisionLevelRequired(precision)
}

function getPercentageString (partial, total, precisionLevel) {
  return Math.round(partial / total * 100 * precisionLevel + Number.EPSILON) / precisionLevel + '%'
}

function addZeroAndHundredPercentStrings (absoluteKeyframe, absoluteKeyframes, percentageKeyframe) {
  // add a 0% & 100% keyframe to each animation so they start in the
  // correct initial position and hold at the end
  const first = Boolean(absoluteKeyframe === absoluteKeyframes[0])
  const last = Boolean(absoluteKeyframe === absoluteKeyframes.slice(-1)[0])

  if (first && percentageKeyframe !== '0%') return '0%, ' + percentageKeyframe
  if (last && percentageKeyframe !== '100%') return percentageKeyframe + ', 100%'

  return percentageKeyframe
}

function combineTargetsAndDuration (targetIds, timelineDuration) {
  const selectorList = '\n  #' + targetIds.join(', #')
  const durationInSeconds = Math.round((timelineDuration) / 10 + Number.EPSILON) / 100
  const durationIterationDeclaration = ' {\n  animation-duration:' + durationInSeconds + 's;\n  animation-iteration-count: infinite;\n}\n'

  return selectorList + durationIterationDeclaration
}

function makeTargetListForEachEasing (oneCssEasingPerTarget) {
  const targetIdsUsingEasing = listTargetIdsUsingEasing(oneCssEasingPerTarget)
  const timingFunctionDeclaration = formatAsTimingFunctionDeclaration(targetIdsUsingEasing)

  return timingFunctionDeclaration
}

function listTargetIdsUsingEasing (oneCssEasingPerTarget) {
  const easingsUsed = new Set(Object.values(oneCssEasingPerTarget))
  const targetIdsUsingEasing = {}

  easingsUsed.forEach(easing => {
    targetIdsUsingEasing[easing] = []
    const getTargets = (oneCssEasingPerTarget, specificEasing) => Object.keys(oneCssEasingPerTarget).filter(key => oneCssEasingPerTarget[key] === specificEasing)
    targetIdsUsingEasing[easing].push(getTargets(oneCssEasingPerTarget, easing))
  })
  return targetIdsUsingEasing
}

function formatAsTimingFunctionDeclaration (targetIdsUsingEasing) {
  const timingFunctionDeclaration = []
  for (const easing in targetIdsUsingEasing) {
    const targetList = targetIdsUsingEasing[easing].join().replace(/,/g, ', #')
    timingFunctionDeclaration.push(`\n#${targetList} {\n animation-timing-function: ${easing};\n}\n`)
  }
  return timingFunctionDeclaration.join('')
}

function formatKeyframesAsCss (keyframeData) {
  let css = ''
  for (const target in keyframeData) {
    css += `\n#${target} { animation-name: ${target}-anim; }\n@keyframes ${target}-anim {\n`
    for (const keyframe in keyframeData[target]) {
      css += `  ${keyframe} {`
      for (const property in keyframeData[target][keyframe]) {
        if (property === 'transform') {
          css += ' transform:'
          for (const transform in keyframeData[target][keyframe][property]) {
            css += ` ${transform}(${keyframeData[target][keyframe][property][transform]})`
          }
          css += ';'
        } else {
          css += ` ${toKebabCase(property)}: ${keyframeData[target][keyframe][property]};`
        }
      }
      css += ' }\n'
    }
    css += '}\n'
  }
  return css
}

function toKebabCase (string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function appendCssToDocument (css) {
  const originalStyle = document.getElementsByTagName('style')[0]
  const newStyle = document.createElement('style')
  newStyle.append(css)

  originalStyle
    ? originalStyle.parentNode.insertBefore(newStyle, originalStyle.nextSibling)
    : document.documentElement.append(newStyle)
}

function deleteAllScripts () {
  console.log('🎉️ Converted! You can now save your CSS animated SVG.\n(Right-click -> "Save Page As")')
  const scripts = document.getElementsByTagName('script')
  while (scripts.length) scripts[0].remove()
}
