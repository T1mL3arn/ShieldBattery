import { Immutable } from 'immer'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { assertUnreachable } from '../../common/assert-unreachable'
import { GameRecordJson } from '../../common/games/games'
import { ReconciledPlayerResult, ReconciledResult } from '../../common/games/results'
import { useSelfUser } from '../auth/state-hooks'
import { ComingSoon } from '../coming-soon/coming-soon'
import { RaceIcon } from '../lobbies/race-icon'
import { batchGetMapInfo } from '../maps/action-creators'
import { MapThumbnail } from '../maps/map-thumbnail'
import Card from '../material/card'
import { shadowDef2dp } from '../material/shadow-constants'
import { TabItem, Tabs } from '../material/tabs'
import { LoadingDotsArea } from '../progress/dots'
import { useAppDispatch, useAppSelector } from '../redux-hooks'
import { amberA200, colorNegative, colorPositive, colorTextSecondary } from '../styles/colors'
import {
  body2,
  Headline3,
  headline5,
  headline6,
  overline,
  singleLine,
  subtitle1,
} from '../styles/typography'
import { navigateToGameResults, viewGame } from './action-creators'
import { ResultsSubPage } from './results-sub-page'

const Container = styled.div`
  max-width: 960px;
  padding: 24px 12px;
`

const TabArea = styled.div`
  width: 100%;
  max-width: 720px;
`

const HeaderArea = styled.div`
  height: 72px;
  margin: 0 0 16px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderInfo = styled.div`
  height: 100%;
  display: flex;

  flex-direction: column;
  justify-content: center;
`

const HeaderInfoItem = styled.div`
  display: flex;
  align-items: center;

  color: ${colorTextSecondary};

  & + & {
    margin-top: 4px;
  }
`

const HeaderInfoLabel = styled.div`
  ${overline};
  ${singleLine};
  width: 96px;
  margin-right: 24px;

  text-align: right;
`

const HeaderInfoValue = styled.div`
  ${subtitle1};
  ${singleLine};
`

const LiveIndicator = styled.div`
  ${body2};
  ${singleLine};

  color: ${amberA200};
`

function getDurationStr(durationMs: number): string {
  const timeSec = Math.floor(durationMs / 1000)
  const hours = Math.floor(timeSec / 3600)
  const minutes = Math.floor(timeSec / 60) % 60
  const seconds = timeSec % 60

  return [hours, minutes, seconds]
    .map(v => ('' + v).padStart(2, '0'))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':')
}

function getGameTypeString(game: Immutable<GameRecordJson>): string {
  // TODO(tec27): Handle more ranked types, show mode (UMS, Top v Bottom, etc.?)
  if (game.config.gameSource === 'LOBBY') {
    return 'Custom game'
  } else if (game.config.gameSource === 'MATCHMAKING') {
    return 'Ranked 1v1'
  }
}

export interface ConnectedGameResultsPageProps {
  gameId: string
  subPage?: ResultsSubPage
}

export function ConnectedGameResultsPage({
  gameId,
  subPage = ResultsSubPage.Summary,
}: ConnectedGameResultsPageProps) {
  const dispatch = useAppDispatch()
  const onTabChange = useCallback(
    (tab: ResultsSubPage) => {
      navigateToGameResults(gameId, tab)
    },
    [gameId],
  )

  const selfUser = useSelfUser()
  const game = useAppSelector(s => s.games.byId.get(gameId))
  const [loadingError, setLoadingError] = useState<Error>()
  const cancelLoadRef = useRef(new AbortController())

  useEffect(() => {
    cancelLoadRef.current.abort()
    const abortController = new AbortController()
    cancelLoadRef.current = abortController

    dispatch(
      viewGame(gameId, {
        signal: abortController.signal,
        onSuccess: () => setLoadingError(undefined),
        onError: err => setLoadingError(err),
      }),
    )

    return () => {
      abortController.abort()
    }
  }, [gameId, dispatch])

  let content: React.ReactNode
  switch (subPage) {
    case ResultsSubPage.Summary:
      content = <SummaryPage gameId={gameId} game={game} loadingError={loadingError} />
      break

    case ResultsSubPage.Stats:
    case ResultsSubPage.BuildOrders:
      content = <ComingSoonPage />
      break

    default:
      content = assertUnreachable(subPage)
  }

  const headline = useMemo<string>(() => {
    if (game && !game.results) {
      return 'In progress…'
    } else if (
      game &&
      game.config.teams.some(t => t.some(p => !p.isComputer && p.id === selfUser.id))
    ) {
      for (const [id, result] of game.results!) {
        if (id === selfUser.id) {
          switch (result.result) {
            case 'win':
              return 'Victory!'
            case 'loss':
              return 'Defeat!'
            case 'draw':
            case 'unknown':
              return 'Draw!'
            default:
              return assertUnreachable(result.result)
          }
        }
      }
    }

    return 'Results'
  }, [selfUser, game])

  return (
    <Container>
      <HeaderArea>
        <Headline3>{headline}</Headline3>
        <HeaderInfo>
          {game ? (
            <>
              <HeaderInfoItem>
                <HeaderInfoLabel>Type</HeaderInfoLabel>
                <HeaderInfoValue>{getGameTypeString(game)}</HeaderInfoValue>
              </HeaderInfoItem>
              <HeaderInfoItem>
                <HeaderInfoLabel>Time</HeaderInfoLabel>
                <HeaderInfoValue>
                  {game.gameLength ? getDurationStr(game.gameLength) : ''}
                </HeaderInfoValue>
              </HeaderInfoItem>
            </>
          ) : null}
        </HeaderInfo>
        <LiveIndicator>Live</LiveIndicator>
      </HeaderArea>
      <TabArea>
        <Tabs activeTab={subPage} onChange={onTabChange}>
          <TabItem value={ResultsSubPage.Summary} text='Summary' />
          <TabItem value={ResultsSubPage.Stats} text='Stats' />
          <TabItem value={ResultsSubPage.BuildOrders} text='Build orders' />
        </Tabs>
      </TabArea>
      {content}
    </Container>
  )
}

const ComingSoonRoot = styled.div`
  /* 34px + 6px from tab = 40px */
  margin-top: 34px;
  padding: 0 24px;
`

function ComingSoonPage() {
  return (
    <ComingSoonRoot>
      <ComingSoon />
    </ComingSoonRoot>
  )
}

const LoadingError = styled.div`
  ${subtitle1};
  width: 100%;
  margin-top: 32px;
  margin-bottom: 48px;
  padding: 0 24px;
`

const ResultsAndMap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 16px;
  max-width: calc(3 * 320px);
  margin-top: 32px;
`

const MapContainer = styled.div`
  width: 320px;
  height: 320px;
  border-radius: 2px;
  box-shadow: ${shadowDef2dp};
`

const PlayerListContainer = styled.div`
  grid-column: 1 / 3;
`

const PlayerListCard = styled(Card)``

function SummaryPage({
  gameId,
  game,
  loadingError,
}: {
  gameId: string
  game?: Immutable<GameRecordJson>
  loadingError?: Error
}) {
  const dispatch = useAppDispatch()

  const mapId = game?.mapId
  const map = useAppSelector(s => (mapId ? s.maps2.byId.get(mapId) : undefined))

  // TODO(tec27): Return this with the game record instead?
  useEffect(() => {
    if (mapId) {
      dispatch(batchGetMapInfo(mapId))
    }
  }, [dispatch, mapId])

  if (loadingError) {
    // TODO(tec27): Handle specific errors, e.g. not found vs server error
    return <LoadingError>There was a problem loading this game.</LoadingError>
  }
  if (!game) {
    return <LoadingDotsArea />
  }

  return (
    <ResultsAndMap>
      <PlayerListContainer>
        <PlayerListCard>
          {game.results?.map(([id, result]) => (
            <PlayerResult key={String(id)} playerName={String(id)} result={result} />
          ))}
        </PlayerListCard>
      </PlayerListContainer>
      <MapContainer>{map ? <MapThumbnail map={map} size={320} /> : null}</MapContainer>
    </ResultsAndMap>
  )
}

const PlayerResultContainer = styled.div`
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
`

const StyledGameResultText = styled(GameResultText)`
  ${headline5};
  ${singleLine};
  width: 80px;
`

const StyledRaceIcon = styled(RaceIcon)`
  width: 40px;
  height: 40px;
`

const PlayerName = styled.div`
  ${headline6};
  ${singleLine};
  margin-left: 16px;
  margin-right: 16px;
  flex-grow: 1;
`

const PlayerApm = styled.div`
  ${subtitle1};
  ${singleLine};
  min-width: 72px;
  color: ${colorTextSecondary};
  text-align: right;
`

export interface PlayerResultProps {
  className?: string
  playerName: string
  result: ReconciledPlayerResult
}

export function PlayerResult({ className, playerName, result }: PlayerResultProps) {
  return (
    <PlayerResultContainer className={className}>
      <StyledGameResultText result={result.result} />
      <StyledRaceIcon race={result.race} />
      <PlayerName>{playerName}</PlayerName>
      <PlayerApm>{result.apm} APM</PlayerApm>
    </PlayerResultContainer>
  )
}

export interface GameResultTextProps {
  className?: string
  result: ReconciledResult
}

const PositiveText = styled.span`
  color: ${colorPositive};
`

const NegativeText = styled.span`
  color: ${colorNegative};
`

export function GameResultText({ className, result }: GameResultTextProps) {
  switch (result) {
    case 'win':
      return <PositiveText className={className}>Win</PositiveText>
    case 'loss':
      return <NegativeText className={className}>Loss</NegativeText>
    case 'draw':
      return <span className={className}>Draw</span>
    case 'unknown':
      return <span className={className}>—</span>
    default:
      return assertUnreachable(result)
  }
}
