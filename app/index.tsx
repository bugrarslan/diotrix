import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView className="items-center justify-center flex-1 bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Button title="Click me!" onPress={() => router.replace("/home")} />
    </SafeAreaView>
  );
}
