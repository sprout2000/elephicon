import React from 'react';

import { IoIosUndo } from 'react-icons/io';

interface Props {
  onClick: () => void;
  message: string;
}

export const Error: React.FC<Props> = (props) => {
  return (
    <React.Fragment>
      <div className="text">Something went wrong...</div>
      <div className="error">{props.message}</div>
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
