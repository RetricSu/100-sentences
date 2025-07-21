import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AppStateProvider } from './contexts/AppStateContext'
import { SpeechProvider } from './contexts/SpeechContext'
import { DictionaryProvider } from './contexts/DictionaryContext'
import { EventHandlersProvider } from './contexts/EventHandlersContext'
import { DictationProvider } from './contexts/DictationContext'
import { RecitationProvider } from './contexts/RecitationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <SpeechProvider>
        <DictionaryProvider>
          <DictationProvider>
            <RecitationProvider>
              <EventHandlersProvider>
                <App />
              </EventHandlersProvider>
            </RecitationProvider>
          </DictationProvider>
        </DictionaryProvider>
      </SpeechProvider>
    </AppStateProvider>
  </StrictMode>,
)
