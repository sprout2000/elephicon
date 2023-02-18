import { useCallback, useEffect, useReducer } from 'react';

import { Message } from './Message';
import { Dropzone } from './Dropzone';

import 'typeface-roboto';
import './App.scss';

type State = {
  log: string;
  ico: boolean;
  drag: boolean;
  desktop: boolean;
  loading: boolean;
  result: Result['type'];
};

const reducer = (state: State, newState: Partial<State>) => ({
  ...state,
  ...newState,
});

const initialState: State = {
  log: '',
  ico: true,
  drag: false,
  desktop: true,
  loading: false,
  result: null,
};

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const preventDefault = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const afterConvert = (result: Result) => {
    dispatch({
      result: 'success',
      loading: false,
      log: result.log,
      desktop: result.desktop,
    });
  };

  const convert = useCallback(
    async (filepath: string) => {
      const mime = await window.myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        const format = mime ? mime : 'Unknown';

        dispatch({
          log: `Unsupported format: ${format}`,
          result: 'failed',
          loading: false,
        });

        return;
      }

      if (state.ico) {
        window.myAPI.mkIco(filepath).then((result) => afterConvert(result));
      } else {
        window.myAPI.mkIcns(filepath).then((result) => afterConvert(result));
      }
    },
    [state.ico]
  );

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.myAPI.contextMenu();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ drag: true });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);
    dispatch({ drag: false });
  };

  const hanleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ drag: false });

    if (e.dataTransfer) {
      dispatch({ loading: true });
      const file = e.dataTransfer.files[0];
      convert(file.path);
    }
  };

  const handleClickOS = () => {
    if (state.loading) return;
    dispatch({ ico: !state.ico });
  };

  const handleClickOpen = async () => {
    if (state.loading) return;

    const filepath = await window.myAPI.openDialog();
    if (!filepath) return;

    dispatch({ loading: true });
    convert(filepath);
  };

  const handleClickBack = () => {
    dispatch({ drag: false, result: null, log: '' });
  };

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
    <div className="container" onContextMenu={handleContextMenu}>
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
