import { GameClientPlayerResult } from '../../common/games/results'

export type GamesActions = DeliverLocalResults

export interface DeliverLocalResults {
  type: '@games/deliverLocalResults'
  payload: {
    gameId: string
    result: Record<string, GameClientPlayerResult>
    time: number
  }
  error?: false
}
