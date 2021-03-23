import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Error } from '../src/components/Error';

describe('Error component', () => {
  test('render Error component', () => {
    const onClick = jest.fn();
    const preventDefault = jest.fn((e: React.DragEvent<HTMLDivElement>) =>
      e.preventDefault()
    );

    render(
      <Error
        message="error"
        onClick={onClick}
        onDragEnter={preventDefault}
        onDragLeave={preventDefault}
        onDragOver={preventDefault}
        onDrop={preventDefault}
      />
    );

    const text = screen.getByTestId('drop-zone').firstChild;
    expect(text).toHaveTextContent(/Something went wrong.../i);

    userEvent.click(screen.getByTestId('back-container'));
    expect(onClick).toBeCalledTimes(1);
  });
});
