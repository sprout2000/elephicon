import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Message } from '../src/components/Message';

describe('Message component', () => {
  test('render Message', () => {
    render(<Message drag={false} loading={false} />);
    expect(screen.getByText(/Drop your PNGs here/)).toBeInTheDocument();
  });
});
