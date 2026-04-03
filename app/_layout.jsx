import {ScrollView, useColorScheme} from 'react-native'
import { Stack } from "expo-router";
import { Colors } from "../constants/Colors"
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../contexts/UserContext";
import { IncidentsProvider } from "../contexts/IncidentsContext";
import { NetworkProvider } from "../contexts/NetworkContext";
import {ThemeProvider} from "../contexts/ThemeContext";
import React from 'react'


class ErrorBoundary extends React.Component {
    state = { error: null }
    componentDidCatch(error) {
        this.setState({ error })
    }
    render() {
        if (this.state.error) {
            return (
                <ScrollView style={{ flex: 1, padding: 40, backgroundColor: '#fff' }}>
                    <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>CRASH:</Text>
                    <Text style={{ color: 'red', fontSize: 12, marginTop: 10 }}>
                        {this.state.error.toString()}
                    </Text>
                    <Text style={{ color: '#333', fontSize: 11, marginTop: 10 }}>
                        {this.state.error.stack}
                    </Text>
                </ScrollView>
            )
        }
        return this.props.children
    }
}

const RootLayout = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors[colorScheme];

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
};

export default RootLayout;