import React from 'react'
import { Animated } from 'react-native'
import { Path, PathProps } from 'react-native-svg'

interface IProps extends PathProps {
  children: React.ReactNode
}
class AnimatedPathWrapper extends React.PureComponent<IProps> {
  render() {
    const { children, ...pathProps } = this.props
    return <Path {...pathProps}>{children}</Path>
  }
}
export const AnimatedPath = Animated.createAnimatedComponent(
  AnimatedPathWrapper
)
