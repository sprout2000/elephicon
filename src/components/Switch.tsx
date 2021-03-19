import React from 'react';
import { IoLogoApple, IoLogoWindows } from 'react-icons/io';

interface Props {
  ico: boolean;
  loading: boolean;
  onClickOS: () => void;
}

export const Switch: React.FC<Props> = ({ ico, loading, onClickOS }) => {
  return (
    <div className="switch">
      <div
        className={
          loading
            ? 'icon-container loading'
            : ico
            ? 'icon-container'
            : 'icon-container checked'
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
            : ico
            ? 'icon-container checked'
            : 'icon-container'
        }
        onClick={onClickOS}>
        <div className="os">
          <IoLogoApple />
        </div>
        <div>ICNS</div>
      </div>
    </div>
  );
};
