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

export const Error: React.FC<Props> = (props) => {
  return (
    <div
      className="drop-zone"
      onDrop={props.onDrop}
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}>
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
    </div>
  );
};
