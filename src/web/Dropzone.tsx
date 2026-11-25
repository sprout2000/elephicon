import { memo } from "react";

import { Elephant } from "./Elephant";
import { LogoApple } from "./LogoApple";
import { LogoWindows } from "./LogoWindows";

type Props = {
  ico: boolean;
  drag: boolean;
  loading: boolean;
  onClickOS: () => void;
  onClickOpen: () => Promise<void>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
};

export const Dropzone = memo((props: Props) => {
  return (
    <section
      className="drop-message-zone"
      aria-label="Drop zone"
      onDrop={props.onDrop}
      onDragEnter={props.onDragOver}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
    >
      <button
        type="button"
        aria-label="Open a PNG file"
        onClick={props.onClickOpen}
        className={
          props.drag
            ? "elephant ondrag"
            : props.loading
              ? "elephant loading"
              : "elephant"
        }
      >
        <Elephant />
      </button>
      <div className={props.drag || props.loading ? "text loading" : "text"}>
        Drop your PNGs here...
      </div>
      <div className="switch">
        <button
          type="button"
          aria-pressed={props.ico}
          className={
            props.loading || props.drag
              ? "icon-container loading"
              : props.ico
                ? "icon-container"
                : "icon-container unchecked"
          }
          onClick={props.onClickOS}
        >
          <div className="icon windows">
            <LogoWindows />
          </div>
          <div>ICO</div>
        </button>
        <button
          type="button"
          aria-pressed={!props.ico}
          className={
            props.loading || props.drag
              ? "icon-container loading"
              : props.ico
                ? "icon-container unchecked"
                : "icon-container"
          }
          onClick={props.onClickOS}
        >
          <div className="icon apple">
            <LogoApple />
          </div>
          <div>ICNS</div>
        </button>
      </div>
    </section>
  );
});

Dropzone.displayName = "Dropzone";
