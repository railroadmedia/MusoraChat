import {
  Channel,
  Event,
  FormatMessageResponse,
  LiteralStringForUnion,
  StreamChat,
  UR,
  UserResponse,
} from 'stream-chat';

export type MusoraChatType = {
  attachmentType: UR;
  channelType: UR;
  commandType: LiteralStringForUnion;
  eventType: UR;
  messageType: UR;
  reactionType: UR;
  userType: IChatUser;
};

export type IMessage = FormatMessageResponse<MusoraChatType>;

export interface IChatUser extends UserResponse {
  accessLevelName?: string;
  avatarUrl: string;
  banned: boolean;
  created_at: string;
  displayName: string;
  gsToken: string;
  id: string;
  last_active: string;
  online: boolean;
  profileUrl: string;
  role: string;
  updated_at: string;
}

export type IEventType = Event<MusoraChatType>;

export type IChatType = StreamChat<MusoraChatType>;

export type IChannelType = Channel<MusoraChatType>;
