import { PanResponderGestureState } from 'react-native'

export enum SwipeDirection {
  SWIPE_UP = 'SWIPE_UP',
  SWIPE_DOWN = 'SWIPE_DOWN',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
}

export const swipeConfig = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
}
export const isValidSwipe = (
  velocity: number,
  velocityThreshold: number,
  directionalOffset: number,
  directionalOffsetThreshold: number
) => {
  return (
    Math.abs(velocity) > velocityThreshold &&
    Math.abs(directionalOffset) < directionalOffsetThreshold
  )
}

export const isValidHorizontalSwipe = (
  gestureState: PanResponderGestureState
) => {
  const { vx, dy } = gestureState
  const { velocityThreshold, directionalOffsetThreshold } = swipeConfig
  return isValidSwipe(vx, velocityThreshold, dy, directionalOffsetThreshold)
}

export const isValidVerticalSwipe = (
  gestureState: PanResponderGestureState
) => {
  const { vy, dx } = gestureState
  const { velocityThreshold, directionalOffsetThreshold } = swipeConfig
  return isValidSwipe(vy, velocityThreshold, dx, directionalOffsetThreshold)
}

export const isGestureATap = (gestureState: PanResponderGestureState) => {
  return Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5
}
