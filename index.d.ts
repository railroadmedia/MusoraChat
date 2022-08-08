import React from 'react';
import numberOfStreamWatchers from './src/watchersListener';

declare module "MusoraChat" {
  interface ChatProps {
    appColor: string;
    chatId: string;
    clientId: string;
    isDark: boolean;
    onRemoveAllMessages: (userId: string) => void;
    onToggleBlockStudent: (blockedUser: {banned: boolean; id: userId}) => void;
    questionsId: string;
    user: {
      id: string;
      gsToken: string;
    }
  }
  class MusoraChat extends React.Component<ChatProps, {}> {}

  export { MusoraChat, numberOfStreamWatchers };
}
