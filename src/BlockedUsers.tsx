import React, { FunctionComponent, useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FloatingMenu from './FloatingMenu';
import ListItem from './ListItem';
import { arrowLeft } from './svgs';

interface BlockedusersProps {
  admin: boolean;
  appColor: string;
  client?: any;
  isDark: boolean;
  onBack?: () => void;
  onParticipants: () => void;
  onUnblockStudent: (user: any) => void;
}

const BlockedUsers: FunctionComponent<BlockedusersProps> = props => {
  const { client, onBack, isDark, appColor, admin, onParticipants, onUnblockStudent } = props;
  const [blocked, setBlocked] = useState<{ [key: string]: any }>({});

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const styles = setStyles(isDark);

  const floatingMenu = useRef<any>(null);
  const flatList = useRef<any>(null);
  const itemHeight = useRef(0);
  const fListY = useRef(0);

  useEffect(() => {
    client?.on(toggleBanEventListener);
    client
      .queryUsers({ banned: true }, {}, { limit: 100, offset: 0 })
      .then(({ users }: { users: any[] }) => {
        let tempBlocked = { ...blocked };
        users.map((b: any) => (tempBlocked[b.id] = b));
        setLoading(false);
      });
    return client?.off(toggleBanEventListener);
  }, []);

  const toggleBanEventListener = ({ user, type }: { user: any; type: string }) => {
    let tempBlocked = { ...blocked };
    if (type === 'user.banned') tempBlocked[user.id] = user;
    if (type === 'user.unbanned') delete tempBlocked[user.id];
    setBlocked(tempBlocked);
  };

  const renderFLItem = useCallback(
    ({ item }: { item: any }) => (
      <ListItem
        isDark={isDark}
        appColor={appColor}
        onLayout={({ nativeEvent: ne }: { nativeEvent: any }) =>
          (itemHeight.current = ne.layout.height)
        }
        item={{ user: item }}
        center
        admin={admin}
        type={'banned'}
        onTap={() => floatingMenu.current?.close?.()}
        onToggleBlockStudent={() => {
          let tempBlocked = { ...blocked };
          delete blocked[item.id];

          setBlocked(tempBlocked);
          onUnblockStudent(item);
        }}
      />
    ),
    []
  );

  const loadMore = useCallback(async () => {
    setLoadingMore(true);

    await client
      .queryUsers({ banned: true }, {}, { limit: 100, offset: Object.keys(blocked).length })
      .then(({ users }: { users: any }) => {
        const tempBlocked = { ...blocked };
        users.map((b: any) => (tempBlocked[b.id] = b));
        setBlocked(tempBlocked);
      })
      .finally(() => setLoadingMore(false));
  }, []);

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
        >
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
        <>
          {
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
                <Text style={styles.emptyListText}>
                  There are no students blocked from this chat.
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
              ref={r => (flatList.current = r?.getNativeScrollRef())}
            />
          }
        </>
      )}
      <FloatingMenu
        admin={admin}
        ref={r => (floatingMenu.current = r)}
        onParticipants={onParticipants}
      />
    </>
  );
};

export default BlockedUsers;

const setStyles = (isDark: boolean) =>
  StyleSheet.create({
    activityIndicator: { flex: 1, backgroundColor: isDark ? 'black' : 'white' },
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
