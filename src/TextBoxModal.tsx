import React, { FunctionComponent, forwardRef } from 'react';
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
  icon: React.Node;
}

let isiOS = Platform.OS === 'ios';

const TextBoxModal: FunctionComponent<ITextBoxModal> = forwardRef((props, ref) => {
  const {
    onClose,
    onShow,
    visible,
    isDark,
    onChangeText,
    onSubmitEditing,
    comment,
    icon,
  } = props;

  const styles = localStyles(isDark);

  return (
    <Modal
      onRequestClose={onClose}
      onShow={onShow}
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      visible={visible}
    >
      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'top']}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={isiOS ? 'padding' : ''}
          >
            <View style={styles.textInputContainer}>
              <View style={styles.whiteBG} >
                <TextInput
                  fontFamily={'openSans'}
                  multiline={true}
                  blurOnSubmit={true}
                  style={[styles.textInput]}
                  onChangeText={onChangeText}
                  placeholder={'Say something...'}
                  onSubmitEditing={onSubmitEditing}
                  ref={ref}
                  keyboardAppearance={isDark ? 'dark': 'light'}
                  placeholderTextColor={isDark ? '#4D5356' : '#879097'}
                  returnKeyType={'send'}
                  value={comment}
                />
                <View onPress={onSubmitEditing} style={{ padding: 15, backgroundColor: isDark ? 'black' : 'white' }}>
                  {icon}
                </View>
              </View>

              <TouchableOpacity onPress={onSubmitEditing} style={styles.sendTouchable} />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
});

const localStyles: StyleProp<any> = isDark =>
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
      height: 52,
      width: 52,
      position: 'absolute',
      end: 0
    },
  });

export default TextBoxModal;
