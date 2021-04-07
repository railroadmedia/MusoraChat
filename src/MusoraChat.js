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
  View
} from 'react-native';

import { StreamChat } from 'stream-chat';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';

import FloatingMenu from './FloatingMenu';
import Participants from './Participants';
import BlockedUsers from './BlockedUsers';
import ListItem from './ListItem';

import { sendMsg } from './svgs';

let styles,
  isiOS = Platform.OS === 'ios';
const tabs = ['CHAT', 'QUESTIONS'];
export default class MusoraChat extends React.Component {
  state = {
    chatTypers: [],
    chatViewers: 0,
    keyboardVisible: false,
    loading: true,
    loadingMore: false,
    questionsTypers: [],
    questionsViewers: 0,
    reloadingFlatList: false,
    showBlocked: false,
    showParticipants: false,
    tabIndex: 0
  };

  constructor(props) {
    super(props);
    this.client = StreamChat.getInstance(this.props.clientId);
    styles = setStyles(props.isDark);
  }

  componentDidMount() {
    if (!isiOS) AndroidKeyboardAdjust.setAdjustPan();
    this.connectUser()
      .then(this.getChannels)
      .then(() => {
        this.client?.on(this.clientEventListener);
        this.setState({
          loading: false,
          chatViewers: this.chatChannel?.state.watcher_count,
          questionsViewers: this.questionsChannel?.state.watcher_count
        });
      });
  }

  componentWillUnmount() {
    if (!isiOS) AndroidKeyboardAdjust.setAdjustResize();
    this.disconnectUser();
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  connectUser = async () => {
    let { id, gsToken } = this.props.user;
    this.me =
      this.client.user ||
      (await this.client.connectUser({ id: `${id}` }, gsToken)).me;
  };

  getChannels = async () => {
    let { chatId, questionsId } = this.props;
    let channels = await this.client.queryChannels(
      {
        id: { $in: [this.props.chatId, this.props.questionsId] }
      },
      [{}],
      { message_limit: 200 }
    );
    this.chatChannel = channels.find(channel => channel.id === chatId);
    this.questionsChannel = channels.find(
      channel => channel.id === questionsId
    );
  };

  clientEventListener = async ({
    type,
    user,
    watcher_count,
    channel_id,
    reaction
  }) => {
    if (type === 'health.check') return;
    if (type.includes('reaction') && reaction.type !== 'vote') return;
    let {
      chatTypers,
      chatViewers,
      questionsTypers,
      questionsViewers,
      tabIndex: ti
    } = this.state;
    let ct = new Set(chatTypers);
    let qt = new Set(questionsTypers);
    if (ti && channel_id === this.props.questionsId) {
      if (type === 'typing.start') qt.add(user.displayName);
      if (type === 'typing.stop') qt.delete(user.displayName);
    } else if (!ti && channel_id === this.props.chatId) {
      if (type === 'typing.start') ct.add(user.displayName);
      if (type === 'typing.stop') ct.delete(user.displayName);
    }
    if (type.match(/^(user.banned|user.unbanned|delete_user_messages)$/))
      await this.getChannels();
    this.setState(
      {
        [`${ti ? 'questions' : 'chat'}Viewers`]:
          watcher_count || (ti ? questionsViewers : chatViewers),
        [`${ti ? 'questions' : 'chat'}Typers`]: Array.from(ti ? qt : ct)
      },
      () => {
        if (this.fListY)
          if (type === 'message.new')
            this.flatList.scrollTo({
              y: this.itemHeight + this.fListY,
              animated: false
            });
          else if (type === 'message.deleted')
            this.flatList.scrollTo({
              y: this.fListY - this.itemHeight,
              animated: false
            });
      }
    );
  };

  disconnectUser = async () => {
    this.client?.off(this.clientEventListener);
    this.client?.disconnectUser?.();
  };

  renderFLItem = ({ item }, pinned) => (
    <ListItem
      reversed={!isiOS}
      isDark={this.props.isDark}
      appColor={this.props.appColor}
      key={item.id}
      onLayout={({ nativeEvent: ne }) => (this.itemHeight = ne.layout.height)}
      onTap={() => this.floatingMenu?.close?.()}
      own={this.me.displayName === item.user.displayName}
      admin={this.me?.role === 'admin'}
      type={this.state.tabIndex ? 'question' : 'message'}
      pinned={pinned}
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
      onAnswered={() => this.client.deleteMessage(item.id).catch(e => {})}
      onToggleReact={() => {
        if (item.own_reactions.some(r => r.type === 'upvote'))
          this.questionsChannel
            .deleteReaction(item.id, 'upvote')
            .catch(e => {});
        else
          this.questionsChannel
            .sendReaction(item.id, { type: 'upvote' })
            .catch(e => {});
      }}
    />
  );

  sendMessage = ({ nativeEvent: { text } }) => {
    this.commentTextInput?.clear();
    this[
      this.state.tabIndex ? 'questionsChannel' : 'chatChannel'
    ]?.stopTyping();
    this.setState({ keyboardVisible: false });
    if (text)
      this[this.state.tabIndex ? 'questionsChannel' : 'chatChannel']
        ?.sendMessage({
          text
        })
        .catch(e => {});
  };

  formatTypers = () => {
    let typers = this.state[
      this.state.tabIndex ? 'questionsTypers' : 'chatTypers'
    ];
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
        messages: { limit: 50, id_lt: this[channel].state.messages[0].id }
      });
      this.setState({ loadingMore: false });
    });

  render() {
    let {
      chatViewers,
      keyboardVisible,
      loading,
      loadingMore,
      questionsViewers,
      reloadingFlatList,
      showBlocked,
      showParticipants,
      tabIndex
    } = this.state;
    let { appColor, isDark } = this.props;
    if (!loading && !showParticipants && !showBlocked) {
      var messages = this[
        tabIndex ? 'questionsChannel' : 'chatChannel'
      ]?.state?.messages
        .slice()
        .reverse()
        ?.filter(m => m.type !== 'deleted' && !m.user.banned);
      if (tabIndex)
        messages?.sort((i, j) =>
          i.reaction_counts?.upvote < j?.reaction_counts?.upvote ||
          i.reaction_counts?.upvote === undefined
            ? -1
            : 1
        );
      var pinned = messages
        ?.filter(m => m.pinned)
        .slice(-2)
        .sort((i, j) => (i.pinned_at < j.pinned_at ? -1 : 1));
    }
    return (
      <View style={styles.chatContainer}>
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
            channel={this[tabIndex ? 'questionsChannel' : 'chatChannel']}
            onBack={() =>
              this.setState({ showParticipants: false }, () =>
                setTimeout(() => this.setState({ reloadingFlatList: false }), 0)
              )
            }
            onBlockedStudents={() =>
              this.setState({
                reloadingFlatList: true,
                showParticipants: false,
                showBlocked: true
              })
            }
          />
        ) : showBlocked ? (
          <BlockedUsers
            isDark={isDark}
            appColor={this.props.appColor}
            admin={this.me?.role === 'admin'}
            client={this.client}
            onBack={() =>
              this.setState({ showBlocked: false }, () =>
                setTimeout(() => this.setState({ reloadingFlatList: false }), 0)
              )
            }
            onParticipants={() =>
              this.setState({
                reloadingFlatList: true,
                showParticipants: true,
                showBlocked: false
              })
            }
            onUnblockStudent={user => this.props.onToggleBlockStudent(user)}
          />
        ) : (
          <>
            <View style={styles.tabMenu}>
              {tabs.map((t, i) => (
                <TouchableOpacity
                  key={t}
                  onPress={() =>
                    this.setState(
                      { tabIndex: i, reloadingFlatList: true },
                      () => {
                        this.floatingMenu?.close();
                        setTimeout(
                          () => this.setState({ reloadingFlatList: false }),
                          0
                        );
                      }
                    )
                  }
                  style={{
                    padding: 10,
                    marginHorizontal: 10,
                    borderBottomWidth: 2,
                    borderBottomColor:
                      tabIndex === i
                        ? isDark
                          ? 'white'
                          : appColor
                        : 'transparent'
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
                      fontFamily: 'RobotoCondensed-Regular'
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {pinned?.map(item => this.renderFLItem({ item }, true))}
            {reloadingFlatList ? (
              <ActivityIndicator
                size='large'
                color={isDark ? 'white' : 'black'}
                style={styles.activityIndicator}
              />
            ) : (
              <FlatList
                inverted={isiOS}
                onScroll={({
                  nativeEvent: {
                    contentOffset: { y }
                  }
                }) => (this.fListY = y >= 0 ? y : 0)}
                windowSize={10}
                data={messages}
                style={[styles.flatList, isiOS ? {} : { scaleY: -1 }]}
                initialNumToRender={50}
                maxToRenderPerBatch={10}
                onEndReachedThreshold={0.01}
                removeClippedSubviews={true}
                keyboardShouldPersistTaps='handled'
                renderItem={this.renderFLItem}
                onEndReached={this.loadMore}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
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
            )}
            <TouchableOpacity
              onPress={() =>
                this.setState(
                  { keyboardVisible: true },
                  this.floatingMenu?.close
                )
              }
              style={styles.saySomethingTOpacity}
            >
              <Text style={styles.placeHolderText}>
                {tabIndex ? 'Ask a question' : 'Say something'}...
              </Text>
              {sendMsg({
                height: 12,
                width: 12,
                fill: isDark ? '#4D5356' : '#879097'
              })}
            </TouchableOpacity>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
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
              onParticipants={() =>
                this.setState({
                  showParticipants: true,
                  reloadingFlatList: true
                })
              }
              onBlockedStudents={() =>
                this.setState({ showBlocked: true, reloadingFlatList: true })
              }
            />
            <Modal
              onRequestClose={() => this.setState({ keyboardVisible: false })}
              onShow={() =>
                setTimeout(
                  () => this.commentTextInput?.focus(),
                  isiOS ? 0 : 100
                )
              }
              supportedOrientations={['portrait', 'landscape']}
              transparent={true}
              visible={keyboardVisible}
            >
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'flex-end' }}
                onPress={() => this.setState({ keyboardVisible: false })}
              >
                <KeyboardAvoidingView
                  style={{ flex: 1, justifyContent: 'flex-end' }}
                  behavior={isiOS ? 'padding' : ''}
                >
                  <View style={styles.textInputContainer}>
                    <TextInput
                      multiline={true}
                      blurOnSubmit={true}
                      style={styles.textInput}
                      onChangeText={() =>
                        this[
                          tabIndex ? 'questionsChannel' : 'chatChannel'
                        ]?.keystroke()
                      }
                      placeholder={'Say something...'}
                      onSubmitEditing={this.sendMessage}
                      ref={r => (this.commentTextInput = r)}
                      keyboardAppearance={'dark'}
                      placeholderTextColor={isDark ? '#4D5356' : '#879097'}
                      returnKeyType={'send'}
                    />
                  </View>
                </KeyboardAvoidingView>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      </View>
    );
  }
}

const setStyles = isDark =>
  StyleSheet.create({
    activityIndicator: { flex: 1, backgroundColor: isDark ? 'black' : 'white' },
    chatContainer: {
      flex: 1,
      backgroundColor: isDark ? '#00101D' : '#F2F3F5'
    },
    tabMenu: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    flatList: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
      borderTopWidth: isDark ? 0 : 2,
      borderBottomWidth: isDark ? 0 : 2,
      borderColor: 'rgba(0,0,0,.1)'
    },
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black'
    },
    saySomethingTOpacity: {
      padding: 15,
      margin: 10,
      borderRadius: 5,
      backgroundColor: isDark ? 'black' : 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    chatEventsInfo: {
      padding: 10,
      paddingTop: 0,
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans'
    },
    placeHolderText: {
      color: isDark ? '#4D5356' : '#879097',
      fontFamily: 'OpenSans'
    },
    textInputContainer: {
      padding: 15,
      backgroundColor: isDark ? '#1E1E1E' : '#F2F3F5'
    },
    textInput: {
      padding: 10,
      color: isDark ? 'white' : 'black',
      backgroundColor: isDark ? 'black' : 'white',
      borderRadius: 10
    }
  });
