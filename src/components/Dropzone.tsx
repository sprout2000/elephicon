import React from 'react';

import { Switch } from './Switch';
import { Message } from './Message';
import { Elephant } from './Elephant';

interface Props {
  ico: boolean;
  drag: boolean;
  loading: boolean;
  onClickOS: () => void;
  onClickOpen: () => Promise<void>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
}

export const Dropzone: React.FC<Props> = (props) => {
  return (
    <div
      className="drop-zone"
      onDrop={props.onDrop}
      onDragEnter={props.onDragOver}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}>
      <Elephant
        drag={props.drag}
        loading={props.loading}
        onClick={props.onClickOpen}
      />
      <Message drag={props.drag} loading={props.loading} />
      <Switch
        ico={props.ico}
        loading={props.loading}
        onClickOS={props.onClickOS}
      />
    </div>
  );
};
