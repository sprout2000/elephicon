import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BsArrowRepeat } from 'react-icons/bs';

import Logo from './logo';
import 'typeface-roboto';
import './styles.scss';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [onDrag, setOnDrag] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDarwin = async (): Promise<boolean> => {
    return ipcRenderer.invoke('platform');
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
      const result = await ipcRenderer.invoke('dropped-file', file.path);

      if (result) setLoading(false);
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
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
