import React from 'react';
import {clearGameFile, selectGameFileState} from "./fileselector/gameFileSlice";
import {useDispatch, useSelector} from "react-redux";
import {GameFileSelector} from "./fileselector/GameFileSelector";
import * as Icon from 'react-bootstrap-icons';
import {Button, ButtonGroup, Card, Table, Form, CardGroup, CardColumns} from "react-bootstrap";
import styled from 'styled-components';
import ReactSlider from "react-slider";

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

    const dispatch = useDispatch();

    if (!gameName) {
        return <GameFileSelector/>
    }

    if (!gameData) {
        return (<div>Loading game data...</div>)
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
                    <Card.Text>
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
                    </Card.Text>
                    <Card.Link href="#" onClick={() => dispatch(clearGameFile())}>Close replay</Card.Link>
                </Card.Body>
            </Card>
            {/*<Card>
                <Card.Header>Replay Controls</Card.Header>
                <Card.Body>
                    <Card.Text>
                        <StyledSlider
                            value={0}
                            max={gameData.getTurnCount()-1}
                            renderTrack={Track}
                            renderThumb={Thumb}
                        />
                        <ButtonGroup>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.SkipBackward size={iconSize}/></Button>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.SkipStart size={iconSize}/></Button>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.Stop size={iconSize}/></Button>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.Play size={iconSize}/></Button>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.SkipEnd size={iconSize}/></Button>
                            <Button variant={buttonVariant} size={buttonSize}><Icon.SkipForward size={iconSize}/></Button>
                        </ButtonGroup>
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>Display options</Card.Header>
                <Card.Body>
                    <Card.Text>
                        <Form>
                            <Form.Check type={"checkbox"} label={"Show Grid"} />
                            <Form.Check type={"checkbox"} label={"Lock Camera"} />
                            <Form.Check type={"checkbox"} label={"Show Trail"} />
                        </Form>
                    </Card.Text>
                </Card.Body>
            </Card>*/}
        </div>
    )
}
