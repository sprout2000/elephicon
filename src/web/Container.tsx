import { useContext, useEffect } from 'react';
import { AppContext } from './lib/AppContext';

import { Message } from './Message';
import { Dropzone } from './Dropzone';

const { myAPI } = window;

export const Container = () => {
  const { state, dispatch } = useContext(AppContext);

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    myAPI.contextMenu();
  };

  useEffect(() => {
    myAPI.setDesktop((_e, arg) => dispatch({ type: 'desktop', desktop: arg }));

    return (): void => {
      myAPI.removeSetDesktop();
    };
  }, [dispatch]);

  return (
    <div className="container" onContextMenu={onContextMenu}>
      {!state.message ? <Dropzone /> : <Message />}
    </div>
  );
};
