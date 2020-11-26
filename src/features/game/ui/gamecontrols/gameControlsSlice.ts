import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../../app/store';

export enum PlayMode {
    PLAY, PAUSE
}

export interface DisplayOptions {
    showGrid: boolean,
    lockCamera: boolean,
    showTrail: boolean,
}
export interface DisplayOptionsChange {
    showGrid?: boolean,
    lockCamera?: boolean,
    showTrail?: boolean,
}

export interface PlayState {
    playMode: PlayMode
    currentTurn: number
}

export interface GameControlsState extends PlayState {
    playSpeed: number,
    displayOptions: DisplayOptions
}

const initialState: GameControlsState = {
    playMode: PlayMode.PLAY,
    currentTurn: 0,
    playSpeed: 1.0,
    displayOptions: {
        showGrid: true,
        lockCamera: false,
        showTrail: false,
    },
};

export const gameControlsSlice = createSlice({
    name: 'gameControls',
    initialState,
    reducers: {
        setPlayState: (state, action: PayloadAction<PlayState>) => {
            state.playMode = action.payload.playMode;
            state.currentTurn = action.payload.currentTurn;
        },
        setPlaySpeed: (state, action: PayloadAction<number>) => {
            state.playSpeed = action.payload;
        },
        setDisplayOptions: (state, action: PayloadAction<DisplayOptionsChange>) => {
            state.displayOptions = {...state.displayOptions, ...action.payload};
        },
        resetControls: (state) => {
            state.playMode = initialState.playMode
            state.currentTurn = initialState.currentTurn
        }
    },
});

export const { setPlayState, setPlaySpeed, setDisplayOptions, resetControls } = gameControlsSlice.actions;

export const selectGameControlsState = (state: RootState) => state.gameControls;

export default gameControlsSlice.reducer;
