import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import gameFileReducer from '../features/game/ui/fileselector/gameFileSlice';
import gameControlsReducer from '../features/game/ui/gamecontrols/gameControlsSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        gameFile: gameFileReducer,
        gameControls: gameControlsReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
