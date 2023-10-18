import { Channel, StreamChat } from 'stream-chat';

const numberOfStreamWatchers: (
  apiKey: string,
  chatId: string,
  userId: string,
  gsToken: string
) => Promise<number> = async (apiKey, chatId, userId, gsToken) => {
  let client = StreamChat.getInstance(apiKey, {
    timeout: 10000,
  });
  if (!client.user) await client.connectUser({ id: `${userId}` }, gsToken);

  const channels: Channel[] = await client.queryChannels({ id: { $eq: chatId } }, [{}], {
    watch: true,
    message_limit: 0,
  });

  let watcherCount: number = channels?.[0]?.state.watcher_count;

  await client?.disconnectUser?.();
  return watcherCount;
};

export default numberOfStreamWatchers;
