import React, { useContext, memo } from 'react';
import { AppContext } from '../lib/AppContext';

export const Message: React.FC = memo(() => {
  const { state } = useContext(AppContext);
  return (
    <div
      data-testid="message"
      className={
        state.drag ? 'text ondrag' : state.loading ? 'text loading' : 'text'
      }>
      Drop your PNGs here...
    </div>
  );
});

Message.displayName = 'Message';
