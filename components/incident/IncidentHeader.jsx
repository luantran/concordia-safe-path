import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import { Colors } from "../../constants/Colors"
import { IncidentIconMap } from "../../constants/Icons"

const IncidentHeader = ({ incident, isFollowing, followLoading, onFollow }) => (
    <View style={styles.header}>

        {/* type icon */}
        <View style={styles.iconWrapper}>
            <View style={[styles.iconBox, { backgroundColor: Colors.severity[incident.severity] ?? Colors.primaryDark }]}>
                {IncidentIconMap[incident.type]
                    ? IncidentIconMap[incident.type]({ size: 30, color: '#fff' })
                    : <Ionicons name="alert-circle" size={30} color="#fff" />}
            </View>
        </View>

        {/* severity badge + incident type title + follow pill */}
        <View style={styles.textColumn}>
            <ThemedText style={styles.severityDisplay}>
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) + " tension"}
            </ThemedText>
            <View style={styles.titleRow}>
                <ThemedText
                    style={styles.title}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                >
                    {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                </ThemedText>
                <TouchableOpacity
                    onPress={onFollow}
                    disabled={followLoading}
                    style={[styles.followPill, isFollowing && styles.followPillActive]}
                >
                    <Ionicons name="star" size={13} color={isFollowing ? "#FFD700" : "#6B7280"} />
                    <ThemedText style={[styles.followPillText, isFollowing && styles.followPillTextActive]}>
                        {isFollowing ? "Following" : "Follow"}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>

    </View>
)

export default IncidentHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 15,
    },
    iconWrapper: {
        alignItems: 'center',
    },
    iconBox: {
        width: 65,
        height: 65,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    textColumn: {
        flexDirection: "column",
        justifyContent: "flex-start",
        flex: 1,
    },
    severityDisplay: {
        backgroundColor: "#E7E7E7",
        fontSize: 14,
        fontWeight: "600",
        color: "#4D4D4D",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9,
        alignSelf: "flex-start",
        marginBottom: 15,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        flexShrink: 1,
    },
    followPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        flexShrink: 0,
        backgroundColor: '#F3F4F6',
        borderColor: '#9CA3AF',
    },
    followPillActive: {
        backgroundColor: '#FFF9E6',
        borderColor: '#FFD700',
    },
    followPillText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: '500',
        flexShrink: 0,
    },
    followPillTextActive: {
        color: '#B8860B',
        fontWeight: '600',
    },
})