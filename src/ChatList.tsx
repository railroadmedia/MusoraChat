import React, { FunctionComponent, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { arrowDown, sendMsg, x } from './svgs';
import { FormatMessageResponse } from 'stream-chat';

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

  pinned: FormatMessageResponse[];
  messages: FormatMessageResponse[];

  handleMessage: () => void;

  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  loadMore?: () => void;
  onTextBoxPress?: () => void;

  renderChatItem: (info: any, pinned: boolean) => JSX.Element;

  comment: string;
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

    handleMessage,

    onScroll,
    loadMore,
    onTextBoxPress,

    renderChatItem,

    pinned,
    messages,

    comment,
  } = props;

  const styles = localStyles(isDark, appColor);

  const flatList = useRef<FlatList<FormatMessageResponse>>(null);
  return (
    <>
      {pinned.map(item => renderChatItem({ item }, true))}
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
          renderItem={info => renderChatItem(info, false)}
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
