import React from 'react';

interface Props {
  drag: boolean;
  loading: boolean;
}

export const Message: React.FC<Props> = (props) => {
  return (
    <div
      className={
        props.drag ? 'text ondrag' : props.loading ? 'text loading' : 'text'
      }>
      Drop your PNGs here...
    </div>
  );
};
