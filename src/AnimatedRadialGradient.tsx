import React from 'react'
import { Animated } from 'react-native'
import { RadialGradient, Defs, RadialGradientProps } from 'react-native-svg'

interface IProps extends RadialGradientProps {
  children: React.ReactNode
}

class AnimatedRadialGradientWrapper extends React.PureComponent<IProps> {
  render() {
    const { children, ...gradientProps } = this.props
    return (
      <Defs>
        <RadialGradient {...gradientProps}>{children}</RadialGradient>
      </Defs>
    )
  }
}
export const AnimatedRadialGradient = Animated.createAnimatedComponent(
  AnimatedRadialGradientWrapper
)
