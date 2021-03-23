import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Message } from '../src/components/Message';

describe('Message component', () => {
  test('render Message', () => {
    const { rerender } = render(<Message drag={false} loading={false} />);
    expect(screen.getByText(/Drop your PNGs here/)).toBeInTheDocument();
    expect(screen.getByTestId('message')).toHaveClass('text');

    rerender(<Message drag={true} loading={false} />);
    expect(screen.getByTestId('message')).toHaveClass('text ondrag');

    rerender(<Message drag={false} loading={true} />);
    expect(screen.getByTestId('message')).toHaveClass('text loading');
  });
});
