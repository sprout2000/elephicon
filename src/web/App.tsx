import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { api, type MenuNode } from "./api";
import { ContextMenu } from "./ContextMenu";
import { Dropzone } from "./Dropzone";
import { Message } from "./Message";
import { dragRegion, isDarwin, isLinux } from "./platform";

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

type OpenMenu = { items: MenuNode[]; x: number; y: number };

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // The context menu drawn in the window on Linux
  const [menu, setMenu] = useState<OpenMenu | null>(null);

  // The Tauri listeners are registered once, so they read the latest state
  // from this ref.
  const stateRef = useRef(state);
  stateRef.current = state;

  const convert = useCallback(async (filepath: string) => {
    dispatch({ loading: true, drag: false });

    const error = await api.checkImage(filepath).catch((reason) => `${reason}`);
    if (error) {
      dispatch({ log: error, result: "failed", loading: false });
      return;
    }

    try {
      const result = stateRef.current.ico
        ? await api.makeIco(filepath)
        : await api.makeIcns(filepath);

      dispatch({
        result: "success",
        loading: false,
        log: result.log,
        desktop: result.desktop,
      });
    } catch (reason) {
      dispatch({ log: `${reason}`, result: "failed", loading: false });
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const { clientX: x, clientY: y } = e;
    if (!isLinux) {
      api.contextMenu(x, y);
      return;
    }

    api
      .getContextMenu()
      .then((items) => setMenu({ items, x, y }))
      .catch(() => setMenu(null));
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  const selectMenuItem = useCallback((id: string) => {
    setMenu(null);
    api.runMenuAction(id);
  }, []);

  const handleClickOS = useCallback(() => {
    if (state.loading) return;
    dispatch({ ico: !state.ico });
  }, [state.loading, state.ico]);

  const openFile = useCallback(async () => {
    if (stateRef.current.loading) return;

    const filepath = await api.openDialog();
    if (!filepath) return;

    convert(filepath);
  }, [convert]);

  const handleClickBack = useCallback(() => {
    dispatch({ drag: false, result: null, log: "" });
  }, []);

  useEffect(() => {
    // Files dropped on the result screen or while converting are ignored.
    const isBusy = () =>
      stateRef.current.loading || stateRef.current.result !== null;

    const listeners = [
      api.onMenuOpen((filepath) => {
        if (!filepath || stateRef.current.loading) return;
        convert(filepath);
      }),
      api.onDragDrop({
        onEnter: () => {
          if (!isBusy()) dispatch({ drag: true });
        },
        onLeave: () => dispatch({ drag: false }),
        onDrop: (filepath) => {
          if (!isBusy()) convert(filepath);
        },
      }),
    ];

    return () => {
      for (const listener of listeners) {
        listener.then((unlisten) => unlisten());
      }
    };
  }, [convert]);

  useEffect(() => {
    // Windows and Linux have no menu bar, so Ctrl+O is handled here. On macOS
    // the app menu handles Cmd+O.
    if (isDarwin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "o"
      ) {
        e.preventDefault();
        openFile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openFile]);

  return (
    <main
      className="container"
      onContextMenu={handleContextMenu}
      {...dragRegion}
    >
      {!state.result ? (
        <Dropzone
          ico={state.ico}
          drag={state.drag}
          loading={state.loading}
          onClickOS={handleClickOS}
          onClickOpen={openFile}
        />
      ) : (
        <Message
          log={state.log}
          result={state.result}
          desktop={state.desktop}
          onClickBack={handleClickBack}
        />
      )}
      {menu && (
        <ContextMenu
          items={menu.items}
          x={menu.x}
          y={menu.y}
          onSelect={selectMenuItem}
          onClose={closeMenu}
        />
      )}
    </main>
  );
};
