import React from "react";
import { Text, RefreshControlProps, Alert } from "react-native";

const MyRefreshControl: React.FC<RefreshControlProps> = ({ refreshing }) => {
  refreshing && Alert.alert("1");

  return refreshing ? (
    <Text
      style={{
        color: "black",
        height: 100,
        width: 100,
        backgroundColor: "yellow",
        zIndex: 100,
      }}
    >
      111
    </Text>
  ) : null;
};

export default MyRefreshControl;
