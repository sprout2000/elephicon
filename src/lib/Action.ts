export type Action =
  | {
      type: 'desktop';
      value: boolean;
    }
  | {
      type: 'drag';
      value: boolean;
    }
  | {
      type: 'error';
      value: boolean;
    }
  | {
      type: 'ico';
      value: boolean;
    }
  | {
      type: 'loading';
      value: boolean;
    }
  | {
      type: 'message';
      value: string;
    }
  | {
      type: 'success';
      value: boolean;
    };
