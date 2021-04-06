import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Modal } from 'react-native';

import { menu } from './svgs';

let styles;
export default class FloatingMenu extends React.Component {
  state = { maxWidth: 0, modalVisible: false };

  constructor(props) {
    super(props);
    styles = setStyles(props.isDark);
  }

  shouldComponentUpdate({ isDark }) {
    if (this.props.isDark !== isDark) styles = setStyles(isDark);
    return true;
  }

  pickItem = propAction =>
    this.setState({ maxWidth: 0 }, this.props[propAction]);

  close = () => this.setState({ maxWidth: 0 });

  render() {
    let { admin, isDark } = this.props;
    return (
      <>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() =>
              this.setState(({ maxWidth }) => ({
                maxWidth: maxWidth ? 0 : 1000
              }))
            }
            style={styles.toggler}
          >
            {menu({
              width: 20,
              height: 20,
              fill: isDark ? '#445F74' : '#879097'
            })}
          </TouchableOpacity>
          <View style={[styles.optionsList, { maxWidth: this.state.maxWidth }]}>
            {admin && <Text style={styles.text}>Moderation</Text>}
            {[
              {
                text: 'Participants',
                action: () => this.pickItem('onParticipants')
              }
            ]
              .concat(
                admin
                  ? [
                      {
                        text: 'Blocked Students',
                        action: () => this.pickItem('onBlockedStudents')
                      }
                    ].concat(
                      this.props.onClearAllQuestions
                        ? [
                            {
                              text: 'Clear All Questions',
                              action: () =>
                                this.setState({
                                  maxWidth: 0,
                                  modalVisible: true
                                })
                            }
                          ]
                        : []
                    )
                  : []
              )
              .map(({ text, action }) => (
                <TouchableOpacity key={text} onPress={action}>
                  <Text style={{ ...styles.text, fontFamily: 'OpenSans' }}>
                    {text}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
        {this.props.onClearAllQuestions && (
          <Modal
            transparent={true}
            animationType={'slide'}
            visible={this.state.modalVisible}
            onRequestClose={() => this.setState({ modalVisible: false })}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end' }}
              onPress={() => this.setState({ modalVisible: false })}
            >
              <View style={styles.modalContainer}>
                <View style={styles.pill} />
                <Text style={styles.confirmModalText}>
                  Are you sure you want to clear all questions from this chat?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.confirmationBtn,
                    { backgroundColor: this.props.appColor }
                  ]}
                  onPress={() =>
                    this.setState(
                      { modalVisible: false },
                      this.props.onClearAllQuestions
                    )
                  }
                >
                  <Text style={styles.confirmationBrnText}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </>
    );
  }
}
const setStyles = isDark =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-end',
      bottom: 0,
      position: 'absolute',
      right: 0,
      top: 0
    },
    toggler: {
      alignItems: 'center',
      aspectRatio: 1,
      height: '100%',
      justifyContent: 'center'
    },
    optionsList: {
      borderRadius: 10,
      backgroundColor: isDark ? '#081825' : '#FAFAFB',
      paddingVertical: 5,
      overflow: 'hidden',
      borderBottomWidth: isDark ? 0 : 2,
      borderColor: 'rgba(0,0,0,.1)'
    },
    text: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'OpenSans-Bold',
      padding: 5,
      paddingHorizontal: 20
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
    confirmModalText: {
      paddingVertical: 10,
      color: 'white',
      textAlign: 'center',
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
    confirmationBrnText: {
      color: 'white',
      fontFamily: 'OpenSans'
    }
  });
