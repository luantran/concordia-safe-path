import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../contexts/UserContext";
import { IncidentsProvider } from "../contexts/IncidentsContext";
import { NetworkProvider } from "../contexts/NetworkContext";
import {ThemeProvider} from "../contexts/ThemeContext";
import {useColorScheme} from "react-native";
import {Colors} from "../constants/Colors";

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors[colorScheme]

    return (
        <NetworkProvider>
            <UserProvider>
                <ThemeProvider>
                    <IncidentsProvider>
                        <StatusBar value="auto"/>
                        <Stack screenOptions={{
                            headerStyle: { backgroundColor: theme.navBackground },
                            headerTintColor: theme.title,
                        }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                        </Stack>
                    </IncidentsProvider>
                </ThemeProvider>
            </UserProvider>
        </NetworkProvider>
    );
};

export default RootLayout;