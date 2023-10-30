import { StreamChat, UserResponse } from 'stream-chat';

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

export default {
  connectUser,
};
