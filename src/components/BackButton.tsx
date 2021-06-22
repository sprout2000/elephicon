import { useContext, memo } from 'react';

import { AppContext } from '../lib/AppContext';

import { IoIosUndo } from 'react-icons/io';

export const BackButton = memo(() => {
  const { onClickBack } = useContext(AppContext);

  return (
    <div
      className="back-container"
      data-testid="back-container-success"
      onClick={onClickBack}>
      <div className="os">
        <IoIosUndo />
      </div>
      <div>Back</div>
    </div>
  );
});

BackButton.displayName = 'BackButton';
