import React, {
  FunctionComponent,
  RefAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Message,
  StreamChat,
  UserResponse,
  Reaction,
  MessageResponse,
  Channel,
  FormatMessageResponse,
  ReactionResponse,
  User,
} from 'stream-chat';

import FloatingMenu, { IFloatingMenuRef } from './FloatingMenu';
import Participants from './Participants';
import BlockedUsers from './BlockedUsers';
import ListItem from './ListItem';

import { sendMsg, x, arrowDown } from './svgs';
import TabMenu from './TabMenu';
import TextBoxModal from './TextBoxModal';
import ResourcesItem from './ResourcesItem';
import { Resource } from 'RNDownload';

interface IMusoraChat {
  appColor: string;
  chatId: string;
  clientId: string;
  isDark: boolean;
  onRemoveAllMessages: (userId: string) => void;
  onToggleBlockStudent: (blockedUser: { banned: boolean; id: number }) => void;
  questionsId: string;
  user: {
    id: string;
    gsToken: string;
  };
  resources: Resource[];
  onResourcesPress: (resource: Resource) => void;
  isLandscape: boolean;
}

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

  const styles = setStyles(isDark, appColor);
  const isiOS = Platform.OS === 'ios';

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

  const floatingMenu = useRef<IFloatingMenuRef>(null);
  const fListY = useRef(0);

  useEffect(() => {
    const tempClient = StreamChat.getInstance(clientId, {
      timeout: 10000,
    });
    setClient(tempClient);
    return () => {
      client?.off(clientEventListener);
      client?.disconnectUser();
    };
  }, []);

  useEffect(() => {
    if (!isiOS) AndroidKeyboardAdjust?.setAdjustPan();
    connectUser()
      .then(getChannels)
      .then(() => {
        client?.on(clientEventListener);
        setLoading(false);
        // setChatViewers(chatChannel?.state.watcher_count);
        // setQuestionsViewers(questionsChannel?.state.watcher_count);
      });
    return () => {
      if (!isiOS) AndroidKeyboardAdjust?.setAdjustResize();
      disconnectUser();
    };
  }, []);

  const connectUser = async () => {
    let { id, gsToken } = user;
    try {
      const tempMe = client?.user?.displayName
        ? client.user
        : (await client?.connectUser({ id: `${id}` }, gsToken))?.me;
      setMe(tempMe);
    } catch (e) {}
  };

  const getChannels = async () => {
    let channels = await client?.queryChannels(
      {
        id: { $in: [chatId, questionsId] },
      },
      [{}],
      { message_limit: 200 }
    );
    setChatChannel(channels?.find(channel => channel.id === chatId));
    setQuestionsChannel(channels?.find(channel => channel.id === questionsId));
  };

  const clientEventListener: ({
    type,
    user,
    watcher_count,
    channel_id,
    reaction,
    message,
  }: {
    type?: string;
    user?: any;
    watcher_count?: number;
    channel_id?: string;
    reaction?: any;
    message?: any;
  }) => void = useCallback(async ({ type, user, watcher_count, channel_id, reaction, message }) => {
    if (type === 'health.check') return;
    if (type?.includes('reaction') && reaction.type !== 'upvote') return;

    let ct = new Set(chatTypers);
    let qt = new Set(questionsTypers);
    if (tabIndex && channel_id === questionsId) {
      if (type === 'typing.start') qt.add(user.displayName);
      if (type === 'typing.stop') qt.delete(user.displayName);
    } else if (!tabIndex && channel_id === chatId) {
      if (type === 'typing.start') ct.add(user.displayName);
      if (type === 'typing.stop') ct.delete(user.displayName);
    }
    if (type?.match(/^(user.banned|user.unbanned|delete_user_messages)$/)) {
      await getChannels();
      if (client !== undefined && client?.user !== undefined) {
        client.user.banned = user.banned;
      }
    }
    if (type === 'message.new') {
      if (user.id !== user.id) {
        if (fListY && chatChannel) {
          let { messages } = chatChannel?.state;
          messages[messages.length - 1].new = true;
        }
        if (tabIndex) {
          let msg = questionsChannel?.state.messages.find(
            (m: FormatMessageResponse) => m.id === message.id
          );
          if (msg) {
            msg.reaction_counts = {
              upvote: 1,
            };
          }
        }
      } else {
        if (tabIndex) {
          let msgToAddReact = questionsChannel?.state.messages.find(
            (m: FormatMessageResponse) => m.id === message.id
          );
          if (msgToAddReact) {
            let now = new Date().toDateString();
            msgToAddReact.own_reactions = [
              { type: 'upvote', tbRemoved: true, created_at: now, updated_at: now },
            ];
            msgToAddReact.reaction_counts = { upvote: 1 };
          }
        }
        tabIndex ? setQuestionPendingMsg(undefined) : setChatPendingMsg(undefined);
      }
    }
    if (tabIndex && type === 'reaction.new' && reaction.user_id === user.id) {
      let message: FormatMessageResponse | undefined = questionsChannel?.state.messages.find(
        (m: FormatMessageResponse) => m.id === reaction.message_id
      );
      if (message) {
        message.own_reactions = message?.own_reactions?.filter(
          (or: ReactionResponse<Reaction, User>) => !or.tbRemoved
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
      if (tabIndex) {
        setQuestionsTypers(Array.from(qt));
      } else {
        setChatTypers(Array.from(ct));
      }
    }
    // This triggers re-rendering when receiving a message.
    // Because it was not seeing the inner state of the channels.
    // setState({});
  }, []);

  const disconnectUser = useCallback(async () => {
    client?.off(clientEventListener);
    await client?.disconnectUser?.();
  }, []);

  const [editMessage, setEditMessage] = useState<any>();

  const flatList = useRef<FlatList>(null);
  const commentTextInput = useRef<TextInput>(null);

  const renderChatFLItem = useCallback(
    ({ item }: any, pinned: boolean) => (
      <ListItem
        editing={editMessage?.id === item.id}
        new={item.new}
        reversed={!isiOS && !pinned}
        isDark={isDark}
        appColor={appColor}
        key={item.id}
        onLayout={({ nativeEvent: ne }) => {
          if (item.new) {
            delete item.new;
            flatList.current?.scrollToOffset({
              offset: fListY.current + ne.layout.height,
              animated: false,
            });
          }
        }}
        onTap={() => floatingMenu.current?.close?.()}
        own={me?.displayName === item.user.displayName}
        admin={me?.role === 'admin'}
        type={tabIndex ? 'question' : 'message'}
        pinned={pinned}
        hidden={pinned ? (hidden.find(id => id === item.id) ? true : false) : undefined}
        item={item}
        onRemoveMessage={() => client?.deleteMessage(item.id).catch(e => {})}
        onRemoveAllMessages={() => onRemoveAllMessages(item.user.id)}
        onToggleBlockStudent={() => onToggleBlockStudent(item.user)}
        onTogglePinMessage={() => {
          if (item.pinned) return client?.unpinMessage(item).catch(e => {});
          chatChannel?.state.messages
            ?.filter((m: FormatMessageResponse) => m.pinned)
            .sort((i: FormatMessageResponse, j: FormatMessageResponse) =>
              (i.pinned_at || 0) < (j.pinned_at || 0) ? 1 : -1
            )
            .slice(1)
            .map((m: FormatMessageResponse) => client?.unpinMessage(m).catch(() => {}));
          client?.pinMessage(item).catch(() => {});
        }}
        onToggleHidden={id => {
          if (hidden.find(id => item.id === id)) {
            setHidden(hidden.filter(id => id !== item.id));
          } else {
            setHidden([...hidden, id]);
          }
        }}
        onAnswered={() => client?.deleteMessage(item.id).catch(() => {})}
        onToggleReact={() => {
          if (item.own_reactions.some((r: Reaction) => r.type === 'upvote'))
            questionsChannel?.deleteReaction(item.id, 'upvote').catch(() => {});
          else questionsChannel?.sendReaction(item.id, { type: 'upvote' }).catch(() => {});
        }}
        onEditMessage={() => {
          setEditMessage(item);
          setKeyboardVisible(true);
          setComment(item.text);
        }}
      />
    ),
    []
  );

  const formatTypers = useMemo(() => {
    // let typers = tabIndex ? questionsTypers : chatTypers;
    // if (!typers.length) return '';
    // let firstTwo = typers.slice(0, 2).concat(typers.length < 3 ? ' And ' : ', ');
    // let remaining = typers.slice(2, typers.length);
    // remaining = remaining.length
    //   ? ` And ${remaining.length} Other${remaining.length === 1 ? '' : 's'}`
    //   : '';
    // let endString = ` ${typers.length < 2 ? 'Is' : 'Are'} Typing`;
    // return firstTwo + remaining + endString;
    return 'TYPERS NOT IMPLEMENTED';
  }, []);

  const currentChannel = useMemo(
    () => (channel === 'questionsChannel' ? questionsChannel : chatChannel),
    [channel]
  );

  const renderChat = useMemo(() => {
    if (!loading && !showParticipants && !showBlocked) {
      var messages = currentChannel?.state?.messages
        .slice()
        .reverse()
        ?.filter((m: FormatMessageResponse) => m?.type !== 'deleted' && !m?.user?.banned);
      const pendingMsg = channel === 'questionsChannel' ? questionPending : chatPending;
      if (pendingMsg) messages?.unshift(pendingMsg);
      if (tabIndex === 0 || tabIndex === 1) {
        // messages = Object.values(
        //   messages?.sort((i: FormatMessageResponse, j: FormatMessageResponse) =>
        //       (i.reaction_counts?.upvote || 0) < (j?.reaction_counts?.upvote || 0)||
        //       i.reaction_counts?.upvote === undefined
        //         ? -1
        //         : 1
        //     )
        //     .reduce((r, a) => {
        //       r[a.reaction_counts?.upvote] = r[a.reaction_counts?.upvote] || [];
        //       r[a.reaction_counts?.upvote].push(a);
        //       return r;
        //     }, Object.create(null))
        // )
        //   .sort((i, j) =>
        //     i[0].reaction_counts?.upvote < j[0]?.reaction_counts?.upvote ||
        //     i[0].reaction_counts?.upvote === undefined
        //       ? -1
        //       : 1
        //   )
        //   .map((m: FormatMessageResponse) => m.sort((i, j) => (i.created_at > j?.created_at ? -1 : 1)))
        //   .flat();
      }
      var pinned = messages
        ?.filter((m: FormatMessageResponse) => m.pinned)
        .slice(-2)
        .sort((i, j) => ((i.pinned_at || 0) < (j.pinned_at || 0) ? -1 : 1));
    }
    return (
      <>
        {pinned?.map(item => renderChatFLItem({ item }, true))}
        <View style={{ flex: 1 }}>
          <FlatList
            key={tabIndex}
            inverted={isiOS}
            onScroll={({
              nativeEvent: {
                contentOffset: { y },
              },
            }) => {
              fListY.current = y >= 0 ? y : 0;

              if (y > 0 && !showScrollToTop) {
                setShowScrollToTop(true);
              } else {
                setShowScrollToTop(false);
              }
            }}
            windowSize={10}
            data={messages}
            style={[styles.flatList, isiOS ? {} : { transform: [{ rotate: '180deg' }] }]}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            onEndReachedThreshold={0.01}
            removeClippedSubviews={true}
            keyboardShouldPersistTaps='handled'
            renderItem={info => renderChatFLItem(info, false)}
            onEndReached={loadMore}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
              <Text
                style={[styles.emptyListText, isiOS ? {} : { transform: [{ rotate: '180deg' }] }]}
              >
                {tabIndex ? 'No questions' : 'Say Hi!'}
              </Text>
            }
            ListFooterComponent={
              <ActivityIndicator
                size='small'
                color={isDark ? 'white' : 'black'}
                animating={loadingMore}
                style={styles.activityIndicator}
              />
            }
            ref={flatList}
          />
          {showScrollToTop && (
            <TouchableOpacity
              onPress={() => flatList.current?.scrollToOffset({ offset: 0 })}
              style={styles.scrollToTop}
            >
              {arrowDown({ width: '70%', fill: 'white' })}
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            setKeyboardVisible(true);
            floatingMenu?.current?.close();
          }}
          style={[
            styles.saySomethingTOpacity,
            {
              backgroundColor: keyboardVisible ? 'transparent' : isDark ? 'black' : 'white',
            },
          ]}
        >
          <Text
            style={[styles.placeHolderText, { opacity: keyboardVisible ? 0 : 1 }]}
            numberOfLines={1}
          >
            {editMessage
              ? comment
              : comment || `${tabIndex ? 'Ask a question' : 'Say something'}...`}
          </Text>
          <TouchableOpacity onPress={handleMessage} style={{ padding: 15 }}>
            {(editToBeCancelled ? x : sendMsg)({
              height: 12,
              width: 12,
              fill: keyboardVisible ? 'transparent' : isDark ? '#4D5356' : '#879097',
            })}
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.chatEventsInfo}>
            {tabIndex ? questionsViewers : chatViewers} Online
          </Text>
          <Text style={styles.chatEventsInfo}>{formatTypers}</Text>
        </View>
      </>
    );
  }, []);
  const handleMessage = useCallback(() => {
    if (!client) return;
    if (editToBeCancelled) {
      setKeyboardVisible(false);
      setComment('');
      setEditMessage(undefined);
    }
    let { user } = client;
    commentTextInput.current?.clear();
    currentChannel?.stopTyping();
    if (comment && !user?.banned) {
      if (editMessage) {
        editMessage.text = comment;
        client
          ?.updateMessage({
            text: comment,
            id: editMessage.id,
          })
          .catch(e => {});
      } else {
        const tempPending: any = {
          user,
          text: comment,
          id: 1,
          created_at: new Date(),
        };
        if (channel === 'questionsChannel') {
          tempPending.own_reactions = [{ type: 'upvote', tbRemoved: true }];
          tempPending.reaction_counts = { upvote: 1 };
        }
        channel === 'questionsChannel'
          ? setQuestionPendingMsg(tempPending)
          : setChatPendingMsg(tempPending);
        flatList.current?.scrollToOffset({ offset: 0, animated: true });
        currentChannel
          ?.sendMessage({ text: comment })
          .then(({ message: { id } }: { message: MessageResponse }) => {
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
  }, []);

  const editToBeCancelled = useMemo(
    () => editMessage?.text === comment || (editMessage && !comment),
    [editMessage, comment]
  );

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    await currentChannel?.query({
      messages: { limit: 50, id_lt: currentChannel.state.messages[0].id },
    });
    setLoadingMore(false);
  }, []);

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
          onUnblockStudent={user => onToggleBlockStudent(user)}
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
            renderChat
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
            onChangeText={comment => setComment(comment)}
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

// export default class MusoraChat extends React.Component {

//   renderChat = () => {
//   };
// }

const setStyles = (isDark: boolean, appColor: string) =>
  StyleSheet.create({
    activityIndicator: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
    },
    chatContainer: {
      flex: 1,
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
    },
    flatList: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
      borderTopWidth: isDark ? 0 : 2,
      borderBottomWidth: isDark ? 0 : 2,
      borderColor: 'rgba(0,0,0,.1)',
    },
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black',
    },
    saySomethingTOpacity: {
      margin: 10,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chatEventsInfo: {
      padding: 10,
      paddingTop: 0,
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans',
    },
    placeHolderText: {
      flex: 1,
      paddingLeft: 15,
      color: isDark ? '#4D5356' : '#879097',
      fontFamily: 'OpenSans',
    },
    scrollToTop: {
      width: 30,
      aspectRatio: 1,
      position: 'absolute',
      alignSelf: 'center',
      bottom: 10,
      padding: 5,
      borderRadius: 15,
      backgroundColor: appColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
