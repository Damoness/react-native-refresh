import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { RefreshState } from "./RefreshState";

type Props = {
  state: RefreshState;
  onRetryLoading?: () => void;

  footerRefreshingText?: string;
  footerLoadMoreText?: string;
  footerFailureText?: string;
  footerNoMoreDataText?: string;
};

const RefreshFooter: React.FC<Props> = (props) => {
  const {
    state,
    footerRefreshingText,
    footerNoMoreDataText,
    footerFailureText,
    footerLoadMoreText,
    onRetryLoading,
  } = props;

  let color = useColorScheme();

  let fontColorC3 = color === "dark" ? "#A9AAAD" : "#555555";

  let footer = null;

  switch (state) {
    case RefreshState.Idle:
      // Idle情况下为null，不显示尾部组件
      break;
    case RefreshState.Refreshing:
      footer = (
        <View style={styles.loadingView}>
          <ActivityIndicator size="small" />
          <Text style={[styles.refreshingText, { color: fontColorC3 }]}>
            {footerRefreshingText}
          </Text>
        </View>
      );
      break;
    case RefreshState.CanLoadMore:
      footer = (
        <View style={styles.loadingView}>
          <Text style={[styles.footerText, { color: fontColorC3 }]}>
            {footerLoadMoreText}
          </Text>
        </View>
      );
      break;
    case RefreshState.NoMoreData:
      footer = (
        <View style={styles.loadingView}>
          <Text style={[styles.footerText, { color: fontColorC3 }]}>
            {footerNoMoreDataText}
          </Text>
        </View>
      );
      break;
    case RefreshState.Failure:
      footer = (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.loadingView}
          onPress={() => {
            onRetryLoading && onRetryLoading();
          }}
        >
          <Text style={[styles.footerText, { color: fontColorC3 }]}>
            {footerFailureText}
          </Text>
        </TouchableOpacity>
      );
      break;
  }
  return footer;
};

RefreshFooter.defaultProps = {
  footerRefreshingText: "努力加载中",
  footerLoadMoreText: "上拉加载更多",
  footerFailureText: "点击重新加载",
  footerNoMoreDataText: "已全部加载完毕",
};

export default React.memo(RefreshFooter);

const styles = StyleSheet.create({
  loadingView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  refreshingText: {
    fontSize: 12,
    paddingLeft: 10,
  },
  footerText: {
    fontSize: 12,
  },
});
