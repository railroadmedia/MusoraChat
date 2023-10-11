import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { chat, questions, resources } from './svgs';
import DeviceInfo from 'react-native-device-info';

interface ITabMenu {
  tabIndex: number;
  onTabChange: (index: number) => void;
  isDark: boolean;
  appColor: string;
  isLandscape: boolean;
  showResources: boolean;
}

const tabs = [
  {title: 'CHAT', icon: chat},
  {title: 'QUESTIONS', icon: questions},
  {title: 'RESOURCES', icon: resources}
];

const IS_TABLET = DeviceInfo.isTablet();

const ICON_SIZE = IS_TABLET ? 20 : 14;

const TabMenu: FunctionComponent<ITabMenu> = props => {
  const { tabIndex, onTabChange, isDark, appColor, isLandscape, showResources } = props;

  return (
    <View style={styles.tabMenu}>
      {tabs.map(({title, icon}, i) => {
        const color =
          tabIndex === i ?
            isDark ? 'white' : appColor :
            isDark ? '#445F74' : '#879097';
        return (
        !showResources && i === 2 ?
          <></> :
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
          {icon({height: ICON_SIZE, width: ICON_SIZE, fill: color})}
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
      fontFamily: 'BebasNeue-Regular',
      fontSize: ICON_SIZE,
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
