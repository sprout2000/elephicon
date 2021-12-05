import { IoIosUndo } from 'react-icons/io';

type Props = {
  log: string;
  success: boolean;
  desktop: boolean;
  onClickBack: () => void;
  preventDefault: (e: React.DragEvent<HTMLDivElement>) => void;
};

export const Message = (props: Props): JSX.Element => {
  return (
    <div
      className="drop-zone"
      data-testid="drop-zone"
      onDrop={props.preventDefault}
      onDragEnter={props.preventDefault}
      onDragOver={props.preventDefault}
      onDragLeave={props.preventDefault}
    >
      <div className="text">
        {props.success ? 'Successfully Completed!' : 'Something went wrong...'}
      </div>
      {props.success ? (
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
        <div
          className="back-container"
          data-testid="back-container-success"
          onClick={props.onClickBack}
        >
          <div className="icon">
            <IoIosUndo />
          </div>
          <div>Back</div>
        </div>
      </div>
    </div>
  );
};
