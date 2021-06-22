import { useContext, memo } from 'react';
import { AppContext } from '../lib/AppContext';

export const Message = memo(() => {
  const { state } = useContext(AppContext);

  const getMessageClass = () => {
    if (state.drag) {
      return 'text ondrag';
    }
    return state.loading ? 'text loading' : 'text';
  };

  return (
    <div data-testid="message" className={getMessageClass()}>
      Drop your PNGs here...
    </div>
  );
});

Message.displayName = 'Message';
