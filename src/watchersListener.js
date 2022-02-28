import { StreamChat } from 'stream-chat';
const numberOfStreamWatchers = async (apiKey, chatId, userId, gsToken) => {
  let client = StreamChat.getInstance(apiKey, {
    timeout: 10000,
  });
  if (!client.user) await client.connectUser({ id: `${userId}` }, gsToken);

  let watcherCount = (
    await client.queryChannels({ id: { $eq: chatId } }, [{}], {
      watch: true,
      message_limit: 0,
    })
  )?.[0]?.state.watcher_count;

  await client?.disconnectUser?.();
  return watcherCount;
};

export default numberOfStreamWatchers;
