// see also --> https://github.com/charpeni/react-native-backface-visibility/blob/master/js/index.js

import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

interface IProps {
  goToBackpack: () => void
}
export class FlipCard extends Component<IProps> {
  isHidden: boolean

  bounceValue: Animated.Value

  animatedValueX: Animated.Value

  opacity: Animated.Value

  valueX: number

  animatedValueY: Animated.Value

  valueY: number

  frontInterpolateX: Animated.AnimatedInterpolation

  backInterpolateX: Animated.AnimatedInterpolation

  frontInterpolateY: Animated.AnimatedInterpolation

  backInterpolateY: Animated.AnimatedInterpolation

  constructor(props: IProps) {
    super(props)

    this.isHidden = true
    this.bounceValue = new Animated.Value(400)
    this.animatedValueX = new Animated.Value(0)
    this.opacity = new Animated.Value(0)
    this.valueX = 0
    this.animatedValueX.addListener(({ value }) => {
      this.valueX = value
    })
    this.animatedValueY = new Animated.Value(0)
    this.valueY = 0
    this.animatedValueY.addListener(({ value }) => {
      this.valueY = value
    })
    this.frontInterpolateX = this.animatedValueX.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    })
    this.backInterpolateX = this.animatedValueX.interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg'],
    })
    this.frontInterpolateY = this.animatedValueY.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    })
    this.backInterpolateY = this.animatedValueY.interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg'],
    })
  }

  moveCardsToTop() {
    let toValue = 100
    if (this.isHidden) {
      toValue = 50
    }

    Animated.timing(this.opacity, {
      toValue: 1,
      duration: 800,
      // useNativeDriver: true,
    }).start()
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(this.bounceValue, {
        toValue,
        velocity: 1,
        tension: 2,
        friction: 5,
      }),
    ]).start()

    this.isHidden = !this.isHidden
  }

  flipCardX() {
    if (this.valueX >= 90) {
      Animated.spring(this.animatedValueX, {
        toValue: 0,
        friction: 8,
        tension: 10,
      }).start()
    } else {
      Animated.spring(this.animatedValueX, {
        toValue: 180,
        friction: 8,
        tension: 10,
      }).start()
    }
  }

  flipCardY() {
    if (this.valueY >= 90) {
      Animated.spring(this.animatedValueY, {
        toValue: 0,
        friction: 8,
        tension: 10,
      }).start()
    } else {
      Animated.spring(this.animatedValueY, {
        toValue: 180,
        friction: 8,
        tension: 10,
      }).start()
    }
  }

  render() {
    const { goToBackpack } = this.props
    if (this.isHidden) this.moveCardsToTop()
    const frontAnimatedStyleY = {
      transform: [{ rotateY: this.frontInterpolateY }],
    }
    const backAnimatedStyleY = {
      transform: [{ rotateY: this.backInterpolateY }],
    }
    const frontAnimatedStyleX = {
      transform: [{ rotateX: this.frontInterpolateX }],
    }
    const backAnimatedStyleX = {
      transform: [{ rotateX: this.backInterpolateX }],
    }
    const moveToTopStyle = {
      opacity: this.opacity,
      transform: [{ translateY: this.bounceValue }],
    }
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.linearGradient}
        >
          <Animated.View style={[styles.container2, moveToTopStyle]}>
            <View>
              <TouchableOpacity onPress={() => this.flipCardX()}>
                <Animated.View style={[styles.flipCard, frontAnimatedStyleX]}>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={['#FEFCEA', '#fefcea', '#f1da36']}
                    style={[styles.linearGradient, styles.cardGradient]}
                  >
                    <Text>Front</Text>
                  </LinearGradient>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.flipCard,
                    styles.flipCardBack,
                    backAnimatedStyleX,
                  ]}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={['#f1da36', '#fefcea', '#FEFCEA']}
                    style={[styles.linearGradient, styles.cardGradient]}
                  >
                    <Text>Back</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => this.flipCardX()}>
              <Text style={[styles.whiteText]}>Flip Vertically</Text>
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => this.flipCardY()}>
                <Animated.View style={[styles.flipCard, frontAnimatedStyleY]}>
                  <LinearGradient
                    colors={['#feffff', '#ddf1f9', '#a0d8ef']}
                    style={[styles.linearGradient, styles.cardGradient]}
                  >
                    <Text>Front</Text>
                  </LinearGradient>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.flipCard,
                    styles.flipCardBack,
                    backAnimatedStyleY,
                  ]}
                >
                  <LinearGradient
                    colors={['#a0d8ef', '#ddf1f9', '#feffff']}
                    style={[styles.linearGradient, styles.cardGradient]}
                  >
                    <Text>Back</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => this.flipCardY()}>
              <Text style={[styles.whiteText]}>Flip Horizontally</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.bottomButton} onPress={goToBackpack}>
            <Text style={[styles.whiteText]}>Go to Backpack Animation</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container2: {
    flex: 1,
    alignItems: 'center',
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGradient: {
    width: 600,
  },
  whiteText: {
    color: 'white',
  },
  bottomButton: {
    fontSize: 18,
    height: 40,
    position: 'absolute',
    bottom: 0,
  },
  flipCard: {
    width: 600,
    height: 80,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    backfaceVisibility: 'hidden',
  },
  flipCardBack: {
    backgroundColor: '#CCCCCC',
    position: 'absolute',
    top: 0,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})
