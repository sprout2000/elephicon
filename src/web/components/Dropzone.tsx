import { memo, useContext, useCallback, useEffect } from 'react';
import { AppContext } from '../lib/AppContext';

import { Switch } from './Switch';
import { Elephant } from './Elephant';

const { myAPI } = window;

export const Dropzone = memo(() => {
  const { state, dispatch } = useContext(AppContext);

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const afterConvert = useCallback(
    (result: Result) => {
      dispatch({
        type: 'afterConvert',
        message: true,
        loading: false,
        log: result.log,
        desktop: result.desktop,
        success: result.type === 'failed' ? false : true,
      });
    },
    [dispatch]
  );

  const convert = useCallback(
    async (filepath: string) => {
      const mime = await myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        const format = mime ? mime : 'Unknown';

        dispatch({
          type: 'convert',
          log: `Unsupported format: ${format}`,
          message: true,
          success: false,
          loading: false,
        });

        return;
      }

      if (state.ico) {
        myAPI.mkIco(filepath).then((result) => afterConvert(result));
      } else {
        myAPI.mkIcns(filepath).then((result) => afterConvert(result));
      }
    },
    [afterConvert, dispatch, state.ico]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ type: 'drag', drag: true });
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);
    dispatch({ type: 'drag', drag: false });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (state.loading) return;

    preventDefault(e);
    dispatch({ type: 'drag', drag: false });

    if (e.dataTransfer) {
      dispatch({ type: 'loading', loading: true });
      const file = e.dataTransfer.files[0];

      convert(file.path);
    }
  };

  const onClickOpen = async () => {
    if (state.loading) return;

    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    dispatch({ type: 'loading', loading: true });
    convert(filepath);
  };

  useEffect(() => {
    myAPI.menuOpen((_e, filepath) => {
      if (!filepath) return;

      dispatch({ type: 'loading', loading: true });
      convert(filepath);
    });

    return () => {
      myAPI.removeMenuOpen();
    };
  }, [convert, dispatch]);

  return (
    <div
      className="drop-message-zone"
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div
        onClick={onClickOpen}
        className={
          state.drag
            ? 'elephant-container ondrag'
            : state.loading
            ? 'elephant-container loading'
            : 'elephant-container'
        }
      >
        <Elephant />
      </div>
      <div className={state.drag || state.loading ? 'text loading' : 'text'}>
        Drop your PNGs here...
      </div>
      <Switch />
    </div>
  );
});

Dropzone.displayName = 'Dropzone';
