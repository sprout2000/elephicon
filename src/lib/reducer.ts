import { State } from './State';
import { Action } from './Action';

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'desktop':
      return { ...state, desktop: action.value };
    case 'drag':
      return { ...state, drag: action.value };
    case 'error':
      return { ...state, error: action.value };
    case 'ico':
      return { ...state, ico: action.value };
    case 'loading':
      return { ...state, loading: action.value };
    case 'message':
      return { ...state, message: action.value };
    case 'success':
      return { ...state, success: action.value };
    default:
      return state;
  }
};
