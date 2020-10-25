import React from 'react';

import { IoIosUndo } from 'react-icons/io';

interface Props {
  onClick: () => void;
  message: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Success: React.FC<Props> = (props) => {
  return (
    <div
      className="drop-zone"
      onDrop={props.onDrop}
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}>
      <div className="text">Successfully Completed!</div>
      <div className="result">
        <div className="filename">{props.message}</div>
        was created on your desktop.
      </div>
      <div className="switch">
        <div className="back-container" onClick={props.onClick}>
          <div className="os">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
};
