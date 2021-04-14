import React, { useContext } from 'react';

import { AppContext } from './App';
import { preventDefault } from '../lib/preventDefault';

import { IoIosUndo } from 'react-icons/io';

export const Success: React.FC = () => {
  const { state, onClickBack } = useContext(AppContext);

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
        <div
          className="back-container"
          data-testid="back-container-success"
          onClick={onClickBack}>
          <div className="os">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
};
