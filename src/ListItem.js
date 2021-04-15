import React from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import reactions from './reactions';
import { pin, vote, close, coach, team, edge, lifetime, plus } from './svgs';

let styles;
let openedReactions = [];
export default class ListItem extends React.Component {
  reactionScale = new Animated.Value(0);

  constructor(props) {
    super(props);
    styles = setStyles(props.isDark);

    this.state = {
      reactionVisible: false,
      position: props.new ? 'absolute' : 'relative',
      answeredModalVisible: false,
      blockModalVisible: false,
      optionsModalVisible: false,
      pinModalVisible: false,
      removeModalVisible: false,
      removeAllModalVisible: false
    };
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  pickItem = nextModal =>
    this.setState(
      { optionsModalVisible: false },
      nextModal
        ? () => this.setState({ [nextModal]: true })
        : this.props.onTogglePinMessage
    );

  confirm = propAction =>
    this.setState(
      {
        answeredModalVisible: false,
        blockModalVisible: false,
        removeModalVisible: false,
        removeAllModalVisible: false
      },
      this.props[propAction]
    );

  renderModal = (msgComponent, stateModal, confirmAction, confirmText) => (
    <Modal
      transparent={true}
      animationType={'slide'}
      visible={this.state[stateModal]}
      onRequestClose={() => this.setState({ [stateModal]: false })}
    >
      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'flex-end' }}
        onPress={() => this.setState({ [stateModal]: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pill} />
          {msgComponent}
          <TouchableOpacity
            style={[
              styles.confirmationBtn,
              { backgroundColor: this.props.appColor }
            ]}
            onPress={() => this.confirm(confirmAction)}
          >
            <Text style={styles.confirmationBrnText}>
              {confirmText || 'CONFIRM'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  closeReaction = () => {
    if (openedReactions.length) {
      openedReactions.map(or =>
        Animated.timing(or.reactionScale, {
          duration: 300,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
          toValue: 0
        }).start(() => or.setState({ reactionVisible: false }))
      );
      openedReactions = [];
      return true;
    }
  };

  render() {
    let {
      admin,
      appColor,
      center,
      item,
      item: {
        user: { accessLevelName: aln }
      },
      own,
      isDark,
      pinned,
      reversed,
      type
    } = this.props;
    let { optionsModalVisible, position, reactionVisible } = this.state;
    let borderColor, userTagIcon;
    switch (aln) {
      case 'edge': {
        borderColor = appColor;
        userTagIcon = edge;
        break;
      }
      case 'team': {
        borderColor = 'black';
        userTagIcon = team;
        break;
      }
      case 'lifetime': {
        borderColor = '#07B3FF';
        userTagIcon = lifetime;
        break;
      }
      case 'coach': {
        borderColor = '#FAA300';
        userTagIcon = coach;
        break;
      }
    }
    let nonVotingReactions = item.latest_reactions
      ?.filter(lr => lr.reaction)
      ?.map(lr => lr.reaction);
    return (
      <>
        <TouchableOpacity
          onLayout={e => {
            if (position === 'absolute')
              this.setState({ position: 'relative' });
            this.props.onLayout(e);
          }}
          style={[
            {
              position,
              padding: 10,
              flexDirection: 'row',
              alignItems: center ? 'center' : 'flex-start',
              backgroundColor: pinned ? (isDark ? '#0C131B' : 'white') : ''
            },
            reversed ? { scaleY: -1 } : {}
          ]}
          onLongPress={() => {
            this.closeReaction();
            openedReactions.push(this);
            this.setState({ reactionVisible: true }, () => {
              Animated.timing(this.reactionScale, {
                duration: 300,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
                toValue: 1
              }).start();
            });
          }}
          onPress={() => {
            if (this.closeReaction()) return;
            this.props.onTap?.();
            if (admin && type === 'banned')
              return this.pickItem('blockModalVisible');
            if (admin || own) this.setState({ optionsModalVisible: true });
          }}
        >
          <View
            style={{
              borderRadius: 99,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor
            }}
          >
            <Image
              source={{ uri: item.user.avatarUrl }}
              style={{ height: 31, aspectRatio: 1 }}
            />
            <View
              style={{
                width: '100%',
                height: 5,
                backgroundColor: borderColor,
                position: 'absolute',
                bottom: 0,
                lineHeight: 5,
                alignItems: 'center'
              }}
            >
              {userTagIcon?.({ height: 5, fill: 'white' })}
            </View>
          </View>
          <View style={{ paddingHorizontal: 10, flex: 1 }}>
            {pinned && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {pin({ width: 9, fill: '#9EA1A6' })}
                <Text style={styles.pinnedText}> Pinned</Text>
              </View>
            )}
            <View style={styles.msgHeaderContainer}>
              <Text style={styles.displayName}>{item.user.displayName}</Text>
              <Text style={styles.timestamp}>
                {item.created_at?.toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </Text>
            </View>
            {item.text && <Text style={styles.msgText}>{item.text}</Text>}
            {!!nonVotingReactions?.length && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  padding: 2,
                  borderRadius: 50,
                  backgroundColor: isDark ? '#445F74' : '#879097'
                }}
              >
                <Text>{nonVotingReactions.join('')}</Text>
              </View>
            )}
            {type === 'question' && (
              <TouchableOpacity
                onPress={() => this.props.onToggleReact('upvote')}
                style={styles.voteTOpacity}
              >
                {vote({
                  width: 10,
                  height: 10,
                  fill: item.own_reactions?.some(r => r.type === 'upvote')
                    ? '#00BC75'
                    : isDark
                    ? 'white'
                    : 'black'
                })}
                <Text
                  style={{
                    color: !item?.reaction_counts?.upvote
                      ? isDark
                        ? 'black'
                        : 'white'
                      : item.own_reactions?.some(r => r.type === 'upvote')
                      ? '#00BC75'
                      : appColor,
                    paddingHorizontal: 5
                  }}
                >
                  {item?.reaction_counts?.upvote || 0}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {admin && type === 'banned' && (
            <>
              <Text style={styles.unblockText}>Unblock</Text>
              {close({ width: 15, height: 15, fill: '#9EA1A6' })}
            </>
          )}
        </TouchableOpacity>
        <Modal
          transparent={true}
          animationType={'slide'}
          visible={optionsModalVisible}
          onRequestClose={() => this.setState({ optionsModalVisible: false })}
        >
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'flex-end' }}
            onPress={() => this.setState({ optionsModalVisible: false })}
          >
            <View style={styles.modalContainer}>
              <View style={styles.pill} />
              {admin && (
                <>
                  <Text style={styles.modalHeader}>Moderation</Text>
                  {type === 'message' && (
                    <TouchableOpacity onPress={() => this.pickItem()}>
                      <Text style={styles.itemText}>
                        {item.pinned ? 'Unpin' : 'Pin'} Message
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              {type === 'question' && admin && (
                <TouchableOpacity
                  onPress={() => this.pickItem('answeredModalVisible')}
                >
                  <Text style={styles.itemText}>Mark As Answered</Text>
                </TouchableOpacity>
              )}
              {[{ text: 'Remove Message', nextModal: 'removeModalVisible' }]
                .concat(
                  admin
                    ? [
                        {
                          text: 'Remove All Messages',
                          nextModal: 'removeAllModalVisible'
                        },
                        {
                          text: item.user.banned
                            ? 'Unblock Student'
                            : 'Block Student',
                          nextModal: 'blockModalVisible'
                        }
                      ]
                    : []
                )
                .map(({ text, nextModal }) => (
                  <TouchableOpacity
                    key={text}
                    onPress={() => this.pickItem(nextModal)}
                  >
                    <Text style={styles.itemText}>{text}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {this.renderModal(
          <Text style={styles.confirmModalText}>
            Are you sure you want to remove this message?
          </Text>,
          'removeModalVisible',
          'onRemoveMessage'
        )}
        {this.renderModal(
          <Text style={styles.confirmModalText}>
            Are you sure you want to delete all of{' '}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>
              {item.user.displayName}
            </Text>{' '}
            messages?
          </Text>,
          'removeAllModalVisible',
          'onRemoveAllMessages'
        )}
        {this.renderModal(
          <Text style={styles.confirmModalText}>
            Are you sure you want to {item.user.banned ? 'unblock ' : 'block '}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>
              {item.user.displayName}
            </Text>
            {item.user.banned ? '?' : ' from this chat?'}
          </Text>,
          'blockModalVisible',
          'onToggleBlockStudent',
          item.user.banned ? 'CONFIRM' : 'BLOCK'
        )}
        {this.renderModal(
          <Text style={styles.confirmModalText}>
            Are you sure you want to mark this question as answered?{`\n`}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>
              This will remove the question from the chat.
            </Text>
          </Text>,
          'answeredModalVisible',
          'onAnswered'
        )}
        {reactionVisible && (
          <Animated.View
            style={[
              styles.reactionAView,
              { transform: [{ scale: this.reactionScale }] }
            ]}
          >
            {reactions.slice(0, 6).map(r => (
              <Text
                key={r}
                style={{ fontSize: 40, paddingHorizontal: 5 }}
                onPress={() => {
                  this.closeReaction();
                  this.props.onToggleReact(r);
                }}
              >
                {r}
              </Text>
            ))}
            <TouchableOpacity
              onPress={() => {
                this.closeReaction();
                this.props.onMoreReactions(item.id);
              }}
              style={{ padding: 5, paddingRight: 10 }}
            >
              {plus({ width: 20, height: 20, fill: appColor })}
            </TouchableOpacity>
          </Animated.View>
        )}
      </>
    );
  }
}
const setStyles = isDark =>
  StyleSheet.create({
    msgHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    displayName: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans-Bold'
    },
    timestamp: {
      fontFamily: 'OpenSans',
      color: '#4D5356',
      fontSize: 8
    },
    pinnedText: {
      fontFamily: 'OpenSans',
      color: '#9EA1A6',
      fontSize: 10
    },
    voteTOpacity: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5
    },
    msgText: {
      fontFamily: 'OpenSans',
      fontWeight: 'normal',
      color: isDark ? 'white' : 'black'
    },
    unblockText: {
      color: '#4D5356',
      fontFamily: 'OpenSans',
      paddingHorizontal: 5
    },
    modalContainer: {
      backgroundColor: '#081825',
      padding: 20,
      borderTopEndRadius: 20,
      borderTopStartRadius: 20
    },
    pill: {
      width: '20%',
      height: 2,
      backgroundColor: 'white',
      borderRadius: 1,
      alignSelf: 'center'
    },
    modalHeader: {
      color: 'white',
      fontFamily: 'OpenSans-Bold',
      paddingVertical: 10
    },
    itemText: {
      paddingVertical: 10,
      color: 'white',
      fontFamily: 'OpenSans'
    },
    confirmModalText: {
      paddingVertical: 10,
      color: 'white',
      textAlign: 'center',
      fontFamily: 'OpenSans'
    },
    confirmationBrnText: {
      color: 'white',
      fontFamily: 'OpenSans'
    },
    confirmationBtn: {
      alignSelf: 'center',
      padding: 10,
      paddingHorizontal: 50,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center'
    },
    reactionAView: {
      top: 0,
      alignItems: 'center',
      borderRadius: 100,
      borderWidth: 0.5,
      alignSelf: 'center',
      position: 'absolute',
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
      flexDirection: 'row'
    }
  });
