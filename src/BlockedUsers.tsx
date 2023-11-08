import React, { FunctionComponent, useState, useEffect, useRef, useCallback } from 'react';
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
import { IChatType, IChatUser, IEventType } from './types';

interface IBlockedusersProps {
  admin: boolean;
  appColor: string;
  client?: IChatType;
  isDark: boolean;
  onBack?: () => void;
  onParticipants: () => void;
  onUnblockStudent: (user: IChatUser) => void;
}

const BlockedUsers: FunctionComponent<IBlockedusersProps> = props => {
  const { client, onBack, isDark, appColor, admin, onParticipants, onUnblockStudent } = props;
  const [blocked, setBlocked] = useState<{ [key: string]: IChatUser }>({});

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const styles = setStyles(isDark);

  const floatingMenu = useRef<IFloatingMenuRef>(null);
  const flatList = useRef<FlatList>(null);
  const itemHeight = useRef(0);
  const fListY = useRef(0);

  const toggleBanEventListener = useCallback(
    ({ user, type }: IEventType) => {
      if (user === undefined) {
        return;
      }
      const tempBlocked = { ...blocked };
      if (type === 'user.banned') {
        tempBlocked[user.id] = user;
      }
      if (type === 'user.unbanned') {
        delete tempBlocked[user.id];
      }
      setBlocked(tempBlocked);
    },
    [blocked]
  );

  useEffect(() => {
    client?.on(toggleBanEventListener);
    client
      ?.queryUsers({ banned: true }, {}, { limit: 100, offset: 0 })
      .then(({ users }: { users: IChatUser[] }) => {
        const tempBlocked = { ...blocked };
        users.map((b: IChatUser) => (tempBlocked[b.id] = b));
        setLoading(false);
      });
    return client?.off(toggleBanEventListener);
  }, [blocked, client, toggleBanEventListener]);

  const onToggleBlock = useCallback(
    (item: IChatUser) => {
      const tempBlocked = { ...blocked };
      delete blocked[item.id];

      setBlocked(tempBlocked);
      onUnblockStudent(item);
    },
    [blocked, onUnblockStudent]
  );

  const renderFLItem = useCallback(
    ({ item }: { item: IChatUser }) => (
      <ListItem
        isDark={isDark}
        appColor={appColor}
        onLayout={({ nativeEvent: ne }: LayoutChangeEvent) =>
          (itemHeight.current = ne.layout.height)
        }
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
        admin={admin}
        type={'banned'}
        onTap={() => floatingMenu.current?.close()}
        onToggleBlockStudent={() => onToggleBlock(item)}
      />
    ),
    [admin, appColor, isDark, onToggleBlock]
  );

  const loadMore = useCallback(async () => {
    if (client === undefined) {
      return;
    }
    setLoadingMore(true);

    await client
      .queryUsers({ banned: true }, {}, { limit: 100, offset: Object.keys(blocked).length })
      .then(({ users }: { users: IChatUser[] }) => {
        const tempBlocked = { ...blocked };
        users.map((b: IChatUser) => (tempBlocked[b.id] = b));
        setBlocked(tempBlocked);
      })
      .finally(() => setLoadingMore(false));
  }, [blocked, client]);

  return (
    <>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          {arrowLeft({ height: 12, width: 12, fill: '#4D5356' })}
          <Text style={styles.titleText}>BLOCKED STUDENTS</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size='large'
          color={isDark ? 'white' : 'black'}
          style={styles.activityIndicator}
        />
      ) : (
        <FlatList
          onScroll={({
            nativeEvent: {
              contentOffset: { y },
            },
          }) => (fListY.current = y >= 0 ? y : 0)}
          windowSize={10}
          data={Object.values(blocked)}
          style={styles.flatList}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.01}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps='handled'
          renderItem={renderFLItem}
          onEndReached={loadMore}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>There are no students blocked from this chat.</Text>
          }
          ListFooterComponent={
            <ActivityIndicator
              size='small'
              color={isDark ? 'white' : 'black'}
              animating={loadingMore}
              style={styles?.activityIndicator}
            />
          }
          ref={flatList}
        />
      )}
      <FloatingMenu
        admin={admin}
        ref={floatingMenu}
        onParticipants={onParticipants}
        isDark={isDark}
        appColor={appColor}
      />
    </>
  );
};

export default BlockedUsers;

const setStyles = (isDark: boolean): StyleProp<any> =>
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
    activityIndicator: {
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
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black',
    },
  });
