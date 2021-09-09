import { Jsonify } from '../json'
import { SbUserId } from '../users/user-info'
import { GameConfig, GameConfigPlayerId } from './configuration'
import { ReconciledPlayerResult } from './results'

export interface GameRecord {
  id: string
  startTime: Date
  mapId: string
  config: GameConfig<GameConfigPlayerId>
  disputable: boolean
  disputeRequested: boolean
  disputeReviewed: boolean
  gameLength: number | null
  results: [SbUserId, ReconciledPlayerResult][] | null
}

export type GameRecordJson = Jsonify<GameRecord>

export function toGameRecordJson(game: GameRecord): GameRecordJson {
  return {
    id: game.id,
    startTime: Number(game.startTime),
    mapId: game.mapId,
    config: game.config,
    disputable: game.disputable,
    disputeRequested: game.disputeRequested,
    disputeReviewed: game.disputeReviewed,
    gameLength: game.gameLength,
    results: game.results,
  }
}
