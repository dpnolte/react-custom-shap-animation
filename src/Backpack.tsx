/* eslint-disable global-require */
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  ScaledSize,
  PanResponderInstance,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native'
import Svg from 'react-native-svg'
import { AnimatedPath } from './AnimatedPath'
import { AnimatedRadialGradient } from './AnimatedRadialGradient'
import { InchRuler } from './InchRuler'
import { isValidHorizontalSwipe, SwipeDirection, isGestureATap } from './Swipe'
import { AnimatedStop } from './AnimatedStop'

const sideButtonPadding = 12
const shownSideMenu = 1
const hiddenSideMenu = 0
const sideMenuBackgroundColor = '#6678fc'
// <3 rainbows
const radiantColors = [
  sideMenuBackgroundColor,
  // purple
  '#b365fd',
  // red
  '#ff6767',
  // yellow
  '#fefc56',
  // green
  '#69fe8b',
  // magenta
  '#ccffff',
  sideMenuBackgroundColor,
]
const colorPerUnit = 1 / (radiantColors.length * 2 - 1)
const lastRadiantColorIndex = radiantColors.length - 1
const sideButtonTopPosition = 270
const sideButtonHeight = 30
const sideButtonBottomPosition = sideButtonTopPosition + sideButtonHeight
const sideButtonMiddlePosition = sideButtonTopPosition + sideButtonHeight * 0.5

const getSwipeDirection = (gestureState: PanResponderGestureState) => {
  if (isValidHorizontalSwipe(gestureState)) {
    return gestureState.dx > 0
      ? SwipeDirection.SWIPE_RIGHT
      : SwipeDirection.SWIPE_LEFT
  }
  return null
}

interface IRadiantColor {
  color: string
  offset: number
}
interface IProps {
  goToFlipCard: () => void
}
interface IState {
  visibleSideMenu: boolean
  hidingSideMenu: boolean
  animatingSideMenuBackground: boolean
  sideMenuX: Animated.Value
  sideMenuCurve: Animated.Value
  sideMenuBackgroundColor: Animated.Value
  sideMenuInterpolatedOuterPointsX: number
  sideMenuInterpolatedInnerCurveX: number
  radiantColors: IRadiantColor[]
  imageHeight: number
  imageMarginTop: number
  imageWidth: number
  imageMarginBottom: number
  imageTintColor: string
}

export class Backpack extends Component<IProps, IState> {
  windowDimensions: ScaledSize

  sideMenuWidth: number

  sideMenuWidthHalf: number

  borderPointsRange: number

  innerCurveRange: number

  panResponder: PanResponderInstance

  constructor(props: IProps) {
    super(props)
    // TODO: handle device orientation (window dimension change if in portrait/landscape)
    this.windowDimensions = Dimensions.get('window')
    this.sideMenuWidth = this.windowDimensions.width * 0.7
    this.sideMenuWidthHalf = this.sideMenuWidth * 0.5
    this.borderPointsRange = this.sideMenuWidth - 15
    this.innerCurveRange = this.sideMenuWidth - 15

    const sideMenuCurve = new Animated.Value(hiddenSideMenu)
    const sideMenuBackgroundColorAnimated = new Animated.Value(0)
    this.state = {
      visibleSideMenu: false,
      hidingSideMenu: false,
      animatingSideMenuBackground: false,
      // sideMenuX: Dimensions.get('window').width * 0.3,
      sideMenuX: new Animated.Value(this.windowDimensions.width - 15),
      sideMenuCurve,
      sideMenuBackgroundColor: sideMenuBackgroundColorAnimated,
      sideMenuInterpolatedOuterPointsX: this.sideMenuWidthHalf,
      sideMenuInterpolatedInnerCurveX: 15,
      radiantColors: [],
      imageHeight: 175,
      imageMarginTop: 25,
      imageWidth: 150,
      imageMarginBottom: 25,
      imageTintColor: 'transparent',
    }

    this.onInchRuleSelectionChange = this.onInchRuleSelectionChange.bind(this)
    this.onPanResponderEnd = this.onPanResponderEnd.bind(this)
    this.onShouldSetPanResponder = this.onShouldSetPanResponder.bind(this)
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.onShouldSetPanResponder,
      onPanResponderRelease: this.onPanResponderEnd,
      onPanResponderTerminate: this.onPanResponderEnd,
    })

    const parent = this
    sideMenuCurve.addListener(({ value }) => {
      const { visibleSideMenu } = parent.state
      if (visibleSideMenu === true) {
        this.onHidingSideMenu(value)
      } else {
        this.onShowingSideMenu(value)
      }
    })
    sideMenuBackgroundColorAnimated.addListener(({ value }) =>
      this.onBackgroundColorChange(value)
    )
  }

  onShowingSideMenu(value: number) {
    const nextState: Partial<IState> = {}
    if (value >= shownSideMenu) {
      nextState.visibleSideMenu = true
      nextState.sideMenuInterpolatedInnerCurveX = 15
    } else if (value <= 0.4) {
      nextState.sideMenuInterpolatedInnerCurveX = 15 - (value / 0.4) * 15
    } else if (value <= 0.6) {
      nextState.sideMenuInterpolatedInnerCurveX = (value - 0.4) * 75
    } else if (value <= 0.8) {
      nextState.sideMenuInterpolatedInnerCurveX = 15 - (value / 0.8) * 15
    } else {
      nextState.sideMenuInterpolatedInnerCurveX = (value - 0.8) * 75
    }
    nextState.sideMenuInterpolatedOuterPointsX =
      this.sideMenuWidth - this.borderPointsRange * value
    this.setState(nextState as IState)
  }

  onInchRuleSelectionChange(selection: string, delta: number) {
    const marginDelta = 25 + delta * -2.5
    this.setState({
      imageHeight: 175 + delta * 5,
      imageWidth: 150 + delta * 5,
      imageMarginTop: marginDelta > 0 ? marginDelta : 0,
      imageMarginBottom: marginDelta > 0 ? marginDelta : 0,
    })
  }

  onHidingSideMenu(value: number) {
    const nextState: Partial<IState> = {}
    if (value <= hiddenSideMenu) {
      nextState.visibleSideMenu = false
      nextState.hidingSideMenu = false
    }
    nextState.sideMenuInterpolatedInnerCurveX =
      15 + this.innerCurveRange * value
    this.setState(nextState as IState)
  }

  onBackgroundColorChange(value: number) {
    // we should cap the rainbow on background color
    // (first stop should always be side menu background color)
    // at 1, all colors should be gone except for bg color
    // at 0, the first custom color should be visible

    // 4 values..
    // #1 at 1/7, only 1st color visible
    // #2 at 2/7 -> 2nd, 1st
    // #3 at 3/7 -> 3rd, 2nd, 1st
    // #4 at 4/7 -> 4th, 3rd, 2nd, 1st
    // #5 at 5/7 -> 4th, 3rd, 2nd
    // #6 at 6/7 -> 4th, 3rd
    // #7 at 7/7 -> 4th

    const colors = []
    const unitsInValue = Math.round(value / colorPerUnit)
    const startingIndex =
      unitsInValue > radiantColors.length
        ? unitsInValue - radiantColors.length
        : 0
    let valueAtColor = value
    let index = startingIndex
    while (valueAtColor >= 0 && index <= lastRadiantColorIndex) {
      colors.push({
        color: radiantColors[index],
        offset: parseFloat(valueAtColor.toFixed(3)),
      })
      valueAtColor -= colorPerUnit
      index += 1
    }

    this.setState({
      radiantColors: colors,
      animatingSideMenuBackground: value > 0 && value < 1,
    })
  }

  onPanResponderEnd(
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    const swipeDirection = getSwipeDirection(gestureState)
    if (swipeDirection) {
      this.triggerSwipeHandlers(swipeDirection)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onShouldSetPanResponder(
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    return evt.nativeEvent.touches.length === 1 && !isGestureATap(gestureState)
  }

  onSwipeLeft() {
    const { visibleSideMenu } = this.state
    if (visibleSideMenu === false) {
      this.toggleSideMenu()
    }
  }

  onSwipeRight() {
    const { visibleSideMenu } = this.state
    if (visibleSideMenu === true) {
      this.toggleSideMenu()
    }
  }

  setImageTintColor(color: string) {
    this.setState({
      imageTintColor: color === '#bdbbbb' ? 'transparent' : color,
    })
  }

  getRadiantColorStops() {
    const colors: React.ReactElement[] = []
    const { radiantColors: currentRadiantColors } = this.state
    currentRadiantColors.forEach(color => {
      if (color.offset <= 1 && color.offset >= 0) {
        colors.push(
          <AnimatedStop
            key={`${color.offset}-${color.color}`}
            offset={color.offset}
            stopColor={color.color}
            stopOpacity="1"
          />
        )
      }
    })
    return colors
  }

  getAnimatedPath() {
    const { sideMenuWidth } = this
    const sideMenuHeight = this.windowDimensions.height
    const {
      sideMenuInterpolatedOuterPointsX: outerPointsX,
      sideMenuInterpolatedInnerCurveX: innerCurveX,
    } = this.state

    // in this case, innercurve equals center point
    const centerPointX = innerCurveX
    // note: adding extra space (i.e. 20); otherwise, white background is showing with spring animation on right hand side
    return `M${sideMenuWidth + 20} 0
                L${outerPointsX} 0
                C${innerCurveX} 0 ${innerCurveX} ${sideButtonTopPosition} ${centerPointX} ${sideButtonTopPosition}
                L${centerPointX} ${sideButtonBottomPosition}
                C${innerCurveX} ${sideButtonBottomPosition} ${innerCurveX} ${sideMenuHeight} ${outerPointsX} ${sideMenuHeight}
                L${sideMenuWidth + 20} ${sideMenuHeight}`
  }

  getSideButtonLeftStyle() {
    const { sideMenuInterpolatedInnerCurveX } = this.state
    return {
      left:
        sideMenuInterpolatedInnerCurveX > 15
          ? sideMenuInterpolatedInnerCurveX - 15
          : 0,
    }
  }

  hideSideMenu() {
    const {
      sideMenuCurve,
      sideMenuX,
      sideMenuBackgroundColor: sideMenuBackgroundColorAnimated,
    } = this.state
    const toValue = Dimensions.get('window').width - sideButtonPadding
    Animated.parallel(
      [
        Animated.spring(sideMenuCurve, {
          toValue: hiddenSideMenu,
          velocity: 1,
          tension: 2,
          friction: 5,
        }),
        Animated.spring(sideMenuX, {
          toValue,
          velocity: 3,
          tension: 2,
          friction: 5,
        }),
      ],
      {
        useNativeDriver: true,
      } as any
    ).start()
    sideMenuBackgroundColorAnimated.setValue(0)
    this.setState({ hidingSideMenu: true })
  }

  showSideMenu() {
    const {
      sideMenuCurve,
      sideMenuX,
      sideMenuBackgroundColor: sideMenuBackgroundColorAnimated,
    } = this.state
    Animated.parallel(
      [
        Animated.spring(sideMenuCurve, {
          toValue: shownSideMenu,
          velocity: 5,
          tension: 6,
          friction: 8,
        }),
        Animated.spring(sideMenuX, {
          toValue: Dimensions.get('window').width * 0.3,
          velocity: 8,
          tension: 2,
          friction: 5,
        }),
        Animated.timing(sideMenuBackgroundColorAnimated, {
          toValue: 1,
        }),
      ],
      {
        useNativeDriver: true,
      } as any
    ).start()
    // this.state.sideMenuBackgroundColor.setValue(0);
  }

  triggerSwipeHandlers(swipeDirection: SwipeDirection) {
    switch (swipeDirection) {
      case SwipeDirection.SWIPE_LEFT:
        this.onSwipeLeft()
        break
      case SwipeDirection.SWIPE_RIGHT:
        this.onSwipeRight()
        break
      default:
    }
  }

  toggleSideMenu() {
    const { visibleSideMenu } = this.state
    if (visibleSideMenu === true) {
      this.hideSideMenu()
    } else {
      this.showSideMenu()
    }
  }

  render() {
    const {
      sideMenuX,
      visibleSideMenu,
      imageHeight,
      imageWidth,
      imageMarginBottom,
      imageMarginTop,
      imageTintColor,
      animatingSideMenuBackground,
      hidingSideMenu,
    } = this.state
    const { goToFlipCard } = this.props
    const windowDimensions = Dimensions.get('window')
    const sideMenuWidth = windowDimensions.width * 0.7
    const sideMenuHeight = windowDimensions.height
    const sideMenuContainerAnimatedStyle = {
      left: sideMenuX,
    }
    const sideMenuGestureTargetAreaWidth = {
      width: visibleSideMenu === true ? windowDimensions.width * 0.3 : '100%',
    }
    const sideMenuFill =
      animatingSideMenuBackground === true
        ? 'url(#grad)'
        : styles.sideMenu.backgroundColor
    const imageStyle = {
      height: imageHeight,
      width: imageWidth,
      marginBottom: imageMarginBottom,
    }
    return (
      <View style={styles.container}>
        <View style={[styles.imageContainer]}>
          <Image
            source={require('../assets/images/bag.png')}
            style={[
              imageStyle,
              {
                marginTop: imageMarginTop,
              },
            ]}
          />
          {imageTintColor !== 'transparent' && (
            <Image
              source={require('../assets/images/bag.png')}
              style={[
                imageStyle,
                {
                  marginTop: -1 * (imageHeight + imageMarginBottom),
                  opacity: 0.3,
                  tintColor: imageTintColor,
                },
              ]}
            />
          )}
        </View>
        <View style={styles.bottomContainer}>
          <Text style={[styles.baseText, styles.title]}>BAG</Text>
          <Text style={[styles.baseText, styles.subTitle]}>
            AIR FOAMPOSITE ONE PRM
          </Text>
          <Text style={[styles.baseText, styles.subTitle]}>
            &quot;LAIDBACK&quot;
          </Text>
          <Text style={[styles.baseText, styles.money]}>$99.9</Text>
          <View style={styles.divider} />
          <Text style={[styles.baseText, styles.bodyText]}>
            &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.&quot;
          </Text>

          <TouchableOpacity style={styles.bottomButton} onPress={goToFlipCard}>
            <Text>Go to Flip Card Animation</Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[sideMenuContainerAnimatedStyle, styles.sideMenuContainer]}
        >
          <Svg width={sideMenuWidth + 20} height={sideMenuHeight}>
            {animatingSideMenuBackground === true && (
              <AnimatedRadialGradient
                id="grad"
                cx="100"
                cy={sideButtonMiddlePosition}
                rx="600"
                ry="600"
                fx="100"
                fy={sideButtonMiddlePosition}
                gradientUnits="userSpaceOnUse"
              >
                {this.getRadiantColorStops()}
              </AnimatedRadialGradient>
            )}
            <AnimatedPath d={this.getAnimatedPath()} fill={sideMenuFill} />
          </Svg>
          {hidingSideMenu === false && (
            <View style={[styles.sideMenuContent]}>
              <Text
                style={[
                  styles.baseText,
                  styles.smallTitle,
                  styles.sideMenuContentText,
                ]}
              >
                BAG
              </Text>
              <Text
                style={[
                  styles.baseText,
                  styles.smallSubTitle,
                  styles.sideMenuContentText,
                  { marginTop: 10 },
                ]}
              >
                AIR FOAMPOSITE ONE PRM
              </Text>
              <Text
                style={[
                  styles.baseText,
                  styles.sideMenuContentText,
                  { marginTop: 30 },
                ]}
              >
                SELECT SIZE
              </Text>
              <InchRuler
                onSelectionChange={(selection, delta) => {
                  const marginDelta = 25 + delta * -2.5
                  this.setState({
                    imageHeight: 175 + delta * 5,
                    imageWidth: 150 + delta * 5,
                    imageMarginTop: marginDelta > 0 ? marginDelta : 0,
                    imageMarginBottom: marginDelta > 0 ? marginDelta : 0,
                  })
                }}
              />
              <Text
                style={[
                  styles.baseText,
                  styles.sideMenuContentText,
                  { marginTop: 30 },
                ]}
              >
                COLORS
              </Text>
              <View style={[styles.colorButtons]}>
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: '#fcfcfc' }]}
                  onPress={() => this.setImageTintColor('#fcfcfc')}
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: '#bdbbbb' }]}
                  onPress={() => this.setImageTintColor('#bdbbbb')}
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: '#fef363' }]}
                  onPress={() => this.setImageTintColor('#fef363')}
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: '#ff6767' }]}
                  onPress={() => this.setImageTintColor('#ff6767')}
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: '#7788fc' }]}
                  onPress={() => this.setImageTintColor('#7788fc')}
                />
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={() => this.toggleSideMenu()}
            style={[
              styles.sideButton,
              styles.sideButton,
              this.getSideButtonLeftStyle(),
            ]}
          >
            <Animated.View style={[styles.innerSideButton]} />
          </TouchableOpacity>
        </Animated.View>
        <View
          {...this.panResponder.panHandlers}
          style={[
            styles.sideMenuGestureTargetArea,
            sideMenuGestureTargetAreaWidth,
          ]}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f6',
  },
  sideMenuGestureTargetArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    height: '85%',
  },
  bottomContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
    padding: 15,
    flex: 1,
  },
  bottomButton: {
    fontSize: 18,
    height: 40,
    position: 'absolute',
    bottom: 0,
  },
  baseText: {},
  title: {
    color: '#554a3a',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#7e7b79',
    fontSize: 16,
    fontWeight: '300',
  },
  sideMenuContentText: {
    color: '#ffffff',
  },
  money: {
    color: '#554a3a',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
  },
  bodyText: {
    color: '#827f73',
    fontSize: 12,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1666b',
    width: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  imageContainer: {
    zIndex: 100,
  },
  sideMenuContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  sideMenu: {
    marginLeft: 12,
    backgroundColor: '#6678fc',
    color: '#f5fdfd',
  },
  smallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  smallSubTitle: {
    fontSize: 12,
    fontWeight: '300',
  },
  sideMenuContent: {
    zIndex: 20,
    position: 'absolute',
    top: 220,
    left: 60,
  },
  sideButton: {
    backgroundColor: '#6678fc',
    borderRadius: 50,
    position: 'absolute',
    top: sideButtonTopPosition,
    height: sideButtonHeight,
    width: sideButtonHeight,
    zIndex: 10,
  },
  innerSideButton: {
    position: 'absolute',
    borderColor: '#fcfcfc',
    backgroundColor: '#6678fc',
    borderRadius: 50,
    borderWidth: 3,
    right: -11,
    top: 4,
    left: 4,
    height: 22,
    width: 22,
  },
  colorButtons: {
    marginTop: 10,
    flexDirection: 'row',
  },
  colorButton: {
    borderRadius: 50,
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginRight: 15,
  },
})
