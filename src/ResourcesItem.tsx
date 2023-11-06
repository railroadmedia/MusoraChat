import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { download, pdf } from './svgs';
import { Resource } from 'RNDownload';

interface IResourcesItem {
  item: Resource;
  onPress: (resource: Resource) => void;
  appColor: string;
}

const ResourcesItem: FunctionComponent<IResourcesItem> = props => {
  const { item, onPress, appColor } = props;

  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.container}>
      {pdf({ height: 16, width: 16, fill: '#96999C' })}
      <Text style={styles.text}>{item.resource_name}</Text>
      {download({ height: 18, width: 18, fill: appColor })}
    </TouchableOpacity>
  );
};

const styles: StyleProp<any> = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  text: {
    color: '#96999C',
    fontFamily: 'OpenSans',
    flex: 1,
    marginLeft: 3,
    marginVertical: 4,
  },
});

export default ResourcesItem;
