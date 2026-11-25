import { memo } from "react";

import { ArrowUndo } from "./ArrowUndo";

type Props = {
  log: string;
  desktop: boolean;
  result: Result["type"];
  onClickBack: () => void;
};

export const Message = memo((props: Props) => {
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section
      className="drop-message-zone"
      aria-label="Result"
      onDrop={preventDefault}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
    >
      <div className="text">
        {props.result === "success"
          ? "Successfully Completed!"
          : "Something went wrong..."}
      </div>
      {props.result === "success" ? (
        <div className="result">
          <div className="filename">{props.log}</div>
          was created
          {props.desktop ? " on your desktop" : " in the current folder"}.
        </div>
      ) : (
        <div className="result">
          <div className="error">{props.log}</div>
        </div>
      )}
      <div className="switch">
        <button
          type="button"
          className="back-container"
          onClick={props.onClickBack}
        >
          <div className="icon undo">
            <ArrowUndo />
          </div>
          <div>Back</div>
        </button>
      </div>
    </section>
  );
});

Message.displayName = "Message";
