import React from 'react';
import numberOfStreamWatchers from './src/watchersListener';
import { Resource } from 'RNDownload';
import { MusoraChat } from './src/MusoraChat';

declare module 'MusoraChat' {
  export { MusoraChat, numberOfStreamWatchers };
}
