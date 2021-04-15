import { createContext, Dispatch } from 'react';

import { State } from './State';
import { Action } from './Action';

export const AppContext = createContext(
  {} as {
    state: State;
    dispatch: Dispatch<Action>;
    convert: (filepath: string) => Promise<void>;
    onClickBack: () => void;
  }
);
