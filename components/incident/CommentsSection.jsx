import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import Spacer from "../Spacer"
import { timeAgo } from "../../lib/helpers"
import { useTheme } from '../../contexts/ThemeContext'


// purely presentational — realtime subscription and fetch logic live in useIncidentDetail
const CommentsSection = ({ comments }) => {
    const { colorScheme } = useTheme()
    const isDark = colorScheme === 'dark'

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.commentsContainer}
            contentContainerStyle={{ paddingBottom: 10 }}
        >
            {comments.length === 0 && (
                <ThemedText style={styles.noComments}>No comments yet.</ThemedText>
            )}
            {comments.map((c) => (
                <View key={c.id} style={[styles.commentItem, isDark && { borderBottomColor: '#3a3650' }]}>
                    <View style={styles.commentRow}>
                        <Ionicons name="person-circle" size={36} color={isDark ? '#9591a5' : '#6B7280'} style={styles.profileIcon} />
                        <View style={[styles.commentContentWrapper, isDark && { backgroundColor: '#2f2b3d' }]}>
                            <ThemedText style={styles.commentUser}>
                                {c.profiles?.username ?? 'Unknown'}
                            </ThemedText>
                            <Spacer height={4} />
                            <ThemedText style={styles.commentContent}>{c.content}</ThemedText>
                            <ThemedText style={styles.commentTime}>{timeAgo(c.created_at)}</ThemedText>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    )
}

export default CommentsSection

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    commentsContainer: {
        marginBottom: 10,
    },
    noComments: {
        opacity: 0.5,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 16,
    },
    commentItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        borderRadius: 7,
        paddingHorizontal: 12,
    },
    commentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    profileIcon: {
        marginTop: 5,
    },
    commentContentWrapper: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
    },
    commentUser: {
        fontWeight: "600",
        fontSize: 14,
    },
    commentContent: {
        fontSize: 14,
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12,
        opacity: 0.6,
    },
    addCommentContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        color: "#000",
    },
    commentButton: {
        backgroundColor: "#59A7E7",
        padding: 10,
        borderRadius: 20,
    },
    commentButtonDisabled: {
        opacity: 0.4,
    },
})