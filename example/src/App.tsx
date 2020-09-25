import * as React from "react";
import { StyleSheet, View } from "react-native";
//import Test2 from "./Test2";
import Test1 from "./Test1";

export default function App() {
  return (
    <View style={styles.container}>
      <Test1 />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
