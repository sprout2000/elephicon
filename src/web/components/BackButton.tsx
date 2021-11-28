import React from 'react';
import { IoIosUndo } from 'react-icons/io';

type Props = {
  onClickBack: () => void;
};

export const BackButton = (props: Props) => {
  return (
    <div
      className="back-container"
      data-testid="back-container-success"
      onClick={props.onClickBack}
    >
      <div className="os">
        <IoIosUndo />
      </div>
      <div>Back</div>
    </div>
  );
};
