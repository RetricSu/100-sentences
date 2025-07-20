import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AppStateProvider } from './contexts/AppStateContext'
import { SpeechProvider } from './contexts/SpeechContext'
import { DictionaryProvider } from './contexts/DictionaryContext'
import { EventHandlersProvider } from './contexts/EventHandlersContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <SpeechProvider>
        <DictionaryProvider>
          <EventHandlersProvider>
            <App />
          </EventHandlersProvider>
        </DictionaryProvider>
      </SpeechProvider>
    </AppStateProvider>
  </StrictMode>,
)
