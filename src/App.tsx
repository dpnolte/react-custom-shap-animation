/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/emin93/react-native-template-typescript
 *
 * @format
 */

import React, { useState } from 'react'
import { Backpack } from './Backpack'
import { FlipCard } from './FlipCard'

export enum Page {
  BackPackPage = 'Backpack',
  FlipCardPage = 'FlipCard',
}
export const App = () => {
  const [page, setPage] = useState(Page.BackPackPage)

  let pageComponent: React.ReactElement
  switch (page) {
    case Page.FlipCardPage:
      pageComponent = (
        <FlipCard goToBackpack={() => setPage(Page.BackPackPage)} />
      )
      break
    default:
      pageComponent = (
        <Backpack goToFlipCard={() => setPage(Page.FlipCardPage)} />
      )
  }
  return pageComponent
}
