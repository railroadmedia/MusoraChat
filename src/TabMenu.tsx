import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface ITabMenu {
  tabIndex: number;
  onTabChange: (index: number) => void;
  isDark: boolean;
  appColor: string;
}

const tabs = ['CHAT', 'QUESTIONS', 'RESOURCES'];
const TabMenu: FunctionComponent<ITabMenu> = props => {
  const { tabIndex, onTabChange, isDark, appColor } = props;

  return (
    <View style={styles.tabMenu}>
      {tabs.map((t, i) => (
        <TouchableOpacity
          key={t}
          onPress={() => onTabChange(i)}
          style={{
            padding: 10,
            marginHorizontal: 10,
            borderBottomWidth: 2,
            borderBottomColor:
              tabIndex === i ? (isDark ? 'white' : appColor) : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                tabIndex === i
                  ? isDark
                    ? 'white'
                    : appColor
                  : isDark
                  ? '#445F74'
                  : '#879097',
              fontFamily: 'BebasNeue',
            }}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles: StyleProp<any> =
  StyleSheet.create({
    tabMenu: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default TabMenu;
