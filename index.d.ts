import React from 'react';
import numberOfStreamWatchers from './src/watchersListener';
import { Resource } from 'RNDownload';

declare module "MusoraChat" {
  interface ChatProps {
    appColor: string;
    chatId: string;
    clientId: string;
    isDark: boolean;
    onRemoveAllMessages: (userId: string) => void;
    onToggleBlockStudent: (blockedUser: {banned: boolean; id: number}) => void;
    questionsId: string;
    user: {
      id: string;
      gsToken: string;
    }
    resources: Resource[];
    onResourcesPress: (resource: Resource) => void;
    isLandscape: boolean;
  }
  class MusoraChat extends React.Component<ChatProps, {}> {}

  export { MusoraChat, numberOfStreamWatchers };
}
