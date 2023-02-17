import { memo } from 'react';

import { ArrowUndo } from './ArrowUndo';

type Props = {
  log: string;
  desktop: boolean;
  status: Result['type'];
  onClickBack: () => void;
};

export const Message = memo((props: Props) => {
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
        {props.status === 'success'
          ? 'Successfully Completed!'
          : 'Something went wrong...'}
      </div>
      {props.status === 'success' ? (
        <div className="result">
          <div className="filename">{props.log}</div>
          was created
          {props.desktop ? ' on your desktop' : ' in the current folder'}.
        </div>
      ) : (
        <div className="result">
          <div className="error">{props.log}</div>
        </div>
      )}
      <div className="switch">
        <div className="back-container" onClick={props.onClickBack}>
          <div className="icon undo">
            <ArrowUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'Message';
