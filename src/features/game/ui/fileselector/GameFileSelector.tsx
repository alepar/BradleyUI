import React from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import {clearGameFile, loadFile, selectGameFileState} from "./gameFileSlice";
import {useDispatch, useSelector} from "react-redux";
import Alert from "react-bootstrap/Alert";

const getColor = (props: any) => {
    if (props.isDragAccept) {
        return '#00e676';
    }
    if (props.isDragReject) {
        return '#ff1744';
    }
    if (props.isDragActive) {
        return '#2196f3';
    }
    return '#eeeeee';
}

// https://css-tricks.com/centering-css-complete-guide/
const FullscreenContainer = styled.div`
    height: 100%;
    width: 100%;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 128px;
  left: 50%;
  transform: translate(-50%, -50%);
`

const UploadContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props: any) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  
  height: 50%;
  width: 50%;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export function GameFileSelector() {
    const dispatch = useDispatch();
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        maxFiles: 1,
        onDropAccepted: (acceptedFiles) => {
            dispatch(loadFile(acceptedFiles[0]))
        }
    });

    const gameFileState = useSelector(selectGameFileState);

    if (gameFileState.gameName) {
        return (<Alert variant="success" dismissible onClose={() => dispatch(clearGameFile())}>
            <b>{gameFileState.gameName}: </b>
            {gameFileState.gameData &&
                <span>Turns={gameFileState.gameData.getTurnCount()},
                      Map size={gameFileState.gameData.getMap().getSize().x}x{gameFileState.gameData.getMap().getSize().y}
                </span>
            }
        </Alert>)
    } else {
        return (<FullscreenContainer>
            <IconContainer><img src="favicon.ico" width="64px" height="64px"/></IconContainer>
            <UploadContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                <input {...getInputProps()} />
                <p>Please upload a game replay file...</p>
            </UploadContainer>
        </FullscreenContainer>)
    }
}