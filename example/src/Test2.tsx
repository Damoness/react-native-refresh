import React from "react";
import { Text } from "react-native";
import { PullDownRefreshAndPullUpLoadMoreListView } from "@damoness/react-native-refresh";
import { getVideoList } from "./API";
export default function Test2() {
  return (
    <PullDownRefreshAndPullUpLoadMoreListView
      renderItem={({ item }) => {
        return <Text style={{ height: 200 }}>{item.title}</Text>;
      }}
      loadDataFunction={getVideoList}
      loadDataParams={[]}
    />
  );
}
