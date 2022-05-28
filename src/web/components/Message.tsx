import { memo, useContext } from 'react';
import { AppContext } from '../lib/AppContext';

import { IoIosUndo } from 'react-icons/io';

export const Message = memo(() => {
  const { state, dispatch } = useContext(AppContext);

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onClickBack = () => {
    dispatch({ type: 'log', log: '' });
    dispatch({ type: 'drag', drag: false });
    dispatch({ type: 'message', message: false });
    dispatch({ type: 'success', success: false });
  };

  return (
    <div
      className="drop-message-zone"
      onDrop={preventDefault}
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}
    >
      <div className="text">
        {state.success ? 'Successfully Completed!' : 'Something went wrong...'}
      </div>
      {state.success ? (
        <div className="result">
          <div className="filename">{state.log}</div>
          was created
          {state.desktop ? ' on your desktop' : ' in the current folder'}.
        </div>
      ) : (
        <div className="result">
          <div className="error">{state.log}</div>
        </div>
      )}
      <div className="switch">
        <div className="back-container" onClick={onClickBack}>
          <div className="icon">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'Message';
