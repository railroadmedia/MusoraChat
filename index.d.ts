import React from 'react';
import numberOfStreamWatchers from './src/watchersListener';

declare module "MusoraChat" {
  interface ChatProps {
    appColor: string;
    chatId: string;
    clientId: string;
    isDark: boolean;
    onRemoveAllMessages: () => void;
    onToggleBlockStudent: () => void;
    questionsId: string;
    user: {
      id: string;
      gsToken: string;
    }
  }
  class Chat extends React.Component<ChatProps, {}> {}

  export default { MusoraChat: Chat, numberOfStreamWatchers };
}
