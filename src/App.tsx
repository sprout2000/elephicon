import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

import { Elephant } from './Elephant';
import {
  IoIosCloseCircleOutline,
  IoLogoApple,
  IoLogoWindows,
} from 'react-icons/io';

import 'typeface-roboto';
import './styles.scss';

interface Result {
  type: string;
  msg: string;
}

const { ipcRenderer } = window;

const App: React.FC = () => {
  const [onDrag, setOnDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const afterConvert = async (result: Result): Promise<void> => {
    if (result.type === 'failed') {
      setLoading(false);
      await ipcRenderer.invoke('error-dialog', `Something went wrong...`);

      return;
    } else {
      setLoading(false);
      await ipcRenderer.invoke('success-dialog', result.msg);

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
        await ipcRenderer.invoke('error-dialog', `Invalid Format: ${message}`);

        return;
      }

      if (checked) {
        const result: Result = await ipcRenderer.invoke('make-icns', filepath);
        await afterConvert(result);
      } else {
        const result: Result = await ipcRenderer.invoke('make-ico', filepath);
        await afterConvert(result);
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

  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setOnDrag(false);

    if (e.dataTransfer) {
      setLoading(true);
      const file = e.dataTransfer.files[0];

      convert(file.path);
    }
  };

  const onClickOpen = async (): Promise<void> => {
    const filepath = await ipcRenderer.invoke('open-file-dialog');

    if (!filepath) return;

    setLoading(true);
    convert(filepath);
  };

  const onClickOS = () => {
    if (loading) return;

    setChecked(!checked);
  };

  const onClickClose = () => {
    ipcRenderer.send('close-window');
  };

  const onStart = useCallback(
    (_e: Event, filepath: string): void => {
      setLoading(true);
      convert(filepath);
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
    ipcRenderer.on('menu-open', (_e, filepath) => {
      if (!filepath) return;

      setLoading(true);
      convert(filepath);
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
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}>
      <div className="dragzone">
        <div className="close-button" title="Close" onClick={onClickClose}>
          <IoIosCloseCircleOutline size="2em" />
        </div>
      </div>
      <div className="icon">
        <Elephant onDrag={onDrag} loading={loading} onClick={onClickOpen} />
      </div>
      <div
        className={onDrag ? 'text ondrag' : loading ? 'text loading' : 'text'}>
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
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
