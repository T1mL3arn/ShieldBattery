import { urlPath } from '../../common/urls'
import { push } from '../navigation/routing'
import { ResultsSubPage } from './results-sub-page'

/** Navigates to a game's result page (and optionally, a specific tab within that). */
export function navigateToGameResults(gameId: string, tab?: ResultsSubPage) {
  push(urlPath`/games/${gameId}/${tab ?? ''}`)
}
