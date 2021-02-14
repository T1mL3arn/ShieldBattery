import { Immutable } from 'immer'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { assertUnreachable } from '../../common/assert-unreachable'
import { GameClientPlayerResult, GameClientResult } from '../../common/games/results'
import { MapInfoJson } from '../../common/maps'
import { ComingSoon } from '../coming-soon/coming-soon'
import { RaceIcon } from '../lobbies/race-icon'
import { MapThumbnail } from '../maps/map-thumbnail'
import Card from '../material/card'
import { shadowDef2dp } from '../material/shadow-constants'
import { TabItem, Tabs } from '../material/tabs'
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
import { ResultsSubPage } from './results-sub-page'

const Container = styled.div`
  max-width: 960px;
  padding: 24px 12px;
`

const TabArea = styled.div`
  width: 100%;
  max-width: 720px;
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

export interface ConnectedGameResultsPageProps {
  gameId: string
  subPage?: ResultsSubPage
}

export function ConnectedGameResultsPage({ gameId, subPage }: ConnectedGameResultsPageProps) {
  const onTabChange = useCallback(
    (tab: ResultsSubPage) => {
      // FIXME real thing!
      console.log(`changing tab: ${gameId}/${tab}`)
    },
    [gameId],
  )

  // FIXME pull real things from reducers
  return (
    <GameResults
      subPage={subPage}
      onTabChange={onTabChange}
      map={undefined as any}
      result={undefined as any}
      gameDuration={7}
    />
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

export interface GameResultsProps {
  className?: string
  subPage?: ResultsSubPage
  onTabChange: (tab: ResultsSubPage) => void
  map: Immutable<MapInfoJson>
  result: Map<string, GameClientPlayerResult>
  gameDuration: number
}

export function GameResults({
  className,
  subPage = ResultsSubPage.Summary,
  onTabChange,
  map,
  result,
  gameDuration,
}: GameResultsProps) {
  let content: React.ReactNode
  switch (subPage) {
    case ResultsSubPage.Summary:
      content = <SummaryPage map={map} result={result} gameDuration={gameDuration} />
      break

    case ResultsSubPage.Stats:
    case ResultsSubPage.BuildOrders:
      content = <ComingSoonPage />
      break

    default:
      content = assertUnreachable(subPage)
  }

  return (
    <Container className={className}>
      <HeaderArea>
        <Headline3>Victory!</Headline3>
        <HeaderInfo>
          <HeaderInfoItem>
            <HeaderInfoLabel>Type</HeaderInfoLabel>
            <HeaderInfoValue>Ranked 1v1</HeaderInfoValue>
          </HeaderInfoItem>
          <HeaderInfoItem>
            <HeaderInfoLabel>Time</HeaderInfoLabel>
            <HeaderInfoValue>{getDurationStr(gameDuration)}</HeaderInfoValue>
          </HeaderInfoItem>
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
  map,
  result,
  gameDuration,
}: {
  map: Immutable<MapInfoJson>
  result: Map<string, GameClientPlayerResult>
  gameDuration: number
}) {
  return (
    <ResultsAndMap>
      <PlayerListContainer>
        <PlayerListCard>
          {Array.from(result.entries()).map(([name, result]) => (
            <PlayerResult playerName={name} result={result} />
          ))}
        </PlayerListCard>
      </PlayerListContainer>
      <MapContainer>
        <MapThumbnail map={map} size={320} />
      </MapContainer>
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
  result: GameClientPlayerResult
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
  result: GameClientResult
}

const PositiveText = styled.span`
  color: ${colorPositive};
`

const NegativeText = styled.span`
  color: ${colorNegative};
`

export function GameResultText({ className, result }: GameResultTextProps) {
  switch (result) {
    case GameClientResult.Defeat:
    case GameClientResult.Disconnected:
      return <NegativeText className={className}>Loss</NegativeText>
    case GameClientResult.Playing:
      return <span className={className}>—</span>
    case GameClientResult.Victory:
      return <PositiveText className={className}>Win</PositiveText>
    default:
      return assertUnreachable(result)
  }
}
