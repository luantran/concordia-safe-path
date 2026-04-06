import { useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';

const FAQ_ITEMS = [    
    {
        id: 1,
        question: 'How do I report an incident?',
        answer: 'To report an incident, tap the "Report" button on the main dashboard and select the incident type from the modal. Provide details about the location and severity of the incident. Your report helps keep the community safe.',
    },
    {
        id: 2,
        question: 'What types of incidents can I report?',
        answer: 'You can report various types of incidents including protests, construction, road blockage and vandalism. Select the category that best matches your situation when reporting.',
    },
    {
        id: 3,
        question: 'Why am I unable to submit an incident report?',
        answer: 'A location must be selected before submitting. Tap on the map to place a pin, then complete the remaining fields before submitting the report.',
    },
    {
        id: 4,
        question: 'Will my identity be revealed when I report an incident?',
        answer: 'Your privacy is important to us and is protected according to our privacy policy. Incident reports are submitted securely and do not publicly display your personal identity. However, if law enforcement needs to contact you for follow-up, your contact information may be necessary.',
    },    
    {
        id: 5,
        question: 'What should I do if I witness an emergency?',
        answer: 'If you witness a serious emergency, call campus security or emergency services first at 911. After ensuring everyone is safe, you can use the app to report the incident so other community members are aware.',
    },
    {
        id: 6,
        question: 'What do the severity levels (High, Medium, Low) represent?',
        answer: 'High: Urgent or dangerous situations. Medium: Moderate issues that may affect safety. Low: Minor concerns with limited impact.',
    },
    {
        id: 7,
        question: 'How accurate is the incident information?',
        answer: 'All incidents are reported by community members like you and is supporeted by community voting (upvotes/downvotes) and verification by trusted sources such as campus authorities. While we strive for accuracy, we encourage users to verify information and exercise presonal judgment. If you see inaccurate information, you can raise concerns by commenting on the incident.',
    },
    {
        id: 8,
        question: 'What does “Reported by X users” mean?',
        answer: 'It indicates how many users have reported the same incident, which may increase its reliability by showing community confirmation.',
    },    
    {
        id: 9,
        question: 'What does “Verified by Campus” indicate?',
        answer: 'The incident has been confirmed by a trusted authority, the campus security, increasing confidence in the accuracy of the report.',
    },
    {
        id: 10,
        question: 'Why are some incidents not visible?',
        answer: 'This may occur if there are no incidents in your area, filters are applied or there are connectivity issues preventing the latest data from loading.',
    },
    {
        id: 11,
        question: 'What do the colors on the map represent?',
        answer: 'Red zones indicate high-severity incidents with a larger impact area. Yellow zones indicate medium-severity incidents with a moderate impact area. Green zones indicate low-severity incidents with a smaller impact area.',
    },
    {
        id: 12,
        question: 'What do the status stages mean (Submitted, Reported by Others, Verified, Resolved)?',
        answer: 'Submitted: Initial report created. Reported by Others: Multiple users have confirmed the incident. Verified: Confirmed by a trusted authority. Resolved: The situation has been addressed.',
    },
    {
        id: 13,
        question: 'What is the purpose of upvotes and downvotes?',
        answer: 'Voting allows users to indicate whether an incident is accurate and helping improve overall reliability.',
    },
    {
        id: 14,
        question: 'Why am I not receiving notifications?',
        answer: 'This may occur if there are no nearby incidents, notifications are disabled on your device, or your alert settings limit notifications.',
    },
    {
        id: 15,
        question: 'How can I change my notification preferences?',
        answer: 'Visit the Preferences page to customize your notification settings for different incident types. You can set different alert levels (normal, silent and mute) for different incident types.',
    },
    {
        id: 16,
        question: 'What are distance-based alerts?',
        answer: 'Distance-based alerts notify you only about incidents within a selected range from your location.',
    },
    {
        id: 17,
        question: 'How do I enable proximity alerts?',
        answer: 'Go to Preferences and ensure that Distance-based alerts are configured where you can set your alert distance preference. Also ensure that notifications are allowed in your device settings. When an incident is reported near you, you\'ll receive a notification based on your settings.',
    },
    {
        id: 18,
        question: 'What do the alert modes (Normal, Silent, Mute) mean?',
        answer: 'Normal: Notifications with sound. Silent: Notifications without sound. Mute: No notifications.',
    },
    {
        id: 19,
        question: 'What does “Notify Emergency Contact” do?',
        answer: 'This feature alerts your saved emergency contact about your situation and shares your location if available.',
    },
    {
        id: 20,
        question: 'Can I view incident history?',
        answer: 'Yes, the Incidents tab displays recent and active incidents. Historical data is limited, and resolved incidents may no longer be visible.',
    },
    {
        id: 21,
        question: 'What if the app stops working or I lose connection?',
        answer: 'The app works offline to some extent, but features such as live updates and reporting may be temporarily unavailable until your connection is restored. If you encounter persistent issues, try restarting the app.',
    },

];

const FAQItem = ({ item, isExpanded, onPress, theme }) => {
    return (
        <TouchableOpacity
            style={[styles.faqItemContainer, { borderColor: Colors.divider, backgroundColor: theme.uiBackground }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.questionRow}>
                <ThemedText style={[styles.question, { flex: 1 }]} weight="600">
                    {item.question}
                </ThemedText>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={theme.iconColor}
                    style={styles.chevron}
                />
            </View>
            {isExpanded && (
                <View style={[styles.answerContainer, { borderTopColor: Colors.divider }]}>
                    <ThemedText style={styles.answer}>{item.answer}</ThemedText>
                </View>
            )}
        </TouchableOpacity>
    );
};

const FAQ = () => {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [expandedIds, setExpandedIds] = useState([]);

    const handleToggle = useCallback((id) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((existingId) => existingId !== id)
                : [...prev, id]
        );
    }, []);

    return (
        <ThemedView style={styles.screen}>
            <Stack.Screen
                options={{
                    title: 'Frequently Asked Questions',
                    headerBackTitle: 'Back',
                }}
            />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.text }]}>
                        Find answers to common questions about Concordia Safe Path
                    </ThemedText>
                </View>

                <View style={styles.faqList}>
                    {FAQ_ITEMS.map((item) => (
                        <FAQItem
                            key={item.id}
                            item={item}
                            isExpanded={expandedIds.includes(item.id)}
                            onPress={() => handleToggle(item.id)}
                            theme={theme}
                        />
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    faqList: {
        marginBottom: 24,
        gap: 12,
    },
    faqItemContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    question: {
        fontSize: 16,
        lineHeight: 24,
    },
    chevron: {
        marginLeft: 8,
    },
    answerContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    answer: {
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
    },
    footerSubtext: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 4,
    },
});

export default FAQ;
