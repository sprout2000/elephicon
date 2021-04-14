import React, { useContext } from 'react';

import { AppContext } from './App';
import { preventDefault } from '../lib/preventDefault';

import { IoIosUndo } from 'react-icons/io';

export const Error: React.FC = () => {
  const { state, onClickBack } = useContext(AppContext);

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
        <div
          className="back-container"
          data-testid="back-container"
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
