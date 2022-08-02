import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FloatingMenu from './FloatingMenu';
import ListItem from './ListItem';
import { arrowLeft } from './svgs';

let styles;
export default class Participants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingMore: false,
      onlineUsers: props.onlineUsers
    };
    styles = setStyles(props.isDark);
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  componentDidMount() {
    this.props.channel?.on(
      'user.watching.stop',
      this.participantsStopEventListener
    );
    this.props.channel?.on(
      'user.watching.start',
      this.participantsStartEventListener
    );
    this.props.channel
      .query({ watchers: { limit: 100, offset: 0 } })
      .then(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    this.props.channel.off(this.participantsStartEventListener);
    this.props.channel.off(this.participantsStopEventListener);
  }

  participantsStartEventListener = ({ watcher_count }) =>
    this.setState({ onlineUsers: watcher_count }, () => {
      if (this.fListY)
        this.flatList.scrollTo({
          y: this.itemHeight + this.fListY,
          animated: false
        });
    });

  participantsStopEventListener = ({ watcher_count }) =>
    this.setState({ onlineUsers: watcher_count }, () => {
      if (this.fListY)
        this.flatList.scrollTo({
          y: this.fListY - this.itemHeight,
          animated: false
        });
    });

  renderFLItem = ({ item }) => (
    <ListItem
      isDark={this.props.isDark}
      appColor={this.props.appColor}
      item={{ user: item }}
      center
      onLayout={({ nativeEvent: ne }) => (this.itemHeight = ne.layout.height)}
      onTap={() => this.floatingMenu?.close?.()}
    />
  );

  loadMore = () =>
    this.setState({ loadingMore: true }, () => {
      this.props.channel
        .query({
          watchers: {
            limit: 100,
            offset: Object.keys(this.props.channel.state.watchers).length
          }
        })
        .then(() => this.setState({ loadingMore: false }));
    });

  render() {
    let { isDark } = this.props;
    let { loading, loadingMore, onlineUsers } = this.state;
    return (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={this.props.onBack}
            style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
          >
            {arrowLeft({
              height: 12,
              width: 12,
              fill: isDark ? '#4D5356' : '#879097'
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
                contentOffset: { y }
              }
            }) => (this.fListY = y >= 0 ? y : 0)}
            data={Object.values(this.props.channel.state.watchers)}
            style={styles.flatList}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            onEndReachedThreshold={0.01}
            removeClippedSubviews={true}
            keyboardShouldPersistTaps='handled'
            renderItem={this.renderFLItem}
            onEndReached={this.loadMore}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>No Participants</Text>
            }
            ListFooterComponent={
              <ActivityIndicator
                size='small'
                color={isDark ? 'white' : 'black'}
                animating={loadingMore}
                style={styles.activityindicator}
              />
            }
            ref={r => (this.flatList = r?.getNativeScrollRef())}
          />
        )}
        <Text style={styles.onlineUsers}>{onlineUsers} Online</Text>
        <FloatingMenu
          isDark={this.props.isDark}
          admin={this.props.admin}
          ref={r => (this.floatingMenu = r)}
          onBlockedStudents={this.props.onBlockedStudents}
        />
      </>
    );
  }
}

const setStyles = isDark =>
  StyleSheet.create({
    activityindicator: { flex: 1, backgroundColor: isDark ? 'black' : 'white' },
    titleText: {
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans'
    },
    flatList: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white'
    },
    onlineUsers: {
      padding: 10,
      paddingTop: 0,
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'OpenSans'
    },
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black'
    }
  });
