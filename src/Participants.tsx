import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FloatingMenu, { IFloatingMenuRef } from './FloatingMenu';
import ListItem from './ListItem';
import { arrowLeft } from './svgs';
import { IChannelType, IChatUser } from './types';

interface IParticipans {
  isDark: boolean;
  appColor: string;
  admin: boolean;
  onlineUsers: number;
  channel?: IChannelType;
  onBack: () => void;
  onBlockedStudents: () => void;
}

const Participans: FunctionComponent<IParticipans> = props => {
  const {
    isDark,
    appColor,
    admin,
    onlineUsers: onlineUsersProp,
    channel,
    onBack,
    onBlockedStudents,
  } = props;
  const styles = setStyles(isDark);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(onlineUsersProp);

  const fListY = useRef<number>(0);
  const itemHeight = useRef<number>(0);
  const flatList = useRef<FlatList>(null);
  const floatingMenu = useRef<IFloatingMenuRef>(null);

  const participantsStartEventListener = useCallback(
    ({ watcher_count }: { watcher_count?: number }) => {
      setOnlineUsers(watcher_count || 0);
      if (fListY) {
        flatList.current?.scrollToOffset({
          offset: itemHeight.current + fListY.current,
          animated: false,
        });
      }
    },
    []
  );

  const participantsStopEventListener = useCallback(
    ({ watcher_count }: { watcher_count?: number }) => {
      setOnlineUsers(watcher_count || 0);
      if (fListY.current) {
        flatList.current?.scrollToOffset({
          offset: fListY.current - itemHeight.current,
          animated: false,
        });
      }
    },
    []
  );

  useEffect(() => {
    channel?.on('user.watching.stop', participantsStopEventListener);
    channel?.on('user.watching.start', participantsStartEventListener);
    channel?.query({ watchers: { limit: 100, offset: 0 } }).then(() => setLoading(false));

    return () => {
      channel?.off(participantsStartEventListener);
      channel?.off(participantsStopEventListener);
    };
  }, [channel, participantsStartEventListener, participantsStopEventListener]);

  const renderFLItem = useCallback(
    ({ item }: { item: IChatUser }) => (
      <ListItem
        isDark={isDark}
        appColor={appColor}
        item={{
          user: item,
          id: '',
          created_at: new Date(),
          updated_at: new Date(),
          pinned_at: new Date(),
          status: '',
          type: 'regular',
        }}
        center
        onLayout={({ nativeEvent: ne }: LayoutChangeEvent) =>
          (itemHeight.current = ne.layout.height)
        }
        onTap={() => floatingMenu.current?.close?.()}
      />
    ),
    [appColor, isDark]
  );

  const loadMore = useCallback(() => {
    if (loadingMore) {
      return;
    }
    setLoadingMore(true);
    channel
      ?.query({
        watchers: {
          limit: 100,
          offset: Object.keys(channel.state.watchers).length,
        },
      })
      .then(() => setLoadingMore(false));
  }, [channel, loadingMore]);

  return (
    <>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          {arrowLeft({
            height: 12,
            width: 12,
            fill: isDark ? '#4D5356' : '#879097',
          })}
          <Text style={styles.titleText}>PARTICIPANTS</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size='large'
          color={isDark ? 'white' : 'black'}
          style={styles.activityindicator}
        />
      ) : (
        <FlatList
          windowSize={10}
          onScroll={({
            nativeEvent: {
              contentOffset: { y },
            },
          }) => (fListY.current = y >= 0 ? y : 0)}
          data={Object.values(channel?.state.watchers || {})}
          style={styles.flatList}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.01}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps='handled'
          renderItem={renderFLItem}
          onEndReached={loadMore}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyListText}>No Participants</Text>}
          ListFooterComponent={
            <ActivityIndicator
              size='small'
              color={isDark ? 'white' : 'black'}
              animating={loadingMore}
              style={styles.activityindicator}
            />
          }
          ref={flatList}
        />
      )}
      <Text style={styles.onlineUsers}>{onlineUsers} Online</Text>
      <FloatingMenu
        isDark={isDark}
        admin={admin}
        ref={floatingMenu}
        onBlockedStudents={onBlockedStudents}
        appColor={appColor}
      />
    </>
  );
};

export default Participans;

const setStyles: StyleProp<any> = (isDark: boolean) =>
  StyleSheet.create({
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    activityindicator: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
    },
    titleText: {
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans',
    },
    flatList: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white',
    },
    onlineUsers: {
      padding: 10,
      paddingTop: 0,
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans',
    },
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black',
    },
  });
