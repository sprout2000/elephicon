import { memo } from "react";

import { Elephant } from "./Elephant";
import { LogoApple } from "./LogoApple";
import { LogoWindows } from "./LogoWindows";
import { dragRegion } from "./platform";

type Props = {
  ico: boolean;
  drag: boolean;
  loading: boolean;
  onClickOS: () => void;
  onClickOpen: () => Promise<void>;
};

export const Dropzone = memo((props: Props) => {
  return (
    <section
      className="drop-message-zone"
      aria-label="Drop zone"
      {...dragRegion}
    >
      <button
        type="button"
        aria-label="Open an image"
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
      <div
        className={props.drag || props.loading ? "text loading" : "text"}
        {...dragRegion}
      >
        Drop your images here...
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
