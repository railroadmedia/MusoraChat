import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { chat, questions, resources } from './svgs';

interface ITabMenu {
  tabIndex: number;
  onTabChange: (index: number) => void;
  isDark: boolean;
  appColor: string;
  isLandscape: boolean;
}

const tabs = [
  {title: 'CHAT', icon: chat},
  {title: 'QUESTIONS', icon: questions},
  {title: 'RESOURCES', icon: resources}
];
const TabMenu: FunctionComponent<ITabMenu> = props => {
  const { tabIndex, onTabChange, isDark, appColor, isLandscape } = props;

  return (
    <View style={styles.tabMenu}>
      {tabs.map(({title, icon}, i) => {
        const color =
          tabIndex === i ?
            isDark ? 'white' : appColor :
            isDark ? '#445F74' : '#879097';
        return (
        <TouchableOpacity
          key={title}
          onPress={() => onTabChange(i)}
          style={[
            styles.touchable,
            {
              borderBottomColor:
              tabIndex === i ? (isDark ? 'white' : appColor) : 'transparent',
              flexDirection: isLandscape ? 'column' : 'row',
            }
          ]}
        >
          {icon({height: 16, width: 16, fill: color})}
          <Text style={[styles.text, {color: color}]}>
            {title}
          </Text>
        </TouchableOpacity>
      )})}
    </View>
  );
};

const styles: StyleProp<any> =
  StyleSheet.create({
    tabMenu: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontFamily: 'BebasNeue',
      marginLeft: 3,
    },
    touchable: {
      padding: 10,
      marginHorizontal: 10,
      borderBottomWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

export default TabMenu;
