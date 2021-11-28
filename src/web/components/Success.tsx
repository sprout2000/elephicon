import React from 'react';

import { BackButton } from './BackButton';

type Props = {
  message: string;
  desktop: boolean;
  onClickBack: () => void;
  preventDefault: (e: React.DragEvent<HTMLDivElement>) => void;
};

export const Success = (props: Props): JSX.Element => {
  return (
    <div
      className="drop-zone"
      data-testid="drop-zone-success"
      onDrop={props.preventDefault}
      onDragEnter={props.preventDefault}
      onDragOver={props.preventDefault}
      onDragLeave={props.preventDefault}
    >
      <div className="text">Successfully Completed!</div>
      <div className="result" data-testid="result">
        <div className="filename">{props.message}</div>
        was created{' '}
        {props.desktop ? 'on your desktop' : 'in the current folder'}.
      </div>
      <div className="switch">
        <BackButton onClickBack={props.onClickBack} />
      </div>
    </div>
  );
};
