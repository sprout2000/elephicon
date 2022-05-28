declare type Action =
  | { type: 'ico'; ico: boolean }
  | { type: 'drag'; drag: boolean }
  | { type: 'desktop'; desktop: boolean }
  | { type: 'loading'; loading: boolean }
  | {
      type: 'afterConvert';
      log: string;
      success: boolean;
      message: boolean;
      loading: boolean;
      desktop: boolean;
    }
  | {
      type: 'convert';
      log: string;
      message: boolean;
      success: boolean;
      loading: boolean;
    }
  | {
      type: 'onClickBack';
      log: string;
      drag: boolean;
      message: boolean;
      success: boolean;
    };
