import React from 'react';

import { IoIosUndo } from 'react-icons/io';

interface Props {
  onClick: () => void;
  message: string;
}

export const Success: React.FC<Props> = (props) => {
  return (
    <React.Fragment>
      <div className="text">Successfully Completed!</div>
      <div className="result">
        <div className="filename">{props.message}</div>
        was created in the current folder.
      </div>
      <div className="switch">
        <div className="back-container" onClick={props.onClick}>
          <div className="os">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </React.Fragment>
  );
};
