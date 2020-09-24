import React, { Component } from "react";
import {
  View,
  Text,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Props = {
  style?: ViewStyle;
  errorInfo?: string;
  onPress?: () => void;
};

export default class ErrorComponent extends Component<Props> {
  static defaultProps = {
    errorInfo: "网络不给力，请点击屏幕重试",
  };
  render() {
    const { style, onPress, errorInfo } = this.props;

    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          activeOpacity={onPress ? 0.8 : 1}
          style={styles.buttonContainer}
          onPress={onPress}
        >
          <Text style={[styles.text]}>{errorInfo}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
    right: 0,
    left: 0,
  },
  buttonContainer: {},
});
