import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppStateProvider } from "./contexts/AppStateContext";
import { SpeechProvider } from "./contexts/SpeechContext";
import { DictionaryProvider } from "./contexts/DictionaryContext";
import { EventHandlersProvider } from "./contexts/EventHandlersContext";
import { DictationProvider } from "./contexts/DictationContext";
import { RecitationProvider } from "./contexts/RecitationContext";
import { AppRouter } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <SpeechProvider>
        <DictionaryProvider>
          <DictationProvider>
            <RecitationProvider>
              <EventHandlersProvider>
                <AppRouter />
              </EventHandlersProvider>
            </RecitationProvider>
          </DictationProvider>
        </DictionaryProvider>
      </SpeechProvider>
    </AppStateProvider>
  </StrictMode>
);
