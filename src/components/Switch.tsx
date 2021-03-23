import React from 'react';
import { IoLogoApple, IoLogoWindows } from 'react-icons/io';

interface Props {
  ico: boolean;
  loading: boolean;
  onClickOS: () => void;
}

export const Switch: React.FC<Props> = (props) => {
  return (
    <div className="switch">
      <div
        data-testid="ICO"
        className={
          props.loading
            ? 'icon-container loading'
            : props.ico
            ? 'icon-container'
            : 'icon-container unchecked'
        }
        onClick={props.onClickOS}>
        <div className="os">
          <IoLogoWindows />
        </div>
        <div>ICO</div>
      </div>
      <div
        data-testid="ICNS"
        className={
          props.loading
            ? 'icon-container loading'
            : props.ico
            ? 'icon-container unchecked'
            : 'icon-container'
        }
        onClick={props.onClickOS}>
        <div className="os">
          <IoLogoApple />
        </div>
        <div>ICNS</div>
      </div>
    </div>
  );
};
