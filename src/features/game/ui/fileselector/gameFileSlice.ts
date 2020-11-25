import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from '../../../../app/store';
import {PixiGameData} from "../../state/PixiGameData";
import {GameData} from "../../../../protots/bradleyinterface_pb";
import {ProtobufBackedUIGameData} from "../../state/ProtobufGameData";

interface GameFileState {
    gameName?: string
    gameData?: PixiGameData
}

const initialState: GameFileState = {
};

export const gameFileSlice = createSlice({
    name: 'gameFile',
    initialState,
    reducers: {
        setGameName: (state, action: PayloadAction<string>) => {
            state.gameName = action.payload;
        },
        setGameData: (state, action: PayloadAction<PixiGameData>) => {
            state.gameData = action.payload;
        },
        clearGameFile: state => {
            state.gameName = undefined
            state.gameData = undefined
        }
    },
});

export const { setGameName, setGameData, clearGameFile } = gameFileSlice.actions;

export const loadFile = (file: File): AppThunk => dispatch => {
    dispatch(setGameName(file.name))
    file.arrayBuffer()
        .catch(reason => {throw new Error("Could not read file: " + reason)})
        .then(buf => {
            const pbGameData = GameData.deserializeBinary(new Uint8Array(buf));
            const gameData = new ProtobufBackedUIGameData(pbGameData)
            dispatch(setGameData(gameData))
        })
};

export const selectGameFileState = (state: RootState) => state.gameFile;
export const selectGameData = (state: RootState) => state.gameFile.gameData;

export default gameFileSlice.reducer;
