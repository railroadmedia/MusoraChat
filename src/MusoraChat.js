import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreamChat } from 'stream-chat';

import FloatingMenu from './FloatingMenu';
import Participants from './Participants';
import BlockedUsers from './BlockedUsers';
import ListItem from './ListItem';

import { sendMsg, x, arrowDown } from './svgs';

let styles,
  isiOS = Platform.OS === 'ios';
const tabs = ['CHAT', 'QUESTIONS'];
export default class MusoraChat extends React.Component {
  state = {
    comment: '',
    chatTypers: [],
    chatViewers: 0,
    keyboardVisible: false,
    loading: true,
    loadingMore: false,
    questionsTypers: [],
    questionsViewers: 0,
    showBlocked: false,
    showParticipants: false,
    tabIndex: 0,
    showScrollToTop: false,
    isHidden: [],
  };

  constructor(props) {
    super(props);
    this.client = StreamChat.getInstance(this.props.clientId, {
      timeout: 10000,
    });
    styles = setStyles(props.isDark);
  }

  componentDidMount() {
    if (!isiOS) AndroidKeyboardAdjust?.setAdjustPan();
    this.connectUser()
      .then(this.getChannels)
      .then(() => {
        this.client?.on(this.clientEventListener);
        this.setState({
          loading: false,
          chatViewers: this.chatChannel?.state.watcher_count,
          questionsViewers: this.questionsChannel?.state.watcher_count,
        });
      });
  }

  componentWillUnmount() {
    if (!isiOS) AndroidKeyboardAdjust?.setAdjustResize();
    this.disconnectUser();
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  connectUser = async () => {
    let { id, gsToken } = this.props.user;
    try {
      this.me = this.client?.user?.displayName
        ? this.client.user
        : (await this.client.connectUser({ id: `${id}` }, gsToken)).me;
    } catch (e) {}
  };

  getChannels = async () => {
    let { chatId, questionsId } = this.props;
    let channels = await this.client.queryChannels(
      {
        id: { $in: [this.props.chatId, this.props.questionsId] },
      },
      [{}],
      { message_limit: 200 }
    );
    this.chatChannel = channels.find(channel => channel.id === chatId);
    this.questionsChannel = channels.find(channel => channel.id === questionsId);
  };

  clientEventListener = async ({ type, user, watcher_count, channel_id, reaction, message }) => {
    if (type === 'health.check') return;
    if (type.includes('reaction') && reaction.type !== 'upvote') return;
    let { chatTypers, questionsTypers, tabIndex: ti } = this.state;
    let ct = new Set(chatTypers);
    let qt = new Set(questionsTypers);
    if (ti && channel_id === this.props.questionsId) {
      if (type === 'typing.start') qt.add(user.displayName);
      if (type === 'typing.stop') qt.delete(user.displayName);
    } else if (!ti && channel_id === this.props.chatId) {
      if (type === 'typing.start') ct.add(user.displayName);
      if (type === 'typing.stop') ct.delete(user.displayName);
    }
    if (type.match(/^(user.banned|user.unbanned|delete_user_messages)$/)) {
      await this.getChannels();
      this.client.user.banned = user.banned;
    }
    if (type === 'message.new') {
      if (user.id !== this.props.user.id) {
        if (this.fListY) {
          let { messages } = this.chatChannel.state;
          messages[messages.length - 1].new = true;
        }
        if (ti)
          this.questionsChannel.state.messages.find(m => m.id === message.id).reaction_counts = {
            upvote: 1,
          };
      } else {
        if (ti) {
          let msgToAddReact = this.questionsChannel.state.messages.find(m => m.id === message.id);
          msgToAddReact.own_reactions = [{ type: 'upvote', tbRemoved: true }];
          msgToAddReact.reaction_counts = { upvote: 1 };
        }
        delete this[`${ti ? 'questionsChannel' : 'chatChannel'}PendingMsg`];
      }
    }
    if (ti && type === 'reaction.new' && reaction.user_id === user.id) {
      let message = this.questionsChannel.state.messages.find(m => m.id === reaction.message_id);
      message.own_reactions = message.own_reactions.filter(or => !or.tbRemoved);
    }

    if (type?.includes('watching') && watcher_count) {
      if (channel_id === this.props.questionsId) {
        this.setState({questionViewers:watcher_count})
      } else {
        this.setState({chatViewers:watcher_count})
      }
    }
    if (type?.includes('typing')) {
      this.setState({
        [`${ti ? 'questions' : 'chat'}Typers`]: Array.from(ti ? qt : ct),
      });
    }
  };

  disconnectUser = async () => {
    this.client?.off(this.clientEventListener);
    await this.client?.disconnectUser?.();
  };

  renderFLItem = ({ item }, pinned) => (
    <ListItem
      editing={this.editMessage?.id === item.id}
      new={item.new}
      reversed={!isiOS && !pinned}
      isDark={this.props.isDark}
      appColor={this.props.appColor}
      key={item.id}
      onLayout={({ nativeEvent: ne }) => {
        if (item.new) {
          delete item.new;
          this.flatList.scrollTo({
            y: this.fListY + ne.layout.height,
            animated: false,
          });
        }
      }}
      onTap={() => this.floatingMenu?.close?.()}
      own={this.me.displayName === item.user.displayName}
      admin={this.me?.role === 'admin'}
      type={this.state.tabIndex ? 'question' : 'message'}
      pinned={pinned}
      hidden={pinned ? (this.state.isHidden.find(id => id === item.id) ? true : false) : undefined}
      item={item}
      onRemoveMessage={() => this.client.deleteMessage(item.id).catch(e => {})}
      onRemoveAllMessages={() => this.props.onRemoveAllMessages(item.user.id)}
      onToggleBlockStudent={() => this.props.onToggleBlockStudent(item.user)}
      onTogglePinMessage={() => {
        if (item.pinned) return this.client.unpinMessage(item).catch(e => {});
        this.chatChannel?.state.messages
          ?.filter(m => m.pinned)
          .sort((i, j) => (i.pinned_at < j.pinned_at ? 1 : -1))
          .slice(1)
          .map(m => this.client.unpinMessage(m).catch(e => {}));
        this.client.pinMessage(item).catch(e => {});
      }}
      onToggleHidden={id => {
        if (this.state.isHidden.find(id => item.id === id)) {
          this.setState({ isHidden: this.state.isHidden.filter(id => id !== item.id) });
        } else {
          this.setState({ isHidden: [...this.state.isHidden, id] });
        }
      }}
      onAnswered={() => this.client.deleteMessage(item.id).catch(e => {})}
      onToggleReact={() => {
        if (item.own_reactions.some(r => r.type === 'upvote'))
          this.questionsChannel.deleteReaction(item.id, 'upvote').catch(e => {});
        else this.questionsChannel.sendReaction(item.id, { type: 'upvote' }).catch(e => {});
      }}
      onEditMessage={() => {
        this.editMessage = item;
        this.setState({ keyboardVisible: true, comment: item.text });
      }}
    />
  );

  handleMessage = () => {
    if (this.editToBeCancelled) {
      this.setState({ keyboardVisible: false, comment: '' });
      return delete this.editMessage;
    }
    let channel = this.state.tabIndex ? 'questionsChannel' : 'chatChannel';
    let { user } = this.client;
    this.commentTextInput?.clear();
    this[channel]?.stopTyping();
    if (this.state.comment && !user.banned) {
      if (this.editMessage) {
        this.editMessage.text = this.state.comment;
        this.client
          ?.updateMessage({
            text: this.state.comment,
            id: this.editMessage.id,
          })
          .catch(e => {});
      } else {
        this[`${channel}PendingMsg`] = {
          user,
          text: this.state.comment,
          id: 1,
          created_at: new Date(),
        };
        if (channel === 'questionsChannel') {
          this[`${channel}PendingMsg`].own_reactions = [{ type: 'upvote', tbRemoved: true }];
          this[`${channel}PendingMsg`].reaction_counts = { upvote: 1 };
        }
        this.flatList?.scrollTo({ y: 0, animated: true });
        this[channel]
          ?.sendMessage({ text: this.state.comment })
          .then(({ message: { id } }) => {
            if (channel === 'questionsChannel') {
              this.questionsChannel.sendReaction(id, { type: 'upvote' }).catch(e => {});
            }
          })
          .catch(e => {});
      }
    }
    delete this.editMessage;
    this.setState({ keyboardVisible: false, comment: '' });
  };

  get editToBeCancelled() {
    return (
      this.editMessage?.text === this.state.comment || (this.editMessage && !this.state.comment)
    );
  }

  formatTypers = () => {
    let typers = this.state[this.state.tabIndex ? 'questionsTypers' : 'chatTypers'];
    if (!typers.length) return '';
    let firstTwo = typers.slice(0, 2).join(typers.length < 3 ? ' And ' : ', ');
    let remaining = typers.slice(2, typers.length);
    remaining = remaining.length
      ? ` And ${remaining.length} Other${remaining.length === 1 ? '' : 's'}`
      : '';
    let endString = ` ${typers.length < 2 ? 'Is' : 'Are'} Typing`;
    return firstTwo + remaining + endString;
  };

  loadMore = () =>
    this.setState({ loadingMore: true }, async () => {
      let { tabIndex } = this.state;
      let channel = tabIndex ? 'questionsChannel' : 'chatChannel';
      await this[channel].query({
        messages: { limit: 50, id_lt: this[channel].state.messages[0].id },
      });
      this.setState({ loadingMore: false });
    });

  render() {
    let {
      chatViewers,
      comment,
      keyboardVisible,
      loading,
      loadingMore,
      questionsViewers,
      showBlocked,
      showParticipants,
      tabIndex,
      showScrollToTop,
    } = this.state;
    let channel = tabIndex ? 'questionsChannel' : 'chatChannel';
    let { appColor, isDark } = this.props;
    if (!loading && !showParticipants && !showBlocked) {
      var messages = this[channel]?.state?.messages
        .slice()
        .reverse()
        ?.filter(m => m?.type !== 'deleted' && !m?.user.banned);
      if (this[`${channel}PendingMsg`]) messages.unshift(this[`${channel}PendingMsg`]);
      if (tabIndex) {
        messages = Object.values(
          messages
            .sort((i, j) =>
              i.reaction_counts?.upvote < j?.reaction_counts?.upvote ||
              i.reaction_counts?.upvote === undefined
                ? -1
                : 1
            )
            .reduce(function (r, a) {
              r[a.reaction_counts?.upvote] = r[a.reaction_counts?.upvote] || [];
              r[a.reaction_counts?.upvote].push(a);
              return r;
            }, Object.create(null))
        )
          .sort((i, j) =>
            i[0].reaction_counts?.upvote < j[0]?.reaction_counts?.upvote ||
            i[0].reaction_counts?.upvote === undefined
              ? -1
              : 1
          )
          .map(m => m.sort((i, j) => (i.created_at > j?.created_at ? -1 : 1)))
          .flat();
      }
      var pinned = messages
        ?.filter(m => m.pinned)
        .slice(-2)
        .sort((i, j) => (i.pinned_at < j.pinned_at ? -1 : 1));
    }
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
            appColor={this.props.appColor}
            admin={this.me?.role === 'admin'}
            onlineUsers={tabIndex ? questionsViewers : chatViewers}
            channel={this[channel]}
            onBack={() => this.setState({ showParticipants: false })}
            onBlockedStudents={() => this.setState({ showParticipants: false, showBlocked: true })}
          />
        ) : showBlocked ? (
          <BlockedUsers
            isDark={isDark}
            appColor={this.props.appColor}
            admin={this.me?.role === 'admin'}
            client={this.client}
            onBack={() => this.setState({ showBlocked: false })}
            onParticipants={() => this.setState({ showParticipants: true, showBlocked: false })}
            onUnblockStudent={user => this.props.onToggleBlockStudent(user)}
          />
        ) : (
          <>
            <View style={styles.tabMenu}>
              {tabs.map((t, i) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => this.setState({ tabIndex: i }, () => this.floatingMenu?.close())}
                  style={{
                    padding: 10,
                    marginHorizontal: 10,
                    borderBottomWidth: 2,
                    borderBottomColor:
                      tabIndex === i ? (isDark ? 'white' : appColor) : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color:
                        tabIndex === i
                          ? isDark
                            ? 'white'
                            : appColor
                          : isDark
                          ? '#445F74'
                          : '#879097',
                      fontFamily: 'OpenSans',
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {pinned?.map(item => this.renderFLItem({ item }, true))}
            <View style={{ flex: 1 }}>
              <FlatList
                key={tabIndex}
                inverted={isiOS}
                onScroll={({
                  nativeEvent: {
                    contentOffset: { y },
                  },
                }) => {
                  this.fListY = y >= 0 ? y : 0;
                  this.setState(({ showScrollToTop: sstt }) => {
                    if (y > 0 && !sstt) return { showScrollToTop: true };
                    if (y <= 0 && sstt) return { showScrollToTop: false };
                  });
                }}
                windowSize={10}
                data={messages}
                style={[styles.flatList, isiOS ? {} : { transform: [{scaleY: -1}] }]}
                initialNumToRender={1}
                maxToRenderPerBatch={10}
                onEndReachedThreshold={0.01}
                removeClippedSubviews={true}
                keyboardShouldPersistTaps='handled'
                renderItem={this.renderFLItem}
                onEndReached={this.loadMore}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                  <Text style={[styles.emptyListText, isiOS ? {} : { transform: [{scaleY: -1}] }]}>
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
                ref={r => (this.flatList = r?.getNativeScrollRef())}
              />
              {showScrollToTop && (
                <TouchableOpacity
                  onPress={() => this.flatList.scrollTo({ y: 0 })}
                  style={{
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
                  }}
                >
                  {arrowDown({ width: '70%', fill: 'white' })}
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => this.setState({ keyboardVisible: true }, this.floatingMenu?.close)}
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
                {this.editMessage
                  ? comment
                  : comment || `${tabIndex ? 'Ask a question' : 'Say something'}...`}
              </Text>
              <TouchableOpacity onPress={this.handleMessage} style={{ padding: 15 }}>
                {(this.editToBeCancelled ? x : sendMsg)({
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
              <Text style={styles.chatEventsInfo}>{this.formatTypers()}</Text>
            </View>
            <FloatingMenu
              isDark={isDark}
              appColor={appColor}
              ref={r => (this.floatingMenu = r)}
              admin={this.me?.role === 'admin'}
              onClearAllQuestions={
                tabIndex
                  ? () =>
                      this.questionsChannel.state.messages.map(m =>
                        this.client.deleteMessage(m.id).catch(e => {})
                      )
                  : undefined
              }
              onParticipants={() => this.setState({ showParticipants: true })}
              onBlockedStudents={() => this.setState({ showBlocked: true })}
            />
            <Modal
              onRequestClose={() => this.setState({ keyboardVisible: false })}
              onShow={() => setTimeout(() => this.commentTextInput?.focus(), isiOS ? 0 : 100)}
              supportedOrientations={['portrait', 'landscape']}
              transparent={true}
              visible={keyboardVisible}
            >
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'flex-end' }}
                onPress={() => this.setState({ keyboardVisible: false })}
              >
                <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'top']}>
                  <KeyboardAvoidingView
                    style={{ flex: 1, justifyContent: 'flex-end' }}
                    behavior={isiOS ? 'padding' : ''}
                  >
                    <View style={styles.textInputContainer}>
                      <View style={styles.whiteBG} >
                        <TextInput
                          fontFamily={'openSans'}
                          multiline={true}
                          blurOnSubmit={true}
                          style={[styles.textInput]}
                          onChangeText={cmnt => {
                            this.setState({ comment: cmnt });
                            this[channel]?.keystroke();
                          }}
                          placeholder={'Say something...'}
                          onSubmitEditing={this.handleMessage}
                          ref={r => (this.commentTextInput = r)}
                          keyboardAppearance={isDark ? 'dark': 'light'}
                          placeholderTextColor={isDark ? '#4D5356' : '#879097'}
                          returnKeyType={'send'}
                          value={comment}
                        />
                        <View onPress={this.handleMessage} style={{ padding: 15, backgroundColor: isDark ? 'black' : 'white' }}>
                          {(this.editToBeCancelled ? x : sendMsg)({
                            height: 12,
                            width: 12,
                            fill: isDark ? '#4D5356' : '#879097',
                          })}
                        </View>
                      </View>

                      <TouchableOpacity onPress={this.handleMessage} style={styles.sendTouchable} />
                    </View>
                  </KeyboardAvoidingView>
                </SafeAreaView>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      </SafeAreaView>
    );
  }
}

const setStyles = isDark =>
  StyleSheet.create({
    activityIndicator: { flex: 1, backgroundColor: isDark ? 'black' : 'white' },
    chatContainer: {
      flex: 1,
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
    },
    tabMenu: {
      flexDirection: 'row',
      alignItems: 'center',
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
    textInputContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
      alignItems: 'center',
    },
    textInput: {
      padding: 10,
      paddingTop: 10,
      flex: 1,
      color: isDark ? 'white' : 'black',
    },
    whiteBG: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'black' : 'white',
      flex: 1,
      margin: 10,
      borderRadius: 5,
      overflow: 'hidden',
    },
    sendTouchable: {
      height: 52,
      width: 52,
      position: 'absolute',
      end: 0
    },
  });
