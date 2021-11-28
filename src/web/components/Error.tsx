import React from 'react';

import { BackButton } from './BackButton';

type Props = {
  message: string;
  onClickBack: () => void;
  preventDefault: (e: React.DragEvent<HTMLDivElement>) => void;
};

export const Error = (props: Props): JSX.Element => {
  return (
    <div
      className="drop-zone"
      data-testid="drop-zone"
      onDrop={props.preventDefault}
      onDragEnter={props.preventDefault}
      onDragOver={props.preventDefault}
      onDragLeave={props.preventDefault}
    >
      <div className="text">Something went wrong...</div>
      <div className="error">{props.message}</div>
      <div className="switch">
        <BackButton onClickBack={props.onClickBack} />
      </div>
    </div>
  );
};
