import React, { useState, useEffect, useCallback } from 'react';
import { UAParser } from 'ua-parser-js';

import {
  IoLogoApple,
  IoLogoWindows,
  IoIosCloseCircleOutline,
} from 'react-icons/io';

import { Success } from './Success';
import { Elephant } from './Elephant';
import { Error } from './Error';
import { Result } from '../result';

const { myAPI } = window;

const App: React.FC = () => {
  const [onDrag, setOnDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [onError, setOnError] = useState(false);
  const [message, setMessage] = useState('');

  const isDarwin = () => {
    const ua = new UAParser();
    return ua.getOS().name === 'Mac OS';
  };

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
      const mime = await myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        setLoading(false);

        const message = mime ? mime : 'Unknown';
        setMessage(`Invalid Format: ${message}`);
        setOnError(true);

        return;
      }

      if (checked) {
        const result = await myAPI.mkIcns(filepath);
        afterConvert(result);
      } else {
        const result = await myAPI.mkIco(filepath);
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
    if (loading) return;

    preventDefault(e);
    setOnDrag(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setOnDrag(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    if (loading) return;

    preventDefault(e);
    setOnDrag(false);

    if (e.dataTransfer) {
      setLoading(true);
      const file = e.dataTransfer.files[0];

      await convert(file.path);
    }
  };

  const onClickOpen = async (): Promise<void> => {
    if (loading) return;

    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    setLoading(true);
    await convert(filepath);
  };

  const onClickOS = () => {
    if (loading) return;

    setChecked(!checked);
  };

  const onClickClose = () => {
    myAPI.closeWindow();
  };

  const onClickBack = () => {
    setSuccess(false);
    setOnError(false);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (loading) return;

    e.preventDefault();
    myAPI.openContextMenu();
  };

  const onStart = useCallback(
    async (_e: Event, filepath: string): Promise<void> => {
      setLoading(true);
      await convert(filepath);
    },
    [convert]
  );

  useEffect(() => {
    myAPI.onDrop(onStart);

    return (): void => {
      myAPI.removeOnDrop();
    };
  }, [onStart]);

  useEffect(() => {
    myAPI.menuOpen(async (_e, filepath) => {
      if (!filepath) return;

      setLoading(true);
      await convert(filepath);
    });

    return (): void => {
      myAPI.removeMenuOpen();
    };
  }, [convert]);

  useEffect(() => {
    myAPI.changeState(checked);
  }, [checked]);

  useEffect(() => {
    myAPI.setState((_e, arg) => setChecked(arg));

    return (): void => {
      myAPI.removeSetState();
    };
  }, []);

  return (
    <div
      className={isDarwin() ? 'container_darwin' : 'container'}
      onContextMenu={onContextMenu}>
      {isDarwin() && (
        <div className="close-button" title="Close" onClick={onClickClose}>
          <IoIosCloseCircleOutline size="2em" />
        </div>
      )}
      {!success && !onError ? (
        <div
          className="drop-zone"
          onDrop={onDrop}
          onDragEnter={onDragOver}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}>
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
        </div>
      ) : success ? (
        <Success
          onClick={onClickBack}
          message={message}
          onDrop={preventDefault}
          onDragEnter={preventDefault}
          onDragOver={preventDefault}
          onDragLeave={preventDefault}
        />
      ) : (
        <Error
          onClick={onClickBack}
          message={message}
          onDrop={preventDefault}
          onDragEnter={preventDefault}
          onDragOver={preventDefault}
          onDragLeave={preventDefault}
        />
      )}
    </div>
  );
};

export default App;
