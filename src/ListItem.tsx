import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { pin, vote, close, coach, team, edge, lifetime } from './svgs';
import ListItemModal from './ListItemModal';

interface IListItem {
  editing?: boolean;
  new?: boolean;
  reversed?: boolean;
  isDark: boolean;
  appColor: string;
  onTap: () => void;
  own?: boolean;
  admin?: boolean;
  type?: string;
  pinned?: boolean;
  hidden?: boolean;
  center?: boolean;
  item: any;
  onRemoveMessage?: () => void;
  onRemoveAllMessages?: () => void;
  onToggleBlockStudent?: () => void;
  onTogglePinMessage?: () => void;
  onToggleHidden?: (id: string) => void;
  onAnswered?: () => void;
  onToggleReact?: () => void;
  onEditMessage?: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const ListItem: FunctionComponent<IListItem> = props => {
  const {
    editing,
    new: isNew,
    reversed,
    isDark,
    appColor,
    onTap,
    own,
    admin,
    type,
    pinned,
    hidden,
    center,
    item,
    onRemoveMessage,
    onRemoveAllMessages,
    onToggleBlockStudent,
    onTogglePinMessage,
    onToggleHidden,
    onAnswered,
    onToggleReact,
    onEditMessage,
    onLayout,
  } = props;
  const styles = setStyles(isDark);

  const [position, setPosition] = useState<'absolute' | 'relative' | undefined>(
    isNew ? 'absolute' : 'relative'
  );
  const [hideMessage, setHideMessage] = useState(hidden);
  const [answeredModalVisible, setAnsweredModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [removeAllModalVisible, setRemoveAllModalVisible] = useState(false);
  const [userTagIcon, setUserTagIcon] = useState<Element | undefined>(undefined);
  const [borderColor, setBorderColor] = useState('');

  useEffect(() => {
    if (!item || !item.user) {
      return;
    }
    const {
      user: { accessLevelName: aln },
    } = item;
    switch (aln) {
      case 'edge': {
        setBorderColor(appColor);
        setUserTagIcon(edge({ height: 4, fill: 'white' }));
        break;
      }
      case 'piano': {
        setBorderColor(appColor);
        break;
      }
      case 'team': {
        setBorderColor('black');
        setUserTagIcon(team({ height: 4, fill: 'white' }));
        break;
      }
      case 'lifetime': {
        setBorderColor('#07B3FF');
        setUserTagIcon(lifetime({ height: 4, fill: 'white' }));
        break;
      }
      case 'coach': {
        setBorderColor('#FAA300');
        setUserTagIcon(coach({ height: 4, fill: 'white' }));
        break;
      }
    }
  }, [item, appColor]);

  const pickItem = useCallback(
    (nextModal: string) => {
      setOptionsModalVisible(false);
      switch (nextModal) {
        case 'pin':
          onTogglePinMessage?.();
          break;
        case 'edit':
          onEditMessage?.();
          break;
        case 'hide':
          setHideMessage(!hideMessage);
          onToggleHidden?.(item.id);
          break;
        case 'blockModalVisible':
          setBlockModalVisible(true);
          break;
        case 'answeredModalVisible':
          setAnsweredModalVisible(true);
          break;
        case 'removeAllModalVisible':
          setRemoveAllModalVisible(true);
          break;
        case 'removeModalVisible':
          setRemoveModalVisible(true);
          break;
      }
    },
    [onTogglePinMessage, onEditMessage, onToggleHidden, item, hideMessage]
  );

  const hideAllModals = useCallback(() => {
    setAnsweredModalVisible(false);
    setBlockModalVisible(false);
    setRemoveModalVisible(false);
    setRemoveAllModalVisible(false);
  }, []);

  const removeModal = useMemo(
    () => (
      <ListItemModal
        appColor={appColor}
        isDark={isDark}
        visible={removeModalVisible}
        msgComponent={
          <Text style={styles.confirmModalText}>Are you sure you want to remove this message?</Text>
        }
        onCancel={() => setRemoveModalVisible(false)}
        onConfirm={() => {
          hideAllModals();
          onRemoveMessage?.();
        }}
      />
    ),
    [removeModalVisible, onRemoveMessage, hideAllModals, styles, appColor, isDark]
  );

  const removeAllModal = useMemo(
    () => (
      <ListItemModal
        appColor={appColor}
        isDark={isDark}
        visible={removeAllModalVisible}
        msgComponent={
          <Text style={styles.confirmModalText}>
            Are you sure you want to delete all of{' '}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>{item.user?.displayName}</Text> messages?
          </Text>
        }
        onCancel={() => setRemoveAllModalVisible(false)}
        onConfirm={() => {
          hideAllModals();
          onRemoveAllMessages?.();
        }}
      />
    ),
    [
      appColor,
      isDark,
      removeAllModalVisible,
      styles.confirmModalText,
      item.user?.displayName,
      hideAllModals,
      onRemoveAllMessages,
    ]
  );

  const blockModal = useMemo(
    () => (
      <ListItemModal
        appColor={appColor}
        isDark={isDark}
        visible={blockModalVisible}
        msgComponent={
          <Text style={styles.confirmModalText}>
            Are you sure you want to {item.user?.banned ? 'unblock ' : 'block '}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>{item.user?.displayName}</Text>
            {item.user?.banned ? '?' : ' from this chat?'}
          </Text>
        }
        onCancel={() => setBlockModalVisible(false)}
        onConfirm={() => {
          hideAllModals();
          onToggleBlockStudent?.();
        }}
        confirmText={item.user?.banned ? 'CONFIRM' : 'BLOCK'}
      />
    ),
    [
      appColor,
      isDark,
      blockModalVisible,
      styles.confirmModalText,
      item.user?.banned,
      item.user?.displayName,
      hideAllModals,
      onToggleBlockStudent,
    ]
  );

  const answeredModal = useMemo(
    () => (
      <ListItemModal
        appColor={appColor}
        isDark={isDark}
        visible={answeredModalVisible}
        msgComponent={
          <Text style={styles.confirmModalText}>
            Are you sure you want to mark this question as answered?{`\n`}
            <Text style={{ fontFamily: 'OpenSans-Bold' }}>
              This will remove the question from the chat.
            </Text>
          </Text>
        }
        onCancel={() => setAnsweredModalVisible(false)}
        onConfirm={() => {
          hideAllModals();
          onAnswered?.();
        }}
      />
    ),
    [answeredModalVisible, onAnswered, hideAllModals, styles, appColor, isDark]
  );

  return (
    <>
      <TouchableOpacity
        onLayout={e => {
          if (position === 'absolute') {
            setPosition('relative');
          }
          onLayout?.(e);
        }}
        style={[
          {
            position: position,
            padding: 10,
            flexDirection: 'row',
            alignItems: center ? 'center' : 'flex-start',
            backgroundColor: editing
              ? `${appColor}33`
              : pinned
              ? isDark
                ? '#0C131B'
                : 'white'
              : 'transparent',
          },
          reversed ? { transform: [{ rotate: '180deg' }] } : {},
        ]}
        onPress={() => {
          onTap?.();
          if (admin && type === 'banned') {
            return pickItem('blockModalVisible');
          }
          if (admin || own || pinned) {
            setOptionsModalVisible(true);
          }
        }}
      >
        <View
          style={{
            borderRadius: 99,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor,
          }}
        >
          <Image source={{ uri: item.user?.avatarUrl }} style={{ height: 31, aspectRatio: 1 }} />
          <View
            style={{
              width: '100%',
              height: 5,
              backgroundColor: borderColor,
              position: 'absolute',
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <>{userTagIcon}</>
          </View>
        </View>
        <View style={{ paddingLeft: 10, flex: 1 }}>
          {pinned && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {pin({ width: 9, fill: '#9EA1A6' })}
              <Text
                style={{
                  fontFamily: 'OpenSans',
                  color: '#9EA1A6',
                  fontSize: 10,
                }}
              >
                {' '}
                Pinned
              </Text>
            </View>
          )}
          <View style={styles.msgHeaderContainer}>
            <Text style={styles.displayName}>
              {item.user?.displayName}
              {editing && <Text style={styles.editing}> Editing</Text>}
            </Text>
            <Text style={styles.timestamp}>
              {item.created_at?.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}
            </Text>
          </View>
          {!!item.text && (
            <Text style={styles.msgText} numberOfLines={hideMessage ? 1 : 0}>
              {item.text}
            </Text>
          )}
          {type === 'question' && (
            <TouchableOpacity
              onPress={onToggleReact}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 5,
              }}
            >
              {vote({
                width: 10,
                height: 10,
                fill: item.own_reactions?.some((r: { type: string }) => r.type === 'upvote')
                  ? '#00BC75'
                  : isDark
                  ? 'white'
                  : 'black',
              })}
              <Text
                style={{
                  color: !item?.reaction_counts?.upvote
                    ? isDark
                      ? 'black'
                      : 'white'
                    : item.own_reactions?.some((r: { type: string }) => r.type === 'upvote')
                    ? '#00BC75'
                    : appColor,
                  paddingHorizontal: 5,
                }}
              >
                {item?.reaction_counts?.upvote || 0}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {admin && type === 'banned' && (
          <>
            <Text
              style={{
                color: isDark ? 'white' : 'black',
                fontFamily: 'OpenSans',
                paddingHorizontal: 5,
              }}
            >
              Unblock
            </Text>
            {close({ width: 15, height: 15, fill: '#9EA1A6' })}
          </>
        )}
      </TouchableOpacity>
      <Modal
        transparent={true}
        animationType={'slide'}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
        supportedOrientations={['landscape', 'portrait']}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'flex-end' }}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pill} />
            {admin && (
              <>
                <Text style={styles.modalHeader}>Moderation</Text>
                {type === 'message' && (
                  <TouchableOpacity onPress={() => pickItem('pin')}>
                    <Text style={styles.itemText}>{item.pinned ? 'Unpin' : 'Pin'} Message</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {type === 'question' && admin && (
              <TouchableOpacity onPress={() => pickItem('answeredModalVisible')}>
                <Text style={styles.itemText}>Mark As Answered</Text>
              </TouchableOpacity>
            )}
            {own && (
              <TouchableOpacity onPress={() => pickItem('edit')}>
                <Text style={styles.itemText}>Edit Message</Text>
              </TouchableOpacity>
            )}
            {(admin || own) &&
              [{ text: 'Remove Message', nextModal: 'removeModalVisible' }]
                .concat(
                  admin
                    ? [
                        {
                          text: 'Remove All Messages',
                          nextModal: 'removeAllModalVisible',
                        },
                        {
                          text: item.user?.banned ? 'Unblock Student' : 'Block Student',
                          nextModal: 'blockModalVisible',
                        },
                      ]
                    : []
                )
                .map(({ text, nextModal }) => (
                  <TouchableOpacity key={text} onPress={() => pickItem(nextModal)}>
                    <Text style={styles.itemText}>{text}</Text>
                  </TouchableOpacity>
                ))}
            {pinned && (
              <TouchableOpacity onPress={() => pickItem('hide')}>
                <Text style={styles.itemText}>{hideMessage ? 'Show ' : 'Hide '}Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {removeModal}
      {removeAllModal}
      {blockModal}
      {answeredModal}
    </>
  );
};

export default ListItem;

const setStyles: StyleProp<any> = (isDark: boolean) =>
  StyleSheet.create({
    msgHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    displayName: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans-Bold',
    },
    editing: {
      fontFamily: 'OpenSans-Italic',
      color: '#4D5356',
      fontSize: 8,
    },
    timestamp: {
      fontFamily: 'OpenSans',
      color: '#4D5356',
      fontSize: 8,
    },
    msgText: {
      fontFamily: 'OpenSans',
      fontWeight: 'normal',
      color: isDark ? 'white' : 'black',
    },
    modalContainer: {
      backgroundColor: isDark ? '#00101D' : '#F7F9FC',
      padding: 20,
      borderTopEndRadius: 20,
      borderTopStartRadius: 20,
      paddingLeft: 35,
    },
    pill: {
      width: '20%',
      height: 2,
      backgroundColor: isDark ? 'white' : 'black',
      borderRadius: 1,
      alignSelf: 'center',
    },
    modalHeader: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans-Bold',
      paddingVertical: 10,
    },
    itemText: {
      paddingVertical: 10,
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans',
    },
    confirmModalText: {
      paddingVertical: 10,
      color: isDark ? 'white' : 'black',
      textAlign: 'center',
      fontFamily: 'OpenSans',
    },
    confirmationBrnText: {
      color: 'white',
      fontFamily: 'OpenSans',
    },
    confirmationBtn: {
      alignSelf: 'center',
      padding: 10,
      paddingHorizontal: 50,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
