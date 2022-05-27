declare type Action =
  | { type: 'log'; log: string }
  | { type: 'ico'; ico: boolean }
  | { type: 'drag'; drag: boolean }
  | { type: 'desktop'; desktop: boolean }
  | { type: 'message'; message: boolean }
  | { type: 'loading'; loading: boolean }
  | { type: 'success'; success: boolean };
