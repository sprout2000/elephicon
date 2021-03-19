import React from 'react';

interface Props {
  drag: boolean;
  loading: boolean;
}

export const Message: React.FC<Props> = ({ drag, loading }) => {
  return (
    <div className={drag ? 'text ondrag' : loading ? 'text loading' : 'text'}>
      Drop your PNGs here...
    </div>
  );
};
