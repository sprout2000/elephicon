import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Switch from 'react-switch';
import { BsArrowRepeat } from 'react-icons/bs';

import Logo from './logo';
import 'typeface-roboto';
import './styles.scss';

interface Result {
  type: string;
  msg: string;
}

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [onDrag, setOnDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);

  const isDarwin = async (): Promise<boolean> => {
    return ipcRenderer.invoke('platform');
  };

  const onClick = (): void => {
    setChecked(!checked);
  };

  const onChange = (check: boolean): void => {
    setChecked(check);
  };

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

      const mime: string | false = await ipcRenderer.invoke(
        'mime-check',
        file.path
      );

      if (!mime || !mime.match(/png/)) {
        setLoading(false);

        const message = mime ? mime : 'Unknown';
        await ipcRenderer.invoke('mime-error', message);

        return;
      }

      if (checked) {
        const result: Result = await ipcRenderer.invoke('make-icns', file.path);

        if (result.type === 'failed') {
          setLoading(false);
          await ipcRenderer.invoke('error', result.msg);
        } else {
          setLoading(false);
          await ipcRenderer.invoke('success', result.msg);
        }
      } else {
        const result: Result = await ipcRenderer.invoke('make-ico', file.path);

        if (result.type === 'failed') {
          setLoading(false);
          await ipcRenderer.invoke('error', result.msg);
        } else {
          setLoading(false);
          await ipcRenderer.invoke('success', result.msg);
        }
      }
    }
  };

  return (
    <div
      className="container"
      onDrop={onDrop}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}>
      {isDarwin && <div className="drag-zone"></div>}
      {loading ? (
        <div className="loading">
          <BsArrowRepeat size={64} className="spinner" />
        </div>
      ) : (
        <div className={onDrag ? 'initial drag' : 'initial'}>
          <Logo />
          <div className="message">
            Drop a <span>PNG</span> file here...
          </div>
          <div className="mode">
            <span onClick={onClick} className={checked ? '' : 'checked'}>
              ICO
            </span>
            <Switch
              onChange={onChange}
              checked={checked}
              checkedIcon={false}
              uncheckedIcon={false}
              height={14}
              width={28}
              onColor="#6b6e7b"
              offColor="#6b6e7b"
              className="switch"
            />
            <span onClick={onClick} className={checked ? 'checked' : ''}>
              ICNS
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
