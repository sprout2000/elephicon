export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ico':
      return { ...state, ico: action.ico };
    case 'drag':
      return { ...state, drag: action.drag };
    case 'loading':
      return { ...state, loading: action.loading };
    case 'desktop':
      return { ...state, desktop: action.desktop };
    case 'afterConvert':
      return {
        ...state,
        log: action.log,
        success: action.success,
        message: action.message,
        loading: action.loading,
        desktop: action.desktop,
      };
    case 'convert':
      return {
        ...state,
        log: action.log,
        message: action.message,
        success: action.success,
        loading: action.loading,
      };
    case 'onClickBack':
      return {
        ...state,
        log: action.log,
        drag: action.drag,
        message: action.message,
        success: action.success,
      };
    default:
      return state;
  }
};
