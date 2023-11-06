import {
  Channel,
  Event,
  FormatMessageResponse,
  LiteralStringForUnion,
  StreamChat,
  UnknownType,
  UserResponse,
} from 'stream-chat';

export type IResponseType = FormatMessageResponse<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  IEventUser
>;

export interface IEventUser extends UserResponse {
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
  IEventUser
>;

export type IChatType = StreamChat<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  UnknownType,
  IEventUser
>;

export type IChannelType = Channel<
  UnknownType,
  UnknownType,
  LiteralStringForUnion,
  UnknownType,
  UnknownType,
  UnknownType,
  IEventUser
>;
