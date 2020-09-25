import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  RefreshListView,
  RefreshState,
  endRefreshing as EndRefreshing,
} from "@damoness/react-native-refresh";
import { getVideoList } from "./API";

let pageSize = 10;

export default function Test1() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const onFooterRefresh = async (endRefreshing: EndRefreshing) => {
    let next = currentPage + 1;

    let arr = await getVideoList(next, pageSize);

    if (arr.length === pageSize) {
      setData(data.concat(arr));
      endRefreshing(RefreshState.CanLoadMore);
    } else {
      setData(data.concat(arr));
      endRefreshing(RefreshState.NoMoreData);
    }
    setCurrentPage(next);
  };

  return (
    <View>
      <RefreshListView
        onFooterRefresh={onFooterRefresh}
        data={data}
        renderItem={({ item }) => (
          <Text style={{ height: 50 }}>{item.title}</Text>
        )}
      />
    </View>
  );
}
