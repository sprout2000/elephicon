import { useReducer } from 'react';

import { Container } from './Container';

import { reducer } from '../lib/reducer';
import { AppContext } from '../lib/AppContext';

import 'typeface-roboto';
import './App.scss';

const initialState: State = {
  log: '',
  ico: true,
  drag: false,
  desktop: true,
  message: false,
  loading: false,
  success: false,
};

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Container />
    </AppContext.Provider>
  );
};
