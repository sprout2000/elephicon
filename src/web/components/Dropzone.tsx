import React, { useContext } from 'react';

import { AppContext } from '../../lib/AppContext';
import { preventDefault } from '../../lib/preventDefault';

import { Switch } from './Switch';
import { Message } from './Message';
import { Elephant } from './Elephant';

export const Dropzone = (): JSX.Element => {
  const { state, dispatch, convert } = useContext(AppContext);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ type: 'drag', value: true });
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    dispatch({ type: 'drag', value: false });
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ type: 'drag', value: false });

    if (e.dataTransfer) {
      dispatch({ type: 'loading', value: true });
      const file = e.dataTransfer.files[0];

      await convert(file.path);
    }
  };

  return (
    <div
      className="drop-zone"
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <Elephant />
      <Message />
      <Switch />
    </div>
  );
};
