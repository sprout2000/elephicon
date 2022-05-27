import { useReducer } from 'react';

import { Container } from './Container';

import { reducer } from './lib/reducer';
import { AppContext } from './lib/AppContext';
import { initialState } from './lib/initialState';

import 'typeface-roboto';
import './App.scss';

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Container />
    </AppContext.Provider>
  );
};
