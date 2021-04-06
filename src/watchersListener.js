import { StreamChat } from 'stream-chat';
export default async (apiKey, chatId, userId, gsToken, callback) => {
  let client = StreamChat.getInstance(apiKey);

  let queryChat = async () =>
    (
      await client.queryChannels({ id: { $eq: chatId } }, [{}], {
        watch: false,
        message_limit: 0
      })
    )?.[0]?.state.watcher_count;

  let listener = async ({ type }) =>
    type === 'health.check' && callback(await queryChat());

  if (!client.user) await client.connectUser({ id: `${userId}` }, gsToken);
  callback(await queryChat());
  client?.on(listener);

  return () => client?.off(listener);
};
