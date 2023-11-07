import {
  Channel,
  Event,
  FormatMessageResponse,
  LiteralStringForUnion,
  StreamChat,
  UnknownType,
  UserResponse,
} from 'stream-chat';

export type IMessage = FormatMessageResponse<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  IChatUser
>;

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

export type IEventType = Event<
  UnknownType,
  UnknownType,
  string,
  UnknownType,
  UnknownType,
  UnknownType,
  IChatUser
>;

export type IChatType = StreamChat<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  UnknownType,
  IChatUser
>;

export type IChannelType = Channel<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  UnknownType,
  IChatUser
>;
