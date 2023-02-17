import { useCallback, useEffect, useState } from 'react';

import { Message } from './Message';
import { Dropzone } from './Dropzone';

import 'typeface-roboto';
import './App.scss';

export const App = () => {
  const [log, setLog] = useState('');
  const [ico, setIco] = useState(true);
  const [drag, setDrag] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Result['type']>(null);

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const afterConvert = useCallback((result: Result) => {
    setStatus('success');
    setLoading(false);
    setLog(result.log);
    setDesktop(result.desktop);
  }, []);

  const convert = useCallback(
    async (filepath: string) => {
      const mime = await window.myAPI.mimecheck(filepath);

      if (!mime || !mime.match(/png/)) {
        const format = mime ? mime : 'Unknown';

        setLog(`Unsupported format: ${format}`);
        setStatus('failed');
        setLoading(false);

        return;
      }

      if (ico) {
        window.myAPI.mkIco(filepath).then((result) => afterConvert(result));
      } else {
        window.myAPI.mkIcns(filepath).then((result) => afterConvert(result));
      }
    },
    [ico, afterConvert]
  );

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.myAPI.contextMenu();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (loading) return;

    preventDefault(e);
    setDrag(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);
    setDrag(false);
  };

  const hanleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (loading) return;

    preventDefault(e);
    setDrag(false);

    if (e.dataTransfer) {
      setLoading(true);
      const file = e.dataTransfer.files[0];
      convert(file.path);
    }
  };

  const handleClickOS = () => {
    if (loading) return;
    setIco(!ico);
  };

  const handleClickOpen = async () => {
    if (loading) return;

    const filepath = await window.myAPI.openDialog();
    if (!filepath) return;

    setLoading(true);
    convert(filepath);
  };

  const handleClickBack = () => {
    setDrag(false);
    setStatus(null);
  };

  useEffect(() => {
    window.myAPI.menuOpen((_e, filepath) => {
      if (!filepath) return;

      setLoading(true);
      convert(filepath);
    });

    return () => {
      window.myAPI.removeMenuOpen();
    };
  }, [convert]);

  useEffect(() => {
    window.myAPI.setDesktop((_e, arg) => setDesktop(arg));

    return (): void => {
      window.myAPI.removeSetDesktop();
    };
  }, []);

  return (
    <div className="container" onContextMenu={handleContextMenu}>
      {!status ? (
        <Dropzone
          ico={ico}
          drag={drag}
          loading={loading}
          onDrop={hanleDrop}
          onClickOS={handleClickOS}
          onDragOver={handleDragOver}
          onClickOpen={handleClickOpen}
          onDragLeave={handleDragLeave}
        />
      ) : (
        <Message
          log={log}
          status={status}
          desktop={desktop}
          onClickBack={handleClickBack}
        />
      )}
    </div>
  );
};
