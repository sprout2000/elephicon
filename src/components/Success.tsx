import React from 'react';

import { IoIosUndo } from 'react-icons/io';

interface Props {
  message: string;
  isDesktop: boolean;
  onClick: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Success = (props: Props): JSX.Element => {
  return (
    <div
      className="drop-zone"
      data-testid="drop-zone-success"
      onDrop={props.onDrop}
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}>
      <div className="text">Successfully Completed!</div>
      <div className="result" data-testid="result">
        <div className="filename">{props.message}</div>
        was created{' '}
        {props.isDesktop ? 'on your desktop' : 'in the current folder'}.
      </div>
      <div className="switch">
        <div
          className="back-container"
          data-testid="back-container-success"
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
