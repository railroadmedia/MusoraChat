import React, { FunctionComponent, ReactElement } from 'react';
import { Modal, StyleProp, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IListItemModal {
  isDark: boolean;
  appColor: string;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  msgComponent: ReactElement;
  confirmText?: string;
}

const ListItemModal: FunctionComponent<IListItemModal> = props => {
  const { isDark, appColor, visible, onCancel, onConfirm, msgComponent, confirmText } = props;
  const styles = localStyles(isDark);

  return (
    <Modal transparent={true} animationType={'slide'} visible={visible} onRequestClose={onCancel}>
      <TouchableOpacity style={styles.touchable} onPress={onCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.pill} />
          {msgComponent}
          <TouchableOpacity
            style={[styles.confirmationBtn, { backgroundColor: appColor }]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmationBtnText}>{confirmText || 'CONFIRM'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const localStyles: StyleProp<any> = (isDark: boolean) =>
  StyleSheet.create({
    touchable: {
      flex: 1,
      justifyContent: 'flex-end',
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
    confirmationBtn: {
      alignSelf: 'center',
      padding: 10,
      paddingHorizontal: 50,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmationBtnText: {
      color: 'white',
      fontFamily: 'OpenSans',
    },
  });

export default ListItemModal;
