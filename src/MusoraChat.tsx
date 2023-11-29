import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
} from 'react-native';

import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreamChat } from 'stream-chat';
import FloatingMenu, { IFloatingMenuRef } from './FloatingMenu';
import Participants from './Participants';
import BlockedUsers from './BlockedUsers';
import { sendMsg, x } from './svgs';
import TabMenu from './TabMenu';
import TextBoxModal from './TextBoxModal';
import ResourcesItem from './ResourcesItem';
import { Resource } from 'RNDownload';
import ChatList, { IChatListRef } from './ChatList';
import { IChannelType, IEventType, IChatUser, IMessage, MusoraChatType } from './types';

interface IMusoraChat {
  appColor: string;
  chatId: string;
  clientId: string;
  isDark: boolean;
  onRemoveAllMessages: (userId: string) => void;
  onToggleBlockStudent: (blockedUser?: IChatUser | null) => void;
  questionsId: string;
  user: IChatUser;
  resources: Resource[];
  onResourcesPress: (resource: Resource) => void;
  isLandscape: boolean;
}

const isiOS = Platform.OS === 'ios';

const MusoraChat: FunctionComponent<IMusoraChat> = props => {
  const {
    appColor,
    chatId,
    clientId,
    isDark,
    onRemoveAllMessages,
    onToggleBlockStudent,
    questionsId,
    user,
    resources,
    onResourcesPress,
    isLandscape,
  } = props;

  const styles = setStyles(isDark);

  const [comment, setComment] = useState('');
  const [chatTypers, setChatTypers] = useState<string[]>([]);
  const [chatViewers, setChatViewers] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [questionsTypers, setQuestionsTypers] = useState<string[]>([]);
  const [questionsViewers, setQuestionsViewers] = useState(0);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [channel, setChannel] = useState('chatChannel');

  const client = StreamChat.getInstance<MusoraChatType>(clientId, {
    timeout: 10000,
  });
  const [me, setMe] = useState<IChatUser | undefined>();

  const [chatChannel, setChatChannel] = useState<IChannelType | undefined>();
  const [questionsChannel, setQuestionsChannel] = useState<IChannelType | undefined>();

  const [questionPending, setQuestionPendingMsg] = useState<IMessage>();
  const [chatPending, setChatPendingMsg] = useState<IMessage>();
  const [editMessage, setEditMessage] = useState<IMessage | undefined>();

  const commentTextInput = useRef<TextInput>(null);
  const floatingMenu = useRef<IFloatingMenuRef>(null);
  const fListY = useRef<number>(0);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!isiOS) {
      AndroidKeyboardAdjust?.setAdjustPan();
    }
  }, []);

  const currentChannel = useMemo(
    () => (channel === 'questionsChannel' ? questionsChannel : chatChannel),
    [channel, chatChannel, questionsChannel]
  );

  const editToBeCancelled = useMemo(
    () => editMessage?.text === comment || (editMessage && !comment) || false,
    [editMessage, comment]
  );

  const messages: IMessage[] = useMemo(() => {
    let tempMessages = currentChannel?.state.messages || [];
    tempMessages = tempMessages
      .slice()
      .reverse()
      .filter(m => m?.type !== 'deleted' && !m?.user?.banned);
    if (tabIndex === 1 && questionPending !== undefined) {
      tempMessages.unshift(questionPending);
    }
    if (tabIndex === 0 && chatPending !== undefined) {
      tempMessages.unshift(chatPending);
    }
    if (tabIndex === 0 || tabIndex === 1) {
      tempMessages = Object.values(
        tempMessages
          .sort((i, j) =>
            (i.reaction_counts?.upvote || 0) < (j?.reaction_counts?.upvote || 0) ||
            i.reaction_counts?.upvote === undefined
              ? -1
              : 1
          )
          .reduce((r, a) => {
            const upvote = a?.reaction_counts?.upvote || 0;
            if (a === undefined) {
              return r;
            }
            r[upvote] = r[upvote] || [];
            r[upvote].push(a);
            return r;
          }, [] as IMessage[][])
      )
        .sort((i, j) =>
          (i[0].reaction_counts?.upvote || 0) < (j[0]?.reaction_counts?.upvote || 0) ||
          i[0].reaction_counts?.upvote === undefined
            ? -1
            : 1
        )
        .map(m => m.sort((i, j) => (i.created_at > j?.created_at ? -1 : 1)))
        .flat();
    }
    return [...tempMessages];
  }, [chatPending, currentChannel?.state.messages, questionPending, tabIndex]);

  const pinned: IMessage[] = useMemo(
    () =>
      messages
        ?.filter(m => m?.pinned)
        .slice(-2)
        .sort((i, j) => ((i.pinned_at || 0) < (j.pinned_at || 0) ? -1 : 1)),

    [messages]
  );

  const clientEventListener = useCallback(
    ({ type, user: eventUser, watcher_count, channel_id, reaction, message }: IEventType) => {
      if (type === 'health.check') {
        return;
      }
      if (type.includes('reaction') && reaction?.type !== 'upvote') {
        return;
      }

      const ct = new Set(chatTypers);
      const qt = new Set(questionsTypers);
      if (tabIndex && channel_id === questionsId) {
        if (type === 'typing.start' && eventUser?.displayName) {
          qt.add(eventUser.displayName);
        }
        if (type === 'typing.stop' && eventUser?.displayName) {
          qt.delete(eventUser.displayName);
        }
      } else if (!tabIndex && channel_id === chatId) {
        if (type === 'typing.start' && eventUser?.displayName) {
          ct.add(eventUser.displayName);
        }
        if (type === 'typing.stop' && eventUser?.displayName) {
          ct.delete(eventUser.displayName);
        }
      }
      if (
        type.match(/^(user.banned|user.unbanned|delete_user_messages)$/) &&
        eventUser &&
        client?.user
      ) {
        client.user.banned = eventUser.banned;
      }
      if (type === 'message.new') {
        if (eventUser?.id !== user.id) {
          if (fListY.current) {
            messages[messages.length - 1].new = true;
          }
          if (tabIndex) {
            const msg = questionsChannel?.state.messages.find(m => m.id === message?.id);
            if (msg) {
              msg.reaction_counts = {
                upvote: 1,
              };
            }
          }
        } else {
          if (tabIndex) {
            const msgToAddReact = questionsChannel?.state.messages.find(m => m.id === message?.id);
            if (msgToAddReact) {
              msgToAddReact.own_reactions = [
                {
                  type: 'upvote',
                  tbRemoved: true,
                  created_at: '',
                  updated_at: '',
                  message_id: msgToAddReact.id,
                },
              ];
              msgToAddReact.reaction_counts = { upvote: 1 };
            }
            setQuestionPendingMsg(undefined);
          } else {
            setChatPendingMsg(undefined);
          }
        }
      }
      if (tabIndex && type === 'reaction.new' && reaction?.user_id === eventUser?.id) {
        const upvotingMessage = questionsChannel?.state.messages.find(
          m => m.id === reaction?.message_id
        );
        if (upvotingMessage) {
          upvotingMessage.own_reactions = upvotingMessage?.own_reactions?.filter(
            or => !or.tbRemoved
          );
        }
      }

      if (type?.includes('watching') && watcher_count) {
        if (channel_id === questionsId) {
          setQuestionsViewers(watcher_count);
        } else {
          setChatViewers(watcher_count);
        }
      }
      if (type?.includes('typing')) {
        if (channel_id === questionsId) {
          setQuestionsTypers(Array.from(qt));
        } else {
          setChatTypers(Array.from(ct));
        }
      }
      // This triggers re-rendering when receiving a message.
      // Because it was not seeing the inner state of the channels.
      setTrigger(!trigger);
    },
    [
      chatId,
      chatTypers,
      client?.user,
      messages,
      questionsChannel?.state.messages,
      questionsId,
      questionsTypers,
      tabIndex,
      trigger,
      user.id,
    ]
  );

  const chatRef = useRef<IChatListRef>(null);

  useEffect(() => {
    // SETUP
    if (client.userID) {
      return;
    }

    // Connect user
    client
      .connectUser(user, user.gsToken)
      .then(connection => {
        setMe(connection?.me);
        // Cet channels
        client
          .queryChannels(
            {
              id: { $in: [chatId, questionsId] },
            },
            [{}],
            { message_limit: 200 }
          )
          .then(channels => {
            const chat = channels.find(c => c.id === chatId);
            const questions = channels.find(c => c.id === questionsId);
            setChatChannel(chat);
            setQuestionsChannel(questions);
            setChatViewers(chat?.state.watcher_count || 0);
            setQuestionsViewers(questions?.state.watcher_count || 0);

            client.on(clientEventListener);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(() => {});

    return () => {
      // Disconnect User
      client.disconnectUser().catch(() => {});
      client.off(clientEventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleMessage = useCallback(() => {
    if (editToBeCancelled) {
      setKeyboardVisible(false);
      setComment('');
      setEditMessage(undefined);
      return;
    }
    if (!client || !client.user) {
      return;
    }
    const clientUser = client.user;
    commentTextInput.current?.clear();
    currentChannel?.stopTyping();
    if (comment && !clientUser.banned) {
      if (editMessage) {
        editMessage.text = comment;
        client
          .updateMessage({
            text: comment,
            id: editMessage.id,
          })
          .catch(() => {});
      } else {
        const pendingMessage: IMessage = {
          user: clientUser,
          text: comment,
          id: '1',
          created_at: new Date(),
          updated_at: new Date(),
          pinned_at: null,
          status: 'draft',
          type: 'regular',
        };
        if (tabIndex === 1) {
          pendingMessage.own_reactions = [
            {
              type: 'upvote',
              tbRemoved: true,
              created_at: '',
              updated_at: '',
              message_id: pendingMessage.id,
            },
          ];
          pendingMessage.reaction_counts = { upvote: 1 };
          setQuestionPendingMsg(pendingMessage);
        }
        if (tabIndex === 0) {
          setChatPendingMsg(pendingMessage);
        }
        chatRef.current?.scrollDown();
        currentChannel
          ?.sendMessage({ text: comment })
          .then(({ message: { id } }) => {
            if (channel === 'questionsChannel') {
              questionsChannel?.sendReaction(id, { type: 'upvote' }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }
    setEditMessage(undefined);
    setKeyboardVisible(false);
    setComment('');
  }, [
    channel,
    client,
    comment,
    currentChannel,
    editMessage,
    editToBeCancelled,
    questionsChannel,
    tabIndex,
  ]);

  const onChatScroll = useCallback(
    ({
      nativeEvent: {
        contentOffset: { y },
      },
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
      fListY.current = y >= 0 ? y : 0;
      if (y > 0 && !showScrollToTop) {
        setShowScrollToTop(true);
      }
      if (y === 0 && showScrollToTop) {
        setShowScrollToTop(false);
      }
    },
    [showScrollToTop]
  );

  const loadMore = useCallback(() => {
    if (!currentChannel) {
      return;
    }
    setLoadingMore(true);
    currentChannel?.query({ messages: { limit: 50 } }).finally(() => {
      setLoadingMore(false);
    });
  }, [currentChannel]);

  const onTogglePinMessage = useCallback(
    (item: IMessage) => {
      if (!client) {
        return;
      }
      if (item.pinned) {
        client.unpinMessage(item).catch(() => {});
      } else {
        chatChannel?.state.messages
          ?.filter(m => m.pinned && m.deleted_at === null)
          .sort((i, j) => ((i.pinned_at || Date.now()) < (j.pinned_at || Date.now()) ? 1 : -1))
          .slice(1)
          .map(m => client.unpinMessage(m).catch(() => {}));
        client.pinMessage(item).catch(() => {});
      }
      setTrigger(!trigger);
    },
    [chatChannel?.state.messages, client, trigger]
  );

  const onToggleHidden = useCallback(
    (id: string) => {
      if (!client) {
        return;
      }
      if (hidden.includes(id)) {
        setHidden(hidden.filter(i => i !== id));
      } else {
        setHidden([...hidden, id]);
      }
    },
    [client, hidden]
  );

  const onAnswered = useCallback(
    (id: string) => {
      if (!client) {
        return;
      }
      client.deleteMessage(id).catch(() => {});
    },
    [client]
  );
  const onToggleReact = useCallback(
    (item: IMessage) => {
      if (item.own_reactions?.some(r => r.type === 'upvote')) {
        questionsChannel?.deleteReaction(item.id, 'upvote').catch(() => {});
      } else {
        questionsChannel?.sendReaction(item.id, { type: 'upvote' }).catch(() => {});
      }
    },
    [questionsChannel]
  );

  const onEditMessage = useCallback((item: IMessage) => {
    setEditMessage(item);
    setKeyboardVisible(true);
    setComment(item.text || '');
  }, []);

  const formatTypers = useMemo(() => {
    const typers = tabIndex ? questionsTypers : chatTypers;
    if (!typers.length) {
      return '';
    }
    const firstTwo = typers.slice(0, 2).join(typers.length < 3 ? ' And ' : ', ');
    const remaining = typers.slice(2, typers.length);
    const remainingStr = remaining.length
      ? ` And ${remaining.length} Other${remaining.length === 1 ? '' : 's'}`
      : '';
    const endString = ` ${typers.length < 2 ? 'Is' : 'Are'} Typing`;
    return firstTwo + remainingStr + endString;
  }, [chatTypers, questionsTypers, tabIndex]);

  const onClearAllQuestions = useCallback(() => {
    tabIndex
      ? () =>
          questionsChannel?.state.messages.map((m: IMessage) => {
            if (m.id !== undefined) {
              client?.deleteMessage(m.id).catch(() => {});
            }
          })
      : undefined;
  }, [client, questionsChannel, tabIndex]);

  const onTextBoxPress = (): void => {
    setKeyboardVisible(true);
    floatingMenu.current?.close?.();
  };

  const onBlockedStudents = (): void => {
    setShowParticipants(false);
    setShowBlocked(true);
  };

  const onParticipantsTapped = (): void => {
    setShowParticipants(true);
    setShowBlocked(false);
  };

  const onTabChange = (i: number): void => {
    setTabIndex(i);
    setChannel(i === 1 ? 'questionsChannel' : 'chatChannel');
    floatingMenu.current?.close();
  };

  const onTextChange = (text: string): void => {
    currentChannel?.keystroke('').catch(() => {});
    setComment(text);
  };

  const renderChat = useCallback(
    () =>
      me === undefined || client === undefined ? (
        <></>
      ) : (
        <ChatList
          appColor={appColor}
          isDark={isDark}
          tabIndex={tabIndex}
          viewers={tabIndex ? questionsViewers : chatViewers}
          typers={formatTypers}
          editing={editToBeCancelled}
          loadingMore={loadingMore}
          showScrollToTop={showScrollToTop}
          isKeyboardVisible={keyboardVisible}
          me={me}
          pinned={pinned}
          messages={messages}
          hidden={hidden}
          client={client}
          onMessageTap={() => floatingMenu.current?.close?.()}
          handleMessage={handleMessage}
          onScroll={onChatScroll}
          loadMore={loadMore}
          onTextBoxPress={onTextBoxPress}
          comment={comment}
          onRemoveAllMessages={onRemoveAllMessages}
          onToggleBlockStudent={onToggleBlockStudent}
          onTogglePinMessage={onTogglePinMessage}
          onToggleHidden={onToggleHidden}
          onAnswered={onAnswered}
          onToggleReact={onToggleReact}
          onEditMessage={onEditMessage}
          ref={chatRef}
        />
      ),
    [
      appColor,
      chatViewers,
      client,
      comment,
      editToBeCancelled,
      formatTypers,
      handleMessage,
      hidden,
      isDark,
      keyboardVisible,
      loadMore,
      loadingMore,
      me,
      messages,
      onAnswered,
      onChatScroll,
      onEditMessage,
      onRemoveAllMessages,
      onToggleBlockStudent,
      onToggleHidden,
      onTogglePinMessage,
      onToggleReact,
      pinned,
      questionsViewers,
      showScrollToTop,
      tabIndex,
    ]
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.chatContainer}>
      {loading ? (
        <ActivityIndicator
          size='large'
          color={isDark ? 'white' : 'black'}
          style={styles.activityIndicator}
        />
      ) : showParticipants ? (
        <Participants
          isDark={isDark}
          appColor={appColor}
          admin={me?.role === 'admin'}
          onlineUsers={tabIndex ? questionsViewers : chatViewers}
          channel={currentChannel}
          onBack={() => setShowParticipants(false)}
          onBlockedStudents={onBlockedStudents}
        />
      ) : showBlocked ? (
        <BlockedUsers
          isDark={isDark}
          appColor={appColor}
          admin={me?.role === 'admin'}
          client={client}
          onBack={() => setShowBlocked(false)}
          onParticipants={onParticipantsTapped}
          onUnblockStudent={unblockedUser => onToggleBlockStudent(unblockedUser)}
        />
      ) : (
        <>
          <TabMenu
            isDark={isDark}
            appColor={appColor}
            tabIndex={tabIndex}
            isLandscape={isLandscape}
            showResources={!!resources.length}
            onTabChange={onTabChange}
          />
          {tabIndex === 2 ? (
            <FlatList
              renderItem={({ item }) => (
                <ResourcesItem item={item} onPress={onResourcesPress} appColor={appColor} />
              )}
              data={resources}
            />
          ) : (
            renderChat()
          )}
          <FloatingMenu
            isDark={isDark}
            appColor={appColor}
            ref={floatingMenu}
            admin={me?.role === 'admin'}
            onClearAllQuestions={onClearAllQuestions}
            onParticipants={() => setShowParticipants(true)}
            onBlockedStudents={() => setShowBlocked(true)}
          />
          <TextBoxModal
            onClose={() => setKeyboardVisible(false)}
            onShow={() => setTimeout(() => commentTextInput.current?.focus(), isiOS ? 0 : 100)}
            visible={keyboardVisible}
            isDark={isDark}
            ref={commentTextInput}
            onSubmitEditing={handleMessage}
            onChangeText={onTextChange}
            comment={comment}
            icon={
              <>
                {(editToBeCancelled ? x : sendMsg)({
                  height: 12,
                  width: 12,
                  fill: isDark ? '#4D5356' : '#879097',
                })}
              </>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default MusoraChat;

const setStyles: StyleProp<any> = (isDark: boolean) =>
  StyleSheet.create({
    activityIndicator: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
    },
    chatContainer: {
      flex: 1,
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
    },
  });
