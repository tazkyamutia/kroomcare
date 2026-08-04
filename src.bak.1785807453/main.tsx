import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UserProvider } from './context/UserContext.tsx';
import { LanguageThemeProvider } from './context/LanguageThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageThemeProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </LanguageThemeProvider>
  </StrictMode>,
);
