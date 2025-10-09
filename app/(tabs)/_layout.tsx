import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

const Tablayout = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="ic_menu_home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gear" drawable="ic_menu_preferences" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default Tablayout;
