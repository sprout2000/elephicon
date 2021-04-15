import { createContext } from 'react';

import { Action } from './Action';
import { State } from './State';

export const AppContext = createContext(
  {} as {
    state: State;
    dispatch: React.Dispatch<Action>;
    convert: (filepath: string) => Promise<void>;
    onClickBack: () => void;
  }
);
