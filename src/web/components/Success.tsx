import React, { useContext } from 'react';

import { AppContext } from '../../lib/AppContext';
import { preventDefault } from '../../lib/preventDefault';

import { BackButton } from './BackButton';

export const Success = (): JSX.Element => {
  const { state } = useContext(AppContext);

  return (
    <div
      className="drop-zone"
      data-testid="drop-zone-success"
      onDrop={preventDefault}
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}>
      <div className="text">Successfully Completed!</div>
      <div className="result" data-testid="result">
        <div className="filename">{state.message}</div>
        was created{' '}
        {state.desktop ? 'on your desktop' : 'in the current folder'}.
      </div>
      <div className="switch">
        <BackButton />
      </div>
    </div>
  );
};
