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
export default class BlockedUsers extends React.Component {
  blocked = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingMore: false
    };
    styles = setStyles(props.isDark);
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  componentDidMount() {
    this.props.client?.on(this.toggleBanEventListener);
    this.props.client
      .queryUsers({ banned: true }, {}, { limit: 100, offset: 0 })
      .then(({ users }) => {
        users.map(b => (this.blocked[b.id] = b));
        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    this.props.client?.off(this.toggleBanEventListener);
  }

  toggleBanEventListener = ({ user, type }) => {
    if (type === 'user.banned') this.blocked[user.id] = user;
    if (type === 'user.unbanned') delete this.blocked[user.id];
    this.setState({});
  };

  renderFLItem = ({ item }) => (
    <ListItem
      isDark={this.props.isDark}
      appColor={this.props.appColor}
      onLayout={({ nativeEvent: ne }) => (this.itemHeight = ne.layout.height)}
      item={{ user: item }}
      center
      admin={this.props.admin}
      type={'banned'}
      onTap={() => this.floatingMenu?.close?.()}
      onToggleBlockStudent={() => {
        delete this.blocked[item.id];
        this.setState({});
        this.props.onUnblockStudent(item);
      }}
    />
  );

  loadMore = () =>
    this.setState({ loadingMore: true }, () => {
      this.props.client
        .queryUsers(
          { banned: true },
          {},
          { limit: 100, offset: Object.keys(this.blocked).length }
        )
        .then(({ users }) => {
          users.map(b => (this.blocked[b.id] = b));
          this.setState({ loadingMore: false });
        });
    });

  render() {
    let { isDark } = this.props;
    return (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={this.props.onBack}
            style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
          >
            {arrowLeft({ height: 12, width: 12, fill: '#4D5356' })}
            <Text style={styles.titleText}>BLOCKED STUDENTS</Text>
          </TouchableOpacity>
        </View>
        {this.state.loading ? (
          <ActivityIndicator
            size='large'
            color={isDark ? 'white' : 'black'}
            style={styles.activityIndicator}
          />
        ) : (
          <FlatList
            onScroll={({
              nativeEvent: {
                contentOffset: { y }
              }
            }) => (this.fListY = y >= 0 ? y : 0)}
            windowSize={10}
            data={Object.values(this.blocked)}
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
              <Text style={styles.emptyListText}>
                There are no students blocked from this chat.
              </Text>
            }
            ListFooterComponent={
              <ActivityIndicator
                size='small'
                color={isDark ? 'white' : 'black'}
                animating={this.state.loadingMore}
                style={styles.activityIndicator}
              />
            }
            ref={r => (this.flatList = r?.getNativeScrollRef())}
          />
        )}
        <FloatingMenu
          admin={this.props.admin}
          ref={r => (this.floatingMenu = r)}
          onParticipants={this.props.onParticipants}
        />
      </>
    );
  }
}

const setStyles = isDark =>
  StyleSheet.create({
    activityIndicator: { flex: 1, backgroundColor: isDark ? 'black' : 'white' },
    titleText: {
      color: isDark ? '#445F74' : '#879097',
      fontFamily: 'RobotoCondensed-Regular'
    },
    flatList: {
      flex: 1,
      backgroundColor: isDark ? 'black' : 'white'
    },
    emptyListText: {
      padding: 10,
      textAlign: 'center',
      color: isDark ? 'white' : 'black'
    }
  });
