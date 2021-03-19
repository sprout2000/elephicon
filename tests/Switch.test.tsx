import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from '../src/components/Switch';

describe('Switch component', () => {
  test('render Switch component', () => {
    const onClickOS = jest.fn();

    render(<Switch ico={true} loading={false} onClickOS={onClickOS} />);

    expect(screen.getByTestId('ICO')).toBeInTheDocument();
    expect(screen.getByTestId('ICNS')).toBeInTheDocument();

    userEvent.click(screen.getByTestId('ICO'));
    expect(onClickOS).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('ICNS'));
    expect(onClickOS).toBeCalledTimes(2);
  });
});
