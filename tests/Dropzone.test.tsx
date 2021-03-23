import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dropzone } from '../src/components/Dropzone';

describe('Dropzone component', () => {
  test('render Dropzone', () => {
    const onClickOS = jest.fn();
    const onDragOver = jest.fn((e: React.DragEvent<HTMLDivElement>) =>
      e.preventDefault()
    );
    const onDragLeave = jest.fn((e: React.DragEvent<HTMLDivElement>) =>
      e.preventDefault()
    );
    const onClickOpen = jest.fn(() => Promise.resolve());
    const onDrop = jest.fn(() => Promise.resolve());

    render(
      <Dropzone
        onClickOS={onClickOS}
        onClickOpen={onClickOpen}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={(e) => onDragLeave(e)}
        ico={true}
        drag={false}
        loading={false}
      />
    );

    userEvent.click(screen.getByTestId('elephant'));
    expect(onClickOpen).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('ICO'));
    expect(onClickOS).toBeCalledTimes(1);
  });
});
