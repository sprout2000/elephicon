import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Elephant } from '../src/components/Elephant';

describe('Elephant component', () => {
  test('render Elephant component', () => {
    const onClick = jest.fn();

    const { rerender } = render(
      <Elephant onDrag={false} onClick={onClick} loading={false} />
    );

    expect(screen.getByTestId('elephant')).toHaveClass('elephant');

    rerender(<Elephant onDrag={true} onClick={onClick} loading={false} />);
    expect(screen.getByTestId('elephant')).toHaveClass('elephant', 'ondrag');

    rerender(<Elephant onDrag={false} onClick={onClick} loading={true} />);
    expect(screen.getByTestId('elephant')).toHaveClass('elephant', 'loading');

    userEvent.click(screen.getByTestId('elephant'));
    expect(onClick).toBeCalledTimes(1);
  });
});
