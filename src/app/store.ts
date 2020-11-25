import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import gameFileReducer from '../features/game/ui/fileselector/gameFileSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    gameFile: gameFileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
