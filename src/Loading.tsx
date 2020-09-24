import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

export default class Loading extends React.Component {
  render() {
    return (
      <View style={styles.loadingView}>
        <ActivityIndicator />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
