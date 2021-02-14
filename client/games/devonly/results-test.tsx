import React, { useState } from 'react'
import { GameClientPlayerResult, GameClientResult } from '../../../common/games/results'
import { FightingSpirit } from '../../maps/devonly/maps-for-testing'
import { GameResults } from '../results'
import { ResultsSubPage } from '../results-sub-page'

export function ResultsTest() {
  const [result] = useState(
    () =>
      new Map<string, GameClientPlayerResult>([
        ['tec27', { result: GameClientResult.Defeat, race: 't', apm: 270 }],
        ['pachi', { result: GameClientResult.Disconnected, race: 'z', apm: 78 }],
        ['2Pacalypse-', { result: GameClientResult.Playing, race: 'p', apm: 175 }],
        ['Mega', { result: GameClientResult.Victory, race: 't', apm: 333 }],
      ]),
  )
  const [subPage, setSubPage] = useState<ResultsSubPage>()

  return (
    <GameResults
      subPage={subPage}
      onTabChange={setSubPage}
      map={FightingSpirit}
      result={result}
      gameDuration={2705340}
    />
  )
}
