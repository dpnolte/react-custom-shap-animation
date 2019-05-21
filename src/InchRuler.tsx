import React from 'react'
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SwipeDirection, isGestureATap } from './Swipe'

const labelPerUnit = 0.5
const range = 1.4
const halfRange = range * 0.5

const initialSelection = 7.0
const height = 150
const inBetweenTenths = Math.ceil(height / (range * 10)) - 2

const getSwipeDirection = (gestureState: PanResponderGestureState) => {
  return gestureState.dy > 0
    ? SwipeDirection.SWIPE_DOWN
    : SwipeDirection.SWIPE_UP
  // }
}

interface IProps {
  onSelectionChange: (selection: string, delta: number) => void
}
interface IState {
  start: number
  end: number
  selected: string
  animatedMean: Animated.Value
}

export class InchRuler extends React.Component<IProps, IState> {
  panResponder: PanResponderInstance

  constructor(props: IProps) {
    super(props)
    const animatedMean = new Animated.Value(initialSelection)
    this.state = {
      start: initialSelection - halfRange,
      end: initialSelection + halfRange,
      selected: initialSelection.toFixed(1),
      animatedMean,
    }
    this.onPanResponderEnd = this.onPanResponderEnd.bind(this)
    this.onShouldSetPanResponder = this.onShouldSetPanResponder.bind(this)
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.onShouldSetPanResponder,
      onPanResponderRelease: this.onPanResponderEnd,
      onPanResponderTerminate: this.onPanResponderEnd,
    })

    const parent = this
    animatedMean.addListener(({ value }) => {
      const start = value - halfRange
      const end = value + halfRange
      const nextSelectedAsFloat = this.getNextSelected(start, end)
      const nextSelected = nextSelectedAsFloat.toFixed(1)
      const { onSelectionChange } = parent.props
      const { selected } = parent.state

      if (onSelectionChange && selected !== nextSelected) {
        const diff = nextSelectedAsFloat - initialSelection
        const delta = diff !== 0 ? diff / labelPerUnit : 0
        onSelectionChange(nextSelected, delta)
      }
      this.setState({
        start,
        end,
        selected: nextSelected,
      })
    })
  }

  // eslint-disable-next-line class-methods-use-this
  onShouldSetPanResponder(
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    return evt.nativeEvent.touches.length === 1 && !isGestureATap(gestureState)
  }

  onPanResponderEnd(
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) {
    const swipeDirection = getSwipeDirection(gestureState)
    this.triggerSwipeHandlers(swipeDirection, gestureState)
  }

  onSwipe(gestureState: PanResponderGestureState) {
    const { selected, animatedMean } = this.state
    const toMean =
      parseFloat(selected) +
      ((-1 * gestureState.dy) / styles.rulerDimensions.height) * range
    // snap to labeled indicator
    const toValue = Math.round(toMean / labelPerUnit) * labelPerUnit
    Animated.spring(animatedMean, {
      toValue,
      // velocity: 3,
    }).start()
  }

  getContent() {
    const { start, end } = this.state
    const views = []
    let top = 0
    for (let tenthUnit = start; tenthUnit <= end; tenthUnit += 0.1) {
      const fixedTenthUnit = parseFloat(tenthUnit.toFixed(1))
      if ((fixedTenthUnit / labelPerUnit) % 1 === 0) {
        views.push(
          <Animated.View
            key={`unit-${tenthUnit}`}
            style={[styles.tenthIndicator, styles.labeledIndicator, { top }]}
          />
        )
        views.push(this.getLabel(fixedTenthUnit, top))
      } else {
        views.push(
          <Animated.View
            key={`unit-${tenthUnit}`}
            style={[styles.tenthIndicator, { top }]}
          />
        )
      }
      top += inBetweenTenths
    }
    return views
  }

  getLabel(unit: number, indicatorTopPosition: number) {
    const { selected } = this.state
    const style =
      unit === parseFloat(selected)
        ? styles.selectedLabel
        : styles.unselectedLabel
    const halfFontSize = style.fontSize * 0.55
    const top =
      indicatorTopPosition > halfFontSize
        ? indicatorTopPosition - halfFontSize
        : indicatorTopPosition
    const label = unit % 1 === 0 ? Math.round(unit) : unit
    return (
      <Animated.Text
        key={`label-${unit}`}
        style={[styles.label, style, { top }]}
      >
        {label}
      </Animated.Text>
    )
  }

  getNextSelected(start: number, end: number) {
    const { selected: currentSelected } = this.state
    const mean = (end + start) / 2
    const selected = parseFloat(currentSelected)
    const candidates = [
      selected - labelPerUnit,
      selected,
      selected + labelPerUnit,
    ]
    return candidates.reduce((prev, curr) => {
      return Math.abs(curr - mean) < Math.abs(prev - mean) ? curr : prev
    })
  }

  triggerSwipeHandlers(
    swipeDirection: SwipeDirection,
    gestureState: PanResponderGestureState
  ) {
    switch (swipeDirection) {
      /* case SWIPE_LEFT:
        this.onSwipeLeft(gestureState);
        break;
      case SWIPE_RIGHT:
        this.onSwipeRight(gestureState);
        break;
      */
      case SwipeDirection.SWIPE_UP:
      case SwipeDirection.SWIPE_DOWN:
        this.onSwipe(gestureState)
        break
      default:
    }
  }

  render() {
    // todo: remove container
    return (
      <View style={styles.rulerDimensions} {...this.panResponder.panHandlers}>
        {this.getContent()}
        <LinearGradient
          colors={['#6678fc', 'rgba(102,120,252, 0)', '#6678fc']}
          locations={[0, 0.5, 0.99]}
          style={styles.rulerDimensions}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  rulerDimensions: {
    height,
    width: 125,
  },
  tenthIndicator: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#fff',
    width: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  labeledIndicator: {
    width: 35,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    position: 'absolute',
    left: 45,
  },
  unselectedLabel: {
    fontSize: Math.round(height * 0.15),
  },
  selectedLabel: {
    fontSize: Math.round(height * 0.3),
  },
})
