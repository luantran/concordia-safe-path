import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from 'expo-router'

import ThemedView from "../../../components/ThemedView"
import ThemedLoader from "../../../components/ThemedLoader"
import Spacer from "../../../components/Spacer"
import ThemedText from "../../../components/ThemedText"

import IncidentHeader from "../../../components/incident/IncidentHeader"
import IncidentProgress from "../../../components/incident/IncidentProgress"
import IncidentInteractions from "../../../components/incident/IncidentInteractions"
import CommentsSection from "../../../components/incident/CommentsSection"
import OfflineActionModal from "../../../components/offline/OfflineActionModal"

import { useIncidentDetail } from "../../../hooks/useIncidentDetail"
import { useNotificationsContext } from '../../../contexts/NotificationsContext'
import { useNetwork } from '../../../hooks/useNetwork'

import { timeAgo, getDistance, formatDistance } from '../../../lib/helpers'
import { Colors } from '../../../constants/Colors'

const IncidentDetails = () => {
    const { id } = useLocalSearchParams()
    const { isOnline } = useNetwork()
    const router = useRouter()

    const {
        incident,
        userId,
        isFollowing,
        followLoading,
        userVote,
        voteLoading,
        actionLoading,
        comments,
        commentText,
        setCommentText,
        commentLoading,
        isStaff,
        offlineModal,
        setOfflineModal,
        handleVote,
        handleWitnessed,
        handleFollow,
        handleVerify,
        handleResolve,
        handleComment,
        handleDelete,
    } = useIncidentDetail(id)

    const { locationRef } = useNotificationsContext()
    const userLocation = locationRef?.current

    // offline with nothing cached — don't spin forever, prompt to go back
    if (!incident && isOnline === false) {
        return (
            <ThemedView safe style={styles.container}>
                <View style={styles.offlineContainer}>
                    <Ionicons name="cloud-offline-outline" size={48} color={Colors.attention} />
                    <ThemedText style={styles.offlineTitle}>You're offline</ThemedText>
                    <ThemedText style={styles.offlineMessage}>
                        Incident details aren't available without a connection.
                    </ThemedText>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        )
    }

    if (!incident) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        )
    }

    const netVotes = (incident.upvotes ?? 0) - (incident.downvotes ?? 0)

    const confirmDelete = () => {
        Alert.alert(
            'Delete Incident',
            'Are you sure you want to delete this incident? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await handleDelete()
                        router.back()
                    },
                },
            ]
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={110}
        >
            <ThemedView style={styles.container}>

                <IncidentHeader
                    incident={incident}
                    isFollowing={isFollowing}
                    followLoading={followLoading}
                    onFollow={handleFollow}
                    userId={userId}
                    onDelete={confirmDelete}
                />

                <Spacer height={10} />

                <View style={styles.locationContainer}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.location}>
                            <Ionicons name="location" size={16} color="#B74949" />
                            {userLocation && incident.latitude && incident.longitude && (
                                <ThemedText>
                                    {formatDistance(getDistance(userLocation.latitude, userLocation.longitude, incident.latitude, incident.longitude))} away
                                </ThemedText>
                            )}
                        </View>

                        <Spacer height={10} />

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={styles.activeDot} />
                            <ThemedText style={styles.time}>
                                {(incident.user_id === userId ? "You reported this " : "Reported ") + timeAgo(incident.created_at)}
                            </ThemedText>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.mapLink}
                        onPress={() => router.push({ pathname: '/map', params: { alertIncidentId: incident.id, alertTrigger: Date.now() } })}
                    >
                        <Ionicons name="map-outline" size={24} color={Colors.primary} />
                        <ThemedText style={styles.mapLinkText}>View on Map</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                {/* Description */}
{incident.description && (
    <View style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionText}>
            {incident.description}
        </ThemedText>
    </View>
)}

                <IncidentProgress incident={incident} netVotes={netVotes} />

                <View style={styles.separator} />

                <IncidentInteractions
                    incident={incident}
                    userVote={userVote}
                    voteLoading={voteLoading}
                    actionLoading={actionLoading}
                    isStaff={isStaff}
                    userId={userId}
                    onVote={handleVote}
                    onWitnessed={handleWitnessed}
                    onVerify={handleVerify}
                    onResolve={handleResolve}
                    onDelete={confirmDelete}
                />

                <View style={styles.separator} />

                <CommentsSection
                    comments={comments}
                    commentText={commentText}
                    commentLoading={commentLoading}
                    onChangeText={setCommentText}
                    onSubmit={handleComment}
                />

                {/* single modal shared by all write actions on this screen */}
                <OfflineActionModal
                    visible={offlineModal}
                    onClose={() => setOfflineModal(false)}
                />

            </ThemedView>
        </KeyboardAvoidingView>
    )
}

export default IncidentDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    separator: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 10,
    },
    location: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    activeDot: {
        width: 15,
        height: 15,
        borderRadius: 10,
        backgroundColor: "#24963F",
    },
    time: {
        fontSize: 14,
        paddingLeft: 7,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    mapLink: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        paddingHorizontal: 4,
        gap: 4,
        marginLeft: 10,
    },
    mapLinkText: {
        fontSize: 11,
        color: Colors.primary,
        fontWeight: '500',
        textAlign: 'center',
    },
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
    },
    offlineTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.attention,
        marginTop: 8,
    },
    offlineMessage: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 20,
    },
    backButton: {
        marginTop: 8,
        backgroundColor: Colors.attention,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    descriptionContainer: {
    paddingVertical: 8,
},
descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
},
})