import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { PullDownRefreshAndPullUpLoadMoreListView } from "@damoness/react-native-refresh";
import { getVideoList } from "./API";

export default function App() {
  return (
    <View style={styles.container}>
      <PullDownRefreshAndPullUpLoadMoreListView
        renderItem={({ item }) => {
          return <Text style={{ height: 200 }}>{item.title}</Text>;
        }}
        loadDataFunction={getVideoList}
        loadDataParams={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
