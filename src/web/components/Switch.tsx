import { memo, useContext } from 'react';
import { AppContext } from '../lib/AppContext';

import { Apple } from './icons/Apple';
import { Windows } from './icons/Windows';

export const Switch = memo(() => {
  const { state, dispatch } = useContext(AppContext);

  const onClickOS = () => {
    if (state.loading) return;
    dispatch({ type: 'ico', ico: !state.ico });
  };

  return (
    <div className="switch">
      <div
        className={
          state.loading || state.drag
            ? 'icon-container loading'
            : state.ico
            ? 'icon-container'
            : 'icon-container unchecked'
        }
        onClick={onClickOS}
      >
        <div className="icon windows">
          <Windows />
        </div>
        <div>ICO</div>
      </div>
      <div
        className={
          state.loading || state.drag
            ? 'icon-container loading'
            : state.ico
            ? 'icon-container unchecked'
            : 'icon-container'
        }
        onClick={onClickOS}
      >
        <div className="icon apple">
          <Apple />
        </div>
        <div>ICNS</div>
      </div>
    </div>
  );
});

Switch.displayName = 'Switch';
