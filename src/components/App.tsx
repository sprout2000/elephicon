import React, { useState, useEffect, useCallback } from 'react';
import UAParser from 'ua-parser-js';

import { Error } from './Error';
import { Success } from './Success';
import { Dropzone } from './Dropzone';

import { Result } from '../lib/Result';

const { myAPI } = window;

export const App: React.FC = () => {
  const [ico, setIco] = useState(true);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const isDarwin = () => {
    const ua = new UAParser();
    return ua.getOS().name === 'Mac OS';
  };

  const afterConvert = (result: Result): void => {
    if (result.type === 'failed') {
      setError(true);
    } else {
      setSuccess(true);
    }

    setLoading(false);
    setMessage(result.msg);
    setDesktop(result.desktop);
  };

  const convert = useCallback(
    async (filepath: string): Promise<void> => {
      const mime = await myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        setLoading(false);

        const message = mime ? mime : 'Unknown';
        setMessage(`Invalid Format: ${message}`);
        setError(true);

        return;
      }

      if (ico) {
        const result = await myAPI.mkIco(filepath);
        afterConvert(result);
      } else {
        const result = await myAPI.mkIcns(filepath);
        afterConvert(result);
      }
    },
    [ico]
  );

  const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    if (loading) return;

    preventDefault(e);
    setDrag(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setDrag(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    if (loading) return;

    preventDefault(e);
    setDrag(false);

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

    setIco(!ico);
  };

  const onClickBack = () => {
    setSuccess(false);
    setError(false);
  };

  useEffect(() => {
    myAPI.onDrop(
      async (_e: Event, filepath: string): Promise<void> => {
        setLoading(true);
        await convert(filepath);
      }
    );

    return (): void => {
      myAPI.removeOnDrop();
    };
  }, [convert]);

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
    myAPI.changeICO(ico);
  }, [ico]);

  useEffect(() => {
    myAPI.setICO((_e, arg) => setIco(arg));

    return (): void => {
      myAPI.removeSetICO();
    };
  }, []);

  useEffect(() => {
    myAPI.setDesktop((_e, arg) => setDesktop(arg));

    return (): void => {
      myAPI.removeDesktop();
    };
  }, []);

  return (
    <div className={isDarwin() ? 'container_darwin' : 'container'}>
      {!success && !error ? (
        <Dropzone
          ico={ico}
          drag={drag}
          loading={loading}
          onClickOS={onClickOS}
          onClickOpen={onClickOpen}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        />
      ) : success ? (
        <Success
          onClick={onClickBack}
          message={message}
          isDesktop={desktop}
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
