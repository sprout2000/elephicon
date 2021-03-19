import React from 'react';

import { IoIosUndo } from 'react-icons/io';

interface Props {
  message: string;
  onClick: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Error: React.FC<Props> = (props) => {
  return (
    <div
      className="drop-zone"
      data-testid="drop-zone"
      onDrop={props.onDrop}
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}>
      <div className="text">Something went wrong...</div>
      <div className="error">{props.message}</div>
      <div className="switch">
        <div
          className="back-container"
          data-testid="back-container"
          onClick={props.onClick}>
          <div className="os">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
};
