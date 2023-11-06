import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Modal, StyleProp } from 'react-native';

import { menu } from './svgs';

interface IFloatingMenu {
  isDark: boolean;
  admin: boolean;
  onParticipants?: () => void;
  onBlockedStudents?: () => void;
  ref: any;
  onClearAllQuestions?: () => void;
  appColor: string;
}

export interface IFloatingMenuRef {
  close: () => void;
}

const FloatingMenu: ForwardRefExoticComponent<IFloatingMenu & RefAttributes<IFloatingMenuRef>> =
  forwardRef((props, ref) => {
    const { isDark, admin, onClearAllQuestions, appColor, onParticipants, onBlockedStudents } =
      props;

    const styles = useMemo(() => setStyles(isDark), [isDark]);

    const [maxWidth, setMaxWidth] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    const pickItem = useCallback(
      (propAction: string) => {
        setMaxWidth(0);
        switch (propAction) {
          case 'onParticipants':
            onParticipants?.();
            break;
          case 'onBlockedStudents':
            onBlockedStudents?.();
            break;
        }
      },
      [onBlockedStudents, onParticipants]
    );

    useImperativeHandle(ref, () => ({
      close: () => setMaxWidth(0),
    }));

    return (
      <>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setMaxWidth(maxWidth ? 0 : 1000)} style={styles.toggler}>
            {menu({
              width: 20,
              height: 20,
              fill: isDark ? '#445F74' : '#879097',
            })}
          </TouchableOpacity>
          <View style={[styles.optionsList, { maxWidth: maxWidth }]}>
            {admin && <Text style={styles.text}>Moderation</Text>}
            {[
              {
                text: 'Participants',
                action: () => pickItem('onParticipants'),
              },
            ]
              .concat(
                admin
                  ? [
                      {
                        text: 'Blocked Students',
                        action: () => pickItem('onBlockedStudents'),
                      },
                    ].concat(
                      onClearAllQuestions
                        ? [
                            {
                              text: 'Clear All Questions',
                              action: () => {
                                setModalVisible(true);
                                setMaxWidth(0);
                              },
                            },
                          ]
                        : []
                    )
                  : []
              )
              .map(({ text, action }) => (
                <TouchableOpacity key={text} onPress={action}>
                  <Text style={{ ...styles.text, fontFamily: 'OpenSans' }}>{text}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
        {onClearAllQuestions && (
          <Modal
            transparent={true}
            animationType={'slide'}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end' }}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.pill} />
                <Text style={styles.confirmModalText}>
                  Are you sure you want to clear all questions from this chat?
                </Text>
                <TouchableOpacity
                  style={[styles.confirmationBtn, { backgroundColor: appColor }]}
                  onPress={() => {
                    setModalVisible(false);
                    onClearAllQuestions();
                  }}
                >
                  <Text style={styles.confirmationBrnText}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </>
    );
  });

export default FloatingMenu;

const setStyles = (isDark: boolean): StyleProp<any> =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-end',
      position: 'absolute',
      right: 0,
    },
    toggler: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
    },
    optionsList: {
      borderRadius: 10,
      backgroundColor: isDark ? '#081825' : '#FAFAFB',
      paddingVertical: 5,
      overflow: 'hidden',
      borderBottomWidth: isDark ? 0 : 2,
      borderColor: 'rgba(0,0,0,.1)',
    },
    text: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans-Bold',
      padding: 5,
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: '#081825',
      padding: 20,
      borderTopEndRadius: 20,
      borderTopStartRadius: 20,
    },
    pill: {
      width: '20%',
      height: 2,
      backgroundColor: 'white',
      borderRadius: 1,
      alignSelf: 'center',
    },
    confirmModalText: {
      paddingVertical: 10,
      color: 'white',
      textAlign: 'center',
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
    confirmationBrnText: {
      color: 'white',
      fontFamily: 'OpenSans',
    },
  });
