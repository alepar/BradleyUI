import React from 'react';
import {clearGameFile, selectGameFileState} from "../fileselector/gameFileSlice";
import {useDispatch, useSelector} from "react-redux";
import {GameFileSelector} from "../fileselector/GameFileSelector";
import * as Icon from 'react-bootstrap-icons';
import {Button, ButtonGroup, Card, Form, Table} from "react-bootstrap";
import styled from 'styled-components';
import ReactSlider from "react-slider";
import {PlayMode, selectGameControlsState, setDisplayOptions, setPlayState} from "./gameControlsSlice";

const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 25px;
    margin-bottom: 8px;
`;

const StyledThumb = styled.div`
    height: 25px;
    line-height: 25px;
    width: 40px;
    text-align: center;
    font-size: 12px;
    background-color: #000;
    color: #fff;
    border-radius: 35%;
    cursor: grab;
`;

const Thumb = (props: any, state: any) => <StyledThumb {...props}>{state.valueNow}</StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${(props: any) => props.index === 0 ? '#0f0' : '#ddd'};
    border-radius: 999px;
`;

const Track = (props: any, state: any) => <StyledTrack {...props} index={state.index} />;

export const GameControls = function() {
    const gameFile = useSelector(selectGameFileState);
    const gameName = gameFile.gameName;
    const gameData = gameFile.gameData;

    const controls = useSelector(selectGameControlsState)
    const dispatch = useDispatch();

    if (!gameName) {
        return <GameFileSelector/>
    }

    if (!gameData) {
        return (<div>Loading...</div>)
    }

    const buttonSize = "sm"
    const buttonVariant = "outline-primary"
    const iconSize = 32

    return (
        <div id="controls">
            <Card>
                <Card.Header>Game info</Card.Header>
                <Card.Body>
                    <Card.Title>{gameName}</Card.Title>
                    <Table>
                        <tbody>
                        <tr>
                            <td>Map size: </td>
                            <td>{gameData.getMap().getSize().x}x{gameData.getMap().getSize().y}</td>
                        </tr>
                        <tr>
                            <td>Total turns: </td>
                            <td>{gameData.getTurnCount()}</td>
                        </tr>
                        </tbody>
                    </Table>
                    <Card.Link href="#" onClick={() => dispatch(clearGameFile())}>Close replay</Card.Link>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>Replay Controls</Card.Header>
                <Card.Body>
                    <StyledSlider
                        value={controls.currentTurn}
                        max={gameData.getTurnCount()-1}
                        renderTrack={Track}
                        renderThumb={Thumb}
                        onChange={value => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: value as number}))}
                    />
                    <ButtonGroup>
                        <Button variant={buttonVariant} size={buttonSize}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: 0}))}>
                            <Icon.SkipBackward size={iconSize}/>
                        </Button>
                        <Button variant={buttonVariant} size={buttonSize}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: Math.max(0, controls.currentTurn-1)}))}>
                            <Icon.SkipStart size={iconSize}/>
                        </Button>

                        <Button variant={buttonVariant} size={buttonSize}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: controls.currentTurn}))}>
                            <Icon.Pause size={iconSize}/>
                        </Button>
                        <Button variant={buttonVariant} size={buttonSize} active={controls.playMode === PlayMode.PLAY}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PLAY, currentTurn: controls.currentTurn}))}>
                            <Icon.Play size={iconSize}/>
                        </Button>

                        <Button variant={buttonVariant} size={buttonSize}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: Math.min(gameData.getTurnCount()-1, controls.currentTurn+1)}))}>
                            <Icon.SkipEnd size={iconSize}/>
                        </Button>
                        <Button variant={buttonVariant} size={buttonSize}
                                onClick={() => dispatch(setPlayState({playMode: PlayMode.PAUSE, currentTurn: gameData.getTurnCount()-1}))}>
                            <Icon.SkipForward size={iconSize}/>
                        </Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>Display options</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Check type={"checkbox"} label={"Show Grid"} checked={controls.displayOptions.showGrid}
                                    onChange={(e) => dispatch(setDisplayOptions({showGrid: (e.target as any).checked}))}/>
{/*
                        <Form.Check type={"checkbox"} label={"Lock Camera"} checked={controls.displayOptions.lockCamera} disabled />
                        <Form.Check type={"checkbox"} label={"Show Trail"} checked={controls.displayOptions.showTrail} disabled />
*/}
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}
