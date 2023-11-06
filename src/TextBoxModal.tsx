import React, { ReactNode, forwardRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ITextBoxModal {
  visible: boolean;
  comment: string;
  onClose: () => void;
  onShow: () => void;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  icon: ReactNode;
  isDark: boolean;
}

const isiOS = Platform.OS === 'ios';

const TextBoxModal = forwardRef<TextInput, ITextBoxModal>((props, ref) => {
  const { onClose, onShow, visible, isDark, onChangeText, onSubmitEditing, comment, icon } = props;

  const styles = localStyles(isDark);

  return (
    <Modal
      onRequestClose={onClose}
      onShow={onShow}
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      visible={visible}
    >
      <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end' }} onPress={onClose}>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'top']}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={isiOS ? 'padding' : undefined}
          >
            <View style={styles.textInputContainer}>
              <View style={styles.whiteBG}>
                <TextInput
                  multiline={true}
                  blurOnSubmit={true}
                  style={styles.textInput}
                  onChangeText={onChangeText}
                  placeholder={'Say something...'}
                  onSubmitEditing={onSubmitEditing}
                  ref={ref}
                  keyboardAppearance={isDark ? 'dark' : 'light'}
                  placeholderTextColor={isDark ? '#4D5356' : '#879097'}
                  returnKeyType={'send'}
                  value={comment}
                />
                <TouchableOpacity onPress={onSubmitEditing} style={styles.sendTouchable}>
                  {icon}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
});

const localStyles: StyleProp<any> = (isDark: boolean) =>
  StyleSheet.create({
    textInputContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#00101D' : '#F2F3F5',
      alignItems: 'center',
    },
    textInput: {
      padding: 10,
      paddingTop: 10,
      flex: 1,
      color: isDark ? 'white' : 'black',
    },
    whiteBG: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'black' : 'white',
      flex: 1,
      margin: 10,
      borderRadius: 5,
      overflow: 'hidden',
    },
    sendTouchable: {
      padding: 15,
      backgroundColor: isDark ? 'black' : 'white',
    },
  });

export default TextBoxModal;
