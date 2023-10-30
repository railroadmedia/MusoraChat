import { Channel, StreamChat, UserResponse } from 'stream-chat';

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

export default {
  connectUser,
  getChannels,
};
