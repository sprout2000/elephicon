import React from 'react';

interface Props {
  drag: boolean;
  loading: boolean;
}

export const Message = (props: Props): JSX.Element => {
  return (
    <div
      data-testid="message"
      className={
        props.drag ? 'text ondrag' : props.loading ? 'text loading' : 'text'
      }>
      Drop your PNGs here...
    </div>
  );
};
