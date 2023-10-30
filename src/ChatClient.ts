import { Channel, EventHandler, StreamChat, UserResponse } from 'stream-chat';

const connectUser = async (
  client: StreamChat,
  id: string,
  gsToken: string
): Promise<UserResponse | undefined> => {
  if (client.user?.displayName !== undefined) {
    return Promise.resolve(client.user);
  }
  return (await client.connectUser({ id: id }, gsToken))?.me;
};

const disconnectUser = async (client: StreamChat, listener: EventHandler): Promise<void> => {
  off(client, listener);
  await client.disconnectUser();
};

const getChannels = async (
  client: StreamChat,
  chatId: string,
  questionsId: string
): Promise<{ chat?: Channel; questions?: Channel }> => {
  const channels = await client.queryChannels(
    {
      id: { $in: [chatId, questionsId] },
    },
    [{}],
    { message_limit: 200 }
  );

  return {
    chat: channels.find(channel => channel.id === chatId),
    questions: channels.find(channel => channel.id === questionsId),
  };
};

const on = (client: StreamChat, listener: EventHandler): void => {
  client.on(listener);
};

const off = (client: StreamChat, listener: EventHandler): void => {
  client.off(listener);
};

const pinMessage = (client: StreamChat, message: { id: string }): void => {
  client.pinMessage(message).catch(() => {});
};

const unpinMessage = (client: StreamChat, message: { id: string }): void => {
  client.unpinMessage(message).catch(() => {});
};

const deleteMessage = (client: StreamChat, message: { id: string }): void => {
  client.deleteMessage(message.id).catch(() => {});
};

const updateMessage = (client: StreamChat, text: string, id: string): void => {
  client.updateMessage({ text, id }).catch(() => {});
};

export default {
  connectUser,
  disconnectUser,
  getChannels,
  on,
  off,
  pinMessage,
  unpinMessage,
  deleteMessage,
  updateMessage,
};
