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
import { StreamChat, UserResponse, Channel, FormatMessageResponse } from 'stream-chat';
import FloatingMenu, { IFloatingMenuRef } from './FloatingMenu';
import Participants from './Participants';
import BlockedUsers from './BlockedUsers';
import { sendMsg, x } from './svgs';
import TabMenu from './TabMenu';
import TextBoxModal from './TextBoxModal';
import ResourcesItem from './ResourcesItem';
import { Resource } from 'RNDownload';
import ChatList from './ChatList';

interface IMusoraChat {
  appColor: string;
  chatId: string;
  clientId: string;
  isDark: boolean;
  onRemoveAllMessages: (userId: string) => void;
  onToggleBlockStudent: (blockedUser?: UserResponse | null) => void;
  questionsId: string;
  user: {
    id: string;
    gsToken: string;
  };
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

  const [client, setClient] = useState<StreamChat | undefined>();
  const [me, setMe] = useState<UserResponse | undefined>();

  const [chatChannel, setChatChannel] = useState<Channel | undefined>();
  const [questionsChannel, setQuestionsChannel] = useState<Channel | undefined>();

  const [questionPending, setQuestionPendingMsg] = useState<any>();
  const [chatPending, setChatPendingMsg] = useState<any>();
  const [editMessage, setEditMessage] = useState<any>();

  const commentTextInput = useRef<TextInput>(null);
  const floatingMenu = useRef<IFloatingMenuRef>(null);
  const fListY = useRef<number>(0);

  useEffect(() => {
    if (!isiOS) {
      AndroidKeyboardAdjust?.setAdjustPan();
    }
  }, []);

  const clientEventListener = useCallback(() => {}, []);

  useEffect(() => {
    // SETUP
    if (client) {
      return;
    }

    const tempClient = StreamChat.getInstance(clientId, {
      timeout: 10000,
    });

    setClient(tempClient);

    // Connect user
    tempClient
      .connectUser(user, user.gsToken)
      .then(connection => {
        setMe(connection?.me);
        // Cet channels
        tempClient
          .queryChannels(
            {
              id: { $in: [chatId, questionsId] },
            },
            [{}],
            { message_limit: 200 }
          )
          .then(channels => {
            setChatChannel(channels.find(c => c.id === chatId));
            setQuestionsChannel(channels.find(c => c.id === questionsId));
            tempClient.on(clientEventListener);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(() => {});

    return () => {
      // Disconnect User
      tempClient.disconnectUser();
      tempClient.off(clientEventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const currentChannel = useMemo(
    () => (channel === 'questionsChannel' ? questionsChannel : chatChannel),
    [channel, chatChannel, questionsChannel]
  );

  const editToBeCancelled = useMemo(
    () => editMessage?.text === comment || (editMessage && !comment),
    [editMessage, comment]
  );

  const handleMessage = useCallback(() => {}, []);

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
    (item: FormatMessageResponse) => {
      if (!client) {
        return;
      }
      if (item.pinned) {
        client.unpinMessage(item);
      }
      chatChannel?.state.messages
        ?.filter(m => m.pinned)
        .sort((i, j) => ((i.pinned_at || 0) < (j.pinned_at || 0) ? 1 : -1))
        .slice(1)
        .map(m => client.unpinMessage(m));
      client.pinMessage(item);
    },
    [chatChannel?.state.messages, client]
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
      client.deleteMessage(id);
    },
    [client]
  );
  const onToggleReact = useCallback(() => {}, []);
  const onEditMessage = useCallback(() => {}, []);

  const formatTypers = useMemo(() => 'format typers', []);
  const messages: FormatMessageResponse[] = useMemo(() => {
    let tempMessages = currentChannel?.state.messages || [];
    tempMessages = tempMessages
      .slice()
      .reverse()
      .filter(m => m?.type !== 'deleted' && !m?.user?.banned);
    if (tabIndex === 0 || tabIndex === 1) {
      tempMessages = Object.values(
        tempMessages
          .sort((i, j) =>
            (i.reaction_counts?.upvote || 0) < (j?.reaction_counts?.upvote || 0) ||
            i.reaction_counts?.upvote === undefined
              ? -1
              : 1
          )
          .reduce(
            function (r, a) {
              const upvote = a.reaction_counts?.upvote || 0;
              r[upvote] = r[upvote] || [];
              r[upvote].push(a);
              return r;
            },
            Object.create(null) as FormatMessageResponse[][]
          )
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
    return tempMessages;
  }, [currentChannel?.state.messages, tabIndex]);

  const pinned: FormatMessageResponse[] = useMemo(() => {
    const p = messages
      ?.filter(m => m.pinned)
      .slice(-2)
      .sort((i, j) => ((i.pinned_at || 0) < (j.pinned_at || 0) ? -1 : 1));

    return p;
  }, [messages]);

  const renderChat = useCallback(
    () =>
      me === undefined || client === undefined ? (
        <></>
      ) : (
        <ChatList
          appColor={appColor}
          isDark={isDark}
          isiOS={isiOS}
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
          onTextBoxPress={() => {
            setKeyboardVisible(true);
            floatingMenu.current?.close?.();
          }}
          comment={comment}
          onRemoveAllMessages={onRemoveAllMessages}
          onToggleBlockStudent={onToggleBlockStudent}
          onTogglePinMessage={onTogglePinMessage}
          onToggleHidden={onToggleHidden}
          onAnswered={onAnswered}
          onToggleReact={onToggleReact}
          onEditMessage={onEditMessage}
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
          onBlockedStudents={() => {
            setShowParticipants(false);
            setShowBlocked(true);
          }}
        />
      ) : showBlocked ? (
        <BlockedUsers
          isDark={isDark}
          appColor={appColor}
          admin={me?.role === 'admin'}
          client={client}
          onBack={() => setShowBlocked(false)}
          onParticipants={() => {
            setShowParticipants(true);
            setShowBlocked(false);
          }}
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
            onTabChange={i => {
              setTabIndex(i);
              setChannel(i === 1 ? 'questionsChannel' : 'chatChannel');
              floatingMenu.current?.close();
            }}
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
            onClearAllQuestions={
              tabIndex
                ? () =>
                    questionsChannel?.state.messages.map((m: FormatMessageResponse) => {
                      if (m.id !== undefined) {
                        client?.deleteMessage(m.id).catch(() => {});
                      }
                    })
                : undefined
            }
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
            onChangeText={changedComment => setComment(changedComment)}
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
