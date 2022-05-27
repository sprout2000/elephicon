export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'log':
      return { ...state, log: action.log };
    case 'ico':
      return { ...state, ico: action.ico };
    case 'drag':
      return { ...state, drag: action.drag };
    case 'desktop':
      return { ...state, desktop: action.desktop };
    case 'loading':
      return { ...state, loading: action.loading };
    case 'message':
      return { ...state, message: action.message };
    case 'success':
      return { ...state, success: action.success };
    default:
      return state;
  }
};
