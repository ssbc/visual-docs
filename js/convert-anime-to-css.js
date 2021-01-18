// This script assumes an anime timeline called 'tl'
const timelineDuration = tl.duration
const animationData = {}

// populate 'animationData' and `allEasingsPerTarget` objects
const animeData = getAnimeJsData(tl)
// convert to valid CSS and insert in document
convertDataToCss(animeData)
// delete all scripts (including this one)
deleteScripts()

// Each section of the timeline has its own anim object with all its details
function getAnimeJsData (timeline) {
  const allEasingsPerTarget = {}

  timeline.children.forEach(anim => {
    assignMissingIds(anim)

    anim.animations.forEach(animation => {
      const targetId = animation.animatable.target.id
      const animatedProperty = animation.property
      const fromValues = []
      const toValues = []
      animation.tweens.forEach(tween => {
        const tweenStart = tween.start + tween.delay + anim.timelineOffset
        const tweenEnd = tween.end + anim.timelineOffset
        const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d']

        if (!allEasingsPerTarget[targetId]) allEasingsPerTarget[targetId] = []
        allEasingsPerTarget[targetId].push(getEasingName(tween))

        writeFromAndToValues(tween, animatedProperty, fromValues, toValues)
        createKeyframeObjects(targetId, tweenStart, tweenEnd)

        if (validTransforms.includes(animatedProperty)) {
          addValuesToTransformObject(targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues)
        } else {
          addValuesToPropertyObject(targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues)
        }
      })
    })
  })
  return [animationData, allEasingsPerTarget]
}

function convertDataToCss (animeData) {
  const [keyframeData, easingData] = animeData
  const targetIds = Object.keys(keyframeData)
  const oneEasingPerTarget = {}
  const oneCssEasingPerTarget = {}

  targetIds.forEach(id => {
    oneEasingPerTarget[id] = determineEasing(id, easingData)
    oneCssEasingPerTarget[id] = convertEasingToBezier(id, oneEasingPerTarget)
    keyframeData[id] = convertToPercentageKeyframes(id)
  })
  const timingDeclaration = combineTargetsAndDuration(targetIds)
  const easingDeclaration = listTargetsForEachEasing(oneCssEasingPerTarget)
  const keyframesDeclaration = formatKeyframesAsCss()
  const css = `${timingDeclaration}${easingDeclaration}${keyframesDeclaration}`

  appendCssToDocument(css)
  return css
}

// getAnimeJsData component functions
function assignMissingIds (anim) {
  let uniqueIdLetter = 'a'

  anim.animations.forEach(animation => {
    // Without an id, keyframes will be written for an empty target
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

  return [fromValues, toValues]
}

function createKeyframeObjects (targetId, tweenStart, tweenEnd) {
  // make a new ruleset for the current target, if there isn't one already
  if (!animationData[targetId]) animationData[targetId] = { }
  // add an empty keyframe at the tweenStart time, if there isn't a keyframe there already
  if (!animationData[targetId][tweenStart]) animationData[targetId][tweenStart] = { }
  // add an empty keyframe at the tweenEnd time, if there isn't a keyframe there already
  if (!animationData[targetId][tweenEnd]) animationData[targetId][tweenEnd] = { }
  return animationData[targetId]
}

function addValuesToTransformObject (targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  // add a 'transform' object to the starting keyframe, if it doesn't exist yet
  if (!animationData[targetId][tweenStart].transform) animationData[targetId][tweenStart].transform = { }

  // add the animated property and its value to the transform object
  animationData[targetId][tweenStart].transform[animatedProperty] = fromValues[fromValues.length - 1]

  // add a 'transform' object to the ending keyframe, if it doesn't exist yet
  if (!animationData[targetId][tweenEnd].transform) animationData[targetId][tweenEnd].transform = { }

  // add the animated property and its value to the transform object
  animationData[targetId][tweenEnd].transform[animatedProperty] = toValues[toValues.length - 1]

  return animationData[targetId]
}

function addValuesToPropertyObject (targetId, animatedProperty, tweenStart, tweenEnd, fromValues, toValues) {
  // add the current property name to the starting keyframe, with its starting value
  animationData[targetId][tweenStart][animatedProperty] = fromValues[fromValues.length - 1]

  // add the current property name to the ending keyframe, with its ending value
  animationData[targetId][tweenEnd][animatedProperty] = toValues[toValues.length - 1]

  return animationData[targetId]
}

// convertDataToCss component functions
function determineEasing (id, allEasingsPerTarget) {
  const easingsUsed = new Set(allEasingsPerTarget[id])

  if (easingsUsed.size > 1) {
    console.log(`⚠️ WARNING: #${id}'s animation has more than one easing: '${[...easingsUsed].join(', ')}'`)

    const easingFrequency = {}

    easingsUsed.forEach(name => {
      const occurrencesOfEachEasing = allEasingsPerTarget[id].filter(x => x === name).length
      easingFrequency[name] = occurrencesOfEachEasing
    })

    const highestNoOfOccurrences = Object
      .values(easingFrequency)
      .sort((a, b) => (a > b) ? -1 : 1)[0]
    const mostFrequentEasings = Object.keys(easingFrequency).filter(key => easingFrequency[key] === highestNoOfOccurrences)

    console.log(`🔍️ most frequent easing: '${[...mostFrequentEasings].join(', ')}'`)
    console.log(`🤖️ choosing '${mostFrequentEasings[0]}' for #${id}'s animation.`)
    return mostFrequentEasings[0]
  } else {
    return easingsUsed.values().next().value
  }
}

function convertEasingToBezier (id, oneEasingPerTarget) {
  const easingName = oneEasingPerTarget[id]
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
  const invalidEasings = [
    'easeInElastic',
    'easeOutElastic',
    'easeInOutElastic',
    'easeInBounce',
    'easeOutBounce',
    'easeInOutBounce'
  ]

  if (validEasings[easingName]) {
    return validEasings[easingName]
  }
  if (invalidEasings.includes(easingName)) {
    console.log(`⚠️ WARNING! '${easingName}' cannot be implemented as a CSS timing function.
See https://easings.net/#${easingName} for more details. Setting #${id}'s easing to 'linear'.`)
    return 'linear'
  } else {
    console.log(`¯\\_(ツ)_/¯ Setting #${id}'s easing to 'linear'.`)
    return 'linear'
  }
}

function convertToPercentageKeyframes (id) {
  const percentageKeyframesAndValues = {}
  const absoluteKeyframes = Object.keys(animationData[id]).sort((a, b) => { return a - b })

  absoluteKeyframes.forEach(absoluteKeyframe => {
    let percentageKeyframe = Math.round(absoluteKeyframe / timelineDuration * 100 * 100 + Number.EPSILON) / 100 + '%'
    // add a 0% & 100% keyframe to each animation so they start in the
    // correct initial position and hold at the end
    const first = Boolean(absoluteKeyframe === absoluteKeyframes[0])
    const last = Boolean(absoluteKeyframe === absoluteKeyframes.slice(-1)[0])

    if (first && percentageKeyframe !== '0%') percentageKeyframe = '0%, ' + percentageKeyframe
    if (last && percentageKeyframe !== '100%') percentageKeyframe += ', 100%'

    percentageKeyframesAndValues[percentageKeyframe] = animationData[id][absoluteKeyframe]
  })

  return percentageKeyframesAndValues
}

function combineTargetsAndDuration (targetIds) {
  const selectorList = '\n  #' + targetIds.join(', #')
  const durationInSeconds = Math.round((timelineDuration) / 10 + Number.EPSILON) / 100
  const durationIterationDeclaration = ' {\n  animation-duration:' + durationInSeconds + 's;\n  animation-iteration-count: infinite;\n}\n'

  return selectorList + durationIterationDeclaration
}

function listTargetsForEachEasing (oneCssEasingPerTarget) {
  const easingsUsed = new Set(Object.values(oneCssEasingPerTarget))
  const targetIds = {}
  let timingFunctions = ''

  // 'oneCssEasingPerTarget' lists the CSS animation-timing-function to use
  // for each targeted element, eg:
  //
  // oneCssEasingPerTarget = {
  //   targetA: 'linear',
  //   targetB: 'cubic-bezier(0.45, 0, 0.55, 1)'
  //   targetC: 'cubic-bezier(0.45, 0, 0.55, 1)'
  // }

  easingsUsed.forEach(easing => {
    // create an array of all targetIds using that easing
    targetIds[easing] = []
    const getTargets = (oneCssEasingPerTarget, specificEasing) => Object.keys(oneCssEasingPerTarget).filter(key => oneCssEasingPerTarget[key] === specificEasing)

    targetIds[easing].push(getTargets(oneCssEasingPerTarget, easing))
  })
  for (const easing in targetIds) {
    const targetList = targetIds[easing].join().replace(/,/g, ', #')
    timingFunctions = timingFunctions + `\n#${targetList} {\n animation-timing-function: ${easing};\n}\n`
  }
  return timingFunctions
}

function formatKeyframesAsCss (targetIds, timingFunctions) {
  let css = ''
  for (const target in animationData) {
    css += `\n#${target} { animation-name: ${target}-anim; }\n@keyframes ${target}-anim {\n`
    for (const keyframe in animationData[target]) {
      css += `  ${keyframe} {`
      for (const property in animationData[target][keyframe]) {
        if (property === 'transform') {
          css += ' transform:'
          for (const transform in animationData[target][keyframe][property]) {
            css += ` ${transform}(${animationData[target][keyframe][property][transform]})`
          }
          css += ';'
        } else {
          const kebabCaseProperty = `${property}`
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
          css += ` ${kebabCaseProperty}: ${animationData[target][keyframe][property]};`
        }
      }
      css += ' }\n'
    }
    css += '}\n'
  }
  return css
}

function appendCssToDocument (css) {
  const styleElement = document.createElement('style')
  styleElement.append(css)
  document.documentElement.append(styleElement)
}

function deleteScripts () {
  const scripts = document.getElementsByTagName('script')
  while (scripts.length) scripts[0].remove()
}
