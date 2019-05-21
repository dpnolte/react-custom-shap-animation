import React from 'react'
import { Animated } from 'react-native'
import { Stop, StopProps } from 'react-native-svg'

interface IStopProps extends StopProps {
  children: React.ReactNode
}
class AnimatedStopWrapper extends React.PureComponent<IStopProps> {
  render() {
    const { children, ...stopProps } = this.props
    return <Stop {...stopProps}>{children}</Stop>
  }
}
export const AnimatedStop = Animated.createAnimatedComponent(
  AnimatedStopWrapper
)
