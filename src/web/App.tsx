import { useState, useEffect, useCallback } from 'react';

import { Message } from './Message';
import { Dropzone } from './Dropzone';

import 'typeface-roboto';
import './App.scss';

const { myAPI } = window;

export const App = () => {
  const [log, setLog] = useState('');
  const [ico, setIco] = useState(true);
  const [drag, setDrag] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [message, setMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const afterConvert = (result: Result) => {
    result.type === 'failed' ? setSuccess(false) : setSuccess(true);

    setMessage(true);
    setLoading(false);
    setLog(result.log);
    setDesktop(result.desktop);
  };

  const convert = useCallback(
    async (filepath: string): Promise<void> => {
      const mime = await myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        setLoading(false);

        const format = mime ? mime : 'Unknown';
        setLog(`Unsupported format: ${format}`);

        setMessage(true);
        setSuccess(false);

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

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (loading) return;

    preventDefault(e);
    setDrag(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);
    setDrag(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (loading) return;

    preventDefault(e);
    setDrag(false);

    if (e.dataTransfer) {
      setLoading(true);
      const file = e.dataTransfer.files[0];

      await convert(file.path);
    }
  };

  const onClickOS = () => {
    if (loading) return;

    setIco(!ico);
  };

  const onClickOpen = async () => {
    if (loading) return;

    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    setLoading(true);
    await convert(filepath);
  };

  const onClickBack = () => {
    setLog('');
    setDrag(false);
    setMessage(false);
    setSuccess(false);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    myAPI.contextMenu();
  };

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
    myAPI.setDesktop((_e, arg) => setDesktop(arg));

    return (): void => {
      myAPI.removeSetDesktop();
    };
  }, []);

  return (
    <div className="container" onContextMenu={onContextMenu}>
      {!message ? (
        <Dropzone
          ico={ico}
          drag={drag}
          loading={loading}
          onDrop={onDrop}
          onClickOS={onClickOS}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClickOpen={onClickOpen}
        />
      ) : (
        <Message
          log={log}
          success={success}
          desktop={desktop}
          onClickBack={onClickBack}
          preventDefault={preventDefault}
        />
      )}
    </div>
  );
};
