import { memo } from "react";

import { ArrowUndo } from "./ArrowUndo";
import { dragRegion } from "./platform";

type Props = {
  log: string;
  desktop: boolean;
  result: Result["type"];
  onClickBack: () => void;
};

export const Message = memo((props: Props) => {
  return (
    <section className="drop-message-zone" aria-label="Result" {...dragRegion}>
      <div className="text" {...dragRegion}>
        {props.result === "success"
          ? "Successfully Completed!"
          : "Something went wrong..."}
      </div>
      {props.result === "success" ? (
        <div className="result" {...dragRegion}>
          <div className="filename">{props.log}</div>
          was created
          {props.desktop ? " on your desktop" : " in the current folder"}.
        </div>
      ) : (
        <div className="result" {...dragRegion}>
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
