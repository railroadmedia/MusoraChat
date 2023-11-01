import React, { FunctionComponent, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { arrowDown, sendMsg, x } from './svgs';
import { FormatMessageResponse, StreamChat, UserResponse } from 'stream-chat';
import ListItem from './ListItem';

interface IChatList {
  appColor: string;
  isDark: boolean;
  isiOS: boolean;
  tabIndex: number;
  viewers: number;
  typers: string;
  editing: boolean;

  loadingMore: boolean;
  showScrollToTop: boolean;
  isKeyboardVisible: boolean;

  me: UserResponse;

  pinned: FormatMessageResponse[];
  messages: FormatMessageResponse[];
  hidden: string[];
  client: StreamChat;

  onMessageTap: () => void;
  handleMessage: () => void;

  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  loadMore?: () => void;
  onTextBoxPress?: () => void;

  comment: string;

  onRemoveAllMessages: (userId: string) => void;
  onToggleBlockStudent: (user?: UserResponse | null) => void;
  onTogglePinMessage: (message: FormatMessageResponse) => void;
  onToggleHidden: (id: string) => void;
  onAnswered: (id: string) => void;
  onToggleReact: (id: string) => void;
  onEditMessage: (message: FormatMessageResponse) => void;
}

const ChatList: FunctionComponent<IChatList> = props => {
  const {
    appColor,
    isDark,
    isiOS,
    tabIndex,
    viewers,
    typers,
    editing,

    loadingMore,
    showScrollToTop,
    isKeyboardVisible,

    me,

    onMessageTap,
    handleMessage,

    onScroll,
    loadMore,
    onTextBoxPress,

    pinned,
    messages,
    hidden,
    client,

    comment,

    onRemoveAllMessages,
    onToggleBlockStudent,
    onTogglePinMessage,
    onToggleHidden,
    onAnswered,
    onToggleReact,
    onEditMessage,
  } = props;

  const styles = localStyles(isDark, appColor);

  const flatList = useRef<FlatList<FormatMessageResponse>>(null);
  const fListY = useRef(0);

  const onMessageLayout = useCallback(
    ({ nativeEvent: ne }: LayoutChangeEvent, item: FormatMessageResponse) => {
      if (item.new) {
        delete item.new;
        flatList.current?.scrollToOffset({
          offset: fListY.current + ne.layout.height,
          animated: false,
        });
      }
    },
    []
  );

  const renderChatFLItem = useCallback(
    ({ item }: { item: FormatMessageResponse }, isPinned: boolean) => (
      <ListItem
        editing={editing}
        new={!!item.new}
        reversed={!isiOS && !isPinned}
        isDark={isDark}
        appColor={appColor}
        key={item.id}
        onLayout={e => onMessageLayout(e, item)}
        onTap={onMessageTap}
        own={me?.displayName === item.user?.displayName}
        admin={me?.role === 'admin'}
        type={tabIndex ? 'question' : 'message'}
        pinned={isPinned}
        hidden={isPinned ? (hidden.find(id => id === item.id) ? true : false) : undefined}
        item={item}
        onRemoveMessage={() => client.deleteMessage(item.id || '').catch(() => {})}
        onRemoveAllMessages={() => onRemoveAllMessages(item.user?.id || '')}
        onToggleBlockStudent={() => onToggleBlockStudent(item.user)}
        onTogglePinMessage={() => onTogglePinMessage(item)}
        onToggleHidden={onToggleHidden}
        onAnswered={() => onAnswered(item.id)}
        onToggleReact={() => onToggleReact(item.id)}
        onEditMessage={() => onEditMessage(item)}
      />
    ),
    [
      appColor,
      client,
      editing,
      hidden,
      isDark,
      isiOS,
      me?.displayName,
      me?.role,
      onAnswered,
      onEditMessage,
      onMessageLayout,
      onMessageTap,
      onRemoveAllMessages,
      onToggleBlockStudent,
      onToggleHidden,
      onTogglePinMessage,
      onToggleReact,
      tabIndex,
    ]
  );

  return (
    <>
      {pinned.map(item => renderChatFLItem({ item }, true))}
      <View style={{ flex: 1 }}>
        <FlatList
          key={tabIndex}
          inverted={isiOS}
          onScroll={onScroll}
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
          keyExtractor={item => item.id}
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
        onPress={onTextBoxPress}
        style={[
          styles.saySomethingTOpacity,
          {
            backgroundColor: isKeyboardVisible ? 'transparent' : isDark ? 'black' : 'white',
          },
        ]}
      >
        <Text
          style={[styles.placeHolderText, { opacity: isKeyboardVisible ? 0 : 1 }]}
          numberOfLines={1}
        >
          {comment || `${tabIndex ? 'Ask a question' : 'Say something'}...`}
        </Text>
        <TouchableOpacity onPress={handleMessage} style={{ padding: 15 }}>
          {(editing ? x : sendMsg)({
            height: 12,
            width: 12,
            fill: isKeyboardVisible ? 'transparent' : isDark ? '#4D5356' : '#879097',
          })}
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.chatEventsInfo}>{viewers} Online</Text>
        <Text style={styles.chatEventsInfo}>{typers}</Text>
      </View>
    </>
  );
};

const localStyles: StyleProp<any> = (isDark: boolean, appColor: string) =>
  StyleSheet.create({
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
    activityIndicator: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
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
    saySomethingTOpacity: {
      margin: 10,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    placeHolderText: {
      flex: 1,
      paddingLeft: 15,
      color: isDark ? '#4D5356' : '#879097',
      fontFamily: 'OpenSans',
    },
    chatEventsInfo: {
      padding: 10,
      paddingTop: 0,
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans',
    },
  });

export default ChatList;
