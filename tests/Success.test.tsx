import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Success } from '../src/components/Success';

describe('Success component', () => {
  test('render Succes component', () => {
    const onClick = jest.fn();
    const preventDefault = jest.fn((e: React.DragEvent<HTMLDivElement>) =>
      e.preventDefault()
    );

    render(
      <Success
        isDesktop={true}
        message="test"
        onClick={onClick}
        onDragEnter={preventDefault}
        onDragLeave={preventDefault}
        onDragOver={preventDefault}
        onDrop={preventDefault}
      />
    );

    const text = screen.getByTestId('drop-zone-success').firstChild;
    expect(text).toHaveTextContent(/Successfully Completed!/);

    expect(screen.getByTestId('result')).toHaveTextContent(/on your desktop/);

    userEvent.click(screen.getByTestId('back-container-success'));
    expect(onClick).toBeCalledTimes(1);
  });
});
