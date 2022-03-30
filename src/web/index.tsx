import { createRoot } from 'react-dom/client';
import { App } from './App';

const mount = document.getElementById('root');
const root = mount && createRoot(mount);

root?.render(<App />);
