import React from 'react';

import { Switch } from './Switch';
import { Message } from './Message';
import { Elephant } from './Elephant';

interface Props {
  ico: boolean;
  drag: boolean;
  loading: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  onClickOS: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClickOpen: () => Promise<void>;
}

export const Dropzone: React.FC<Props> = ({
  ico,
  drag,
  loading,
  onDrop,
  onClickOS,
  onDragOver,
  onDragLeave,
  onClickOpen,
}) => {
  return (
    <div
      className="drop-zone"
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}>
      <Elephant drag={drag} loading={loading} onClick={onClickOpen} />
      <Message drag={drag} loading={loading} />
      <Switch ico={ico} loading={loading} onClickOS={onClickOS} />
    </div>
  );
};
