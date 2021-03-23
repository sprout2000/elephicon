import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from '../src/components/Switch';

describe('Switch component', () => {
  test('render Switch component', () => {
    const onClickOS = jest.fn();

    const { rerender } = render(
      <Switch ico={true} loading={false} onClickOS={onClickOS} />
    );

    expect(screen.getByTestId('ICO')).toBeInTheDocument();
    expect(screen.getByTestId('ICO')).toHaveClass('icon-container');

    expect(screen.getByTestId('ICNS')).toBeInTheDocument();
    expect(screen.getByTestId('ICNS')).toHaveClass('icon-container unchecked');

    userEvent.click(screen.getByTestId('ICO'));
    expect(onClickOS).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('ICNS'));
    expect(screen.getByTestId('ICNS')).toHaveClass('icon-container');
    expect(onClickOS).toBeCalledTimes(2);

    rerender(<Switch ico={false} loading={false} onClickOS={onClickOS} />);
    expect(screen.getByTestId('ICO')).toHaveClass('icon-container unchecked');

    rerender(<Switch ico={false} loading={true} onClickOS={onClickOS} />);
    expect(screen.getByTestId('ICO')).toHaveClass('icon-container loading');
    expect(screen.getByTestId('ICNS')).toHaveClass('icon-container loading');
  });
});
