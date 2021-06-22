import { useContext } from 'react';

import { AppContext } from '../lib/AppContext';
import { preventDefault } from '../lib/preventDefault';

import { BackButton } from './BackButton';

export const Error = (): JSX.Element => {
  const { state } = useContext(AppContext);

  return (
    <div
      className="drop-zone"
      data-testid="drop-zone"
      onDrop={preventDefault}
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}>
      <div className="text">Something went wrong...</div>
      <div className="error">{state.message}</div>
      <div className="switch">
        <BackButton />
      </div>
    </div>
  );
};
