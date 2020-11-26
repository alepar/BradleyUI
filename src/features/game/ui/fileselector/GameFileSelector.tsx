import React from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import {loadFile} from "./gameFileSlice";
import {useDispatch} from "react-redux";

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
  
  height: 25%;
  width: 50%;
  opacity: 0.85;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Background = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;

  background-image: url("bgnd.gif");
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.75;
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

    return (<div>
        <Background/>
        <IconContainer><img src="favicon.ico" width="64px" height="64px" alt="Bradley Hero"/></IconContainer>
        <UploadContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
            <input {...getInputProps()} />
            <p>Please upload a game replay file...</p>
        </UploadContainer>
    </div>)
}