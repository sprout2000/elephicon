import React, { useState, useEffect, useCallback } from 'react';

import {
  IoLogoApple,
  IoLogoWindows,
  IoIosCloseCircleOutline,
} from 'react-icons/io';

import { Success } from './Success';
import { Elephant } from './Elephant';
import { Error } from './Error';

interface Result {
  type: string;
  msg: string;
}

const { ipcRenderer } = window;

const App: React.FC = () => {
  const [onDrag, setOnDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [onError, setOnError] = useState(false);
  const [message, setMessage] = useState('');

  const afterConvert = (result: Result): void => {
    if (result.type === 'failed') {
      setLoading(false);
      setOnError(true);
      setMessage(result.msg);

      return;
    } else {
      setLoading(false);
      setSuccess(true);
      setMessage(result.msg);

      return;
    }
  };

  const convert = useCallback(
    async (filepath: string): Promise<void> => {
      const mime: string | false = await ipcRenderer.invoke(
        'mime-check',
        filepath
      );

      if (!mime || !mime.match(/png/)) {
        setLoading(false);

        const message = mime ? mime : 'Unknown';
        setMessage(`Invalid Format: ${message}`);
        setOnError(true);

        return;
      }

      if (checked) {
        const result: Result = await ipcRenderer.invoke('make-icns', filepath);
        afterConvert(result);
      } else {
        const result: Result = await ipcRenderer.invoke('make-ico', filepath);
        afterConvert(result);
      }
    },
    [checked]
  );

  const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setOnDrag(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setOnDrag(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    preventDefault(e);
    setOnDrag(false);

    if (e.dataTransfer) {
      setLoading(true);
      const file = e.dataTransfer.files[0];

      await convert(file.path);
    }
  };

  const onClickOpen = async (): Promise<void> => {
    const filepath = await ipcRenderer.invoke('open-file-dialog');

    if (!filepath) return;

    setLoading(true);
    await convert(filepath);
  };

  const onClickOS = () => {
    if (loading) return;

    setChecked(!checked);
  };

  const onClickClose = () => {
    ipcRenderer.send('close-window');
  };

  const onClickBack = () => {
    setSuccess(false);
    setOnError(false);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (loading) return;

    e.preventDefault();
    ipcRenderer.send('open-contextmenu');
  };

  const onStart = useCallback(
    async (_e: Event, filepath: string): Promise<void> => {
      setLoading(true);
      await convert(filepath);
    },
    [convert]
  );

  useEffect(() => {
    ipcRenderer.on('dropped', onStart);

    return (): void => {
      ipcRenderer.removeAllListeners('dropped');
    };
  }, [onStart]);

  useEffect(() => {
    ipcRenderer.on('menu-open', async (_e, filepath) => {
      if (!filepath) return;

      setLoading(true);
      await convert(filepath);
    });

    return (): void => {
      ipcRenderer.removeAllListeners('menu-open');
    };
  }, [convert]);

  useEffect(() => {
    ipcRenderer.send('change-state', checked);
  }, [checked]);

  useEffect(() => {
    ipcRenderer.once('set-state', (_e, arg) => setChecked(arg));

    return (): void => {
      ipcRenderer.removeAllListeners('set-state');
    };
  }, []);

  return (
    <div
      className="container"
      onContextMenu={onContextMenu}
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}>
      <div className="dragzone">
        <div className="close-button" title="Close" onClick={onClickClose}>
          <IoIosCloseCircleOutline size="2em" />
        </div>
      </div>
      {!success && !onError ? (
        <React.Fragment>
          <div className="icon">
            <Elephant onDrag={onDrag} loading={loading} onClick={onClickOpen} />
          </div>
          <div
            className={
              onDrag ? 'text ondrag' : loading ? 'text loading' : 'text'
            }>
            Drop your PNGs here...
          </div>
          <div className="switch">
            <div
              className={
                loading
                  ? 'icon-container loading'
                  : checked
                  ? 'icon-container checked'
                  : 'icon-container'
              }
              onClick={onClickOS}>
              <div className="os">
                <IoLogoWindows />
              </div>
              <div>ICO</div>
            </div>
            <div
              className={
                loading
                  ? 'icon-container loading'
                  : checked
                  ? 'icon-container'
                  : 'icon-container checked'
              }
              onClick={onClickOS}>
              <div className="os">
                <IoLogoApple />
              </div>
              <div>ICNS</div>
            </div>
          </div>
        </React.Fragment>
      ) : success ? (
        <Success onClick={onClickBack} message={message} />
      ) : (
        <Error onClick={onClickBack} message={message} />
      )}
    </div>
  );
};

export default App;
