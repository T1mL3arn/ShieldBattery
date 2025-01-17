import { Record } from 'immutable'
import { ACTIVE_GAME_STATUS, LOBBY_UPDATE_GAME_STARTED } from '../actions'
import { keyedReducer } from '../reducers/keyed-reducer'

export const GameInfo = Record({
  type: null,
  extra: null,
})
export const ActiveGame = Record({
  isActive: false,
  info: new GameInfo(),
})

export default keyedReducer(new ActiveGame(), {
  [LOBBY_UPDATE_GAME_STARTED](state, action) {
    return state
      .set('isActive', true)
      .set('info', new GameInfo({ type: 'lobby', extra: action.payload }))
  },

  ['@matchmaking/gameStarted'](state, action) {
    return state
      .set('isActive', true)
      .set('info', new GameInfo({ type: 'matchmaking', extra: action.payload }))
  },

  [ACTIVE_GAME_STATUS](state, action) {
    const { state: status } = action.payload
    if (status !== 'playing') {
      return new ActiveGame()
    }

    return state
  },
})
