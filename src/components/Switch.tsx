import React, { useContext, memo } from 'react';
import { AppContext } from '../lib/AppContext';

import { IoLogoApple, IoLogoWindows } from 'react-icons/io';

export const Switch: React.FC = memo(() => {
  const { state, dispatch } = useContext(AppContext);

  const onClickOS = () => {
    if (state.loading) return;

    dispatch({ type: 'ico', value: !state.ico });
  };

  return (
    <div className="switch">
      <div
        data-testid="ICO"
        className={
          state.loading
            ? 'icon-container loading'
            : state.ico
            ? 'icon-container'
            : 'icon-container unchecked'
        }
        onClick={onClickOS}>
        <div className="os">
          <IoLogoWindows />
        </div>
        <div>ICO</div>
      </div>
      <div
        data-testid="ICNS"
        className={
          state.loading
            ? 'icon-container loading'
            : state.ico
            ? 'icon-container unchecked'
            : 'icon-container'
        }
        onClick={onClickOS}>
        <div className="os">
          <IoLogoApple />
        </div>
        <div>ICNS</div>
      </div>
    </div>
  );
});

Switch.displayName = 'Switch';
