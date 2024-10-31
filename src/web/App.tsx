import { useCallback, useEffect, useReducer } from "react";

import { Dropzone } from "./Dropzone";
import { Message } from "./Message";

import "typeface-roboto";
import "./App.scss";

type State = {
  log: string;
  ico: boolean;
  drag: boolean;
  desktop: boolean;
  loading: boolean;
  result: Result["type"];
};

const reducer = (state: State, newState: Partial<State>) => ({
  ...state,
  ...newState,
});

const initialState: State = {
  log: "",
  ico: true,
  drag: false,
  result: null,
  desktop: true,
  loading: false,
};

const isDarwin = navigator.userAgentData.platform === "macOS";

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const preventDefault = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const afterConvert = useCallback((result: Result) => {
    dispatch({
      result: "success",
      loading: false,
      log: result.log,
      desktop: result.desktop,
    });
  }, []);

  const convert = useCallback(
    async (filepath: string) => {
      const mime = await window.myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        const format = mime || "Unknown";

        dispatch({
          log: `Unsupported format: ${format}`,
          result: "failed",
          loading: false,
        });

        return;
      }

      if (state.ico) {
        window.myAPI
          .mkIco(filepath)
          .then((result) => afterConvert(result))
          .catch((reason) => {
            dispatch({ log: `${reason}`, result: "failed", loading: false });
          });
      } else {
        window.myAPI
          .mkIcns(filepath)
          .then((result) => afterConvert(result))
          .catch((reason) => {
            dispatch({ log: `${reason}`, result: "failed", loading: false });
          });
      }
    },
    [state.ico, afterConvert],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      window.myAPI.contextMenu();
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (state.loading) return;

      preventDefault(e);
      dispatch({ drag: true });
    },
    [state.loading, preventDefault],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      preventDefault(e);
      dispatch({ drag: false });
    },
    [preventDefault],
  );

  const hanleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (state.loading) return;

      preventDefault(e);
      dispatch({ drag: false });

      if (e.dataTransfer) {
        dispatch({ loading: true });
        const filepath = window.myAPI.getFilePath(e.dataTransfer.files[0]);
        convert(filepath);
      }
    },
    [state.loading, preventDefault, convert],
  );

  const handleClickOS = useCallback(() => {
    if (state.loading) return;
    dispatch({ ico: !state.ico });
  }, [state.loading, state.ico]);

  const handleClickOpen = useCallback(async () => {
    if (state.loading) return;

    const filepath = await window.myAPI.openDialog();
    if (!filepath) return;

    dispatch({ loading: true });
    convert(filepath);
  }, [state.loading, convert]);

  const handleClickBack = useCallback(() => {
    dispatch({ drag: false, result: null, log: "" });
  }, []);

  useEffect(() => {
    const unlistenFn = window.myAPI.menuOpen((_e, filepath) => {
      if (!filepath) return;

      dispatch({ loading: true });
      convert(filepath);
    });

    return () => {
      unlistenFn();
    };
  }, [convert]);

  useEffect(() => {
    const unlistenFn = window.myAPI.setDesktop((_e, arg) => {
      dispatch({ desktop: arg });
    });

    return (): void => {
      unlistenFn();
    };
  }, []);

  return (
    <div
      className={isDarwin ? "container drag-region" : "container"}
      onContextMenu={handleContextMenu}
    >
      {!state.result ? (
        <Dropzone
          ico={state.ico}
          drag={state.drag}
          loading={state.loading}
          onDrop={hanleDrop}
          onClickOS={handleClickOS}
          onDragOver={handleDragOver}
          onClickOpen={handleClickOpen}
          onDragLeave={handleDragLeave}
        />
      ) : (
        <Message
          log={state.log}
          result={state.result}
          desktop={state.desktop}
          onClickBack={handleClickBack}
        />
      )}
    </div>
  );
};
