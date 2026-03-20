import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { SEVERITY_RADIUS, WARNING_RADIUS } from '../constants/Incidents';
import { getDistance } from '../lib/helpers';

// how far user needs to walk away before we re-alert for the same incident
const RESET_DISTANCE = 500;

// map incident type to the user's notif_* preference field
function getNotifLevel(incident, profile) {
    const map = {
        protest:       profile?.notif_protest,
        construction:  profile?.notif_construction,
        blockade:      profile?.notif_road,
        safety:        profile?.notif_road,
        emergency:     'normal', // emergencies always normal regardless of preference
        accessibility: 'normal',
    }
    return map[incident.type] ?? 'normal'
}

export function useProximityAlerts(incidents, sendProximityNotification, resetNotification, profile) {
    // maps incident id → last shown stage (1, '1s', or 2)
    // ref not state — updating this shouldn't cause re-renders
    const alertedIncidents = useRef(new Map());
    const watchRef = useRef(null);

    // drives the modal — null when nothing to show
    // stage 2 = danger zone (modal + push)
    // stage 1 = normal alert (modal + push)
    // stage '1s' = silent alert (push only, no modal)
    const [activeAlert, setActiveAlert] = useState(null);

    // ref mirrors state so handlePosition can always read current value without stale closure
    const activeAlertRef = useRef(null);
    useEffect(() => { activeAlertRef.current = activeAlert; }, [activeAlert]);

    // ref to latest handlePosition so the watcher always calls the current version
    // (watcher is only created once but incidents list and profile can change)
    const handlePositionRef = useRef(null);

    function handlePosition(position) {
        const user = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };

        __DEV__ && console.log('[proximity] position update received');

        // build once per callback — makes all id lookups O(1) instead of O(n)
        const incidentMap = new Map(incidents.map(i => [i.id, i]));

        // re-enable alerts for incidents the user has walked far enough away from
        for (const [id] of alertedIncidents.current.entries()) {
            const incident = incidentMap.get(id);
            if (!incident) {
                alertedIncidents.current.delete(id);
                __DEV__ && console.log(`[proximity] incident ${id} resolved, removed from alerted map`);
                continue;
            }
            const dist = getDistance(user.latitude, user.longitude, incident.latitude, incident.longitude);
            if (dist > RESET_DISTANCE) {
                alertedIncidents.current.delete(id);
                __DEV__ && console.log(`[proximity] incident ${id} reset — user moved far enough away`);
            }
        }

        // user-defined warning distances, fall back to WARNING_RADIUS constant
        const distNormal = profile?.distance_normal ?? WARNING_RADIUS;
        const distSilent = profile?.distance_silent ?? WARNING_RADIUS;

        let closest = null;
        let closestDistance = Infinity;

        for (const incident of incidents) {
            const dist = getDistance(user.latitude, user.longitude, incident.latitude, incident.longitude);
            const severityRadius = SEVERITY_RADIUS[incident.severity] ?? 100;
            const notifLevel = getNotifLevel(incident, profile);

            // muted incidents never alert
            if (notifLevel === 'muted') continue;

            const normalEnabled = profile?.distance_normal_enabled ?? true
            const silentEnabled = profile?.distance_silent_enabled ?? true

            let stage = null;
            if (dist <= severityRadius) {
                stage = 2; // always fires
            } else if (normalEnabled && notifLevel === 'normal' && dist <= severityRadius + distNormal) {
                stage = 1;
            } else if (silentEnabled && dist <= severityRadius + distSilent) {
                stage = '1s';
            }

            __DEV__ && console.log(`[proximity] incident ${incident.id} (${incident.severity}) — dist: ${dist.toFixed(0)}m, stage: ${stage}, notifLevel: ${notifLevel}`);

            if (stage === null) continue;

            // skip if we've already shown this stage or higher for this incident
            const shownStage = alertedIncidents.current.get(incident.id);
            if (shownStage !== undefined && stage <= shownStage) {
                __DEV__ && console.log(`[proximity] skipping incident ${incident.id} — already shown stage ${shownStage}`);
                continue;
            }

            if (dist < closestDistance) {
                closest = { incident, stage };
                closestDistance = dist;
            }
        }

        __DEV__ && console.log('[proximity] closest qualifying incident:', closest ? `${closest.incident.id} stage ${closest.stage}` : 'none');

        if (closest) {
            const prev = activeAlertRef.current;

            // already showing this exact incident+stage — do nothing
            if (prev?.incident?.id === closest.incident.id && prev.stage === closest.stage) {
                __DEV__ && console.log('[proximity] same incident+stage already showing, skipping');
                return;
            }
            // don't downgrade a higher stage alert
            if (prev && prev.stage > closest.stage) {
                __DEV__ && console.log('[proximity] keeping existing higher-stage alert');
                return;
            }

            // record immediately so rapid position updates don't re-trigger before user dismisses
            alertedIncidents.current.set(closest.incident.id, closest.stage);

            if (closest.stage === '1s') {
                // silent alert — push notification only, no modal
                __DEV__ && console.log(`[proximity] silent alert for ${closest.incident.id}`);
                sendProximityNotification?.(closest.incident, 1);
                return;
            }

            // stage 1 or 2 — show modal + push
            __DEV__ && console.log(`[proximity] setting alert → stage ${closest.stage}`);
            setActiveAlert(closest);
            sendProximityNotification?.(closest.incident, closest.stage);
        }
    }

    // keep ref pointing at latest handlePosition on every render
    handlePositionRef.current = handlePosition;

    useEffect(() => {
        let active = true;

        async function startWatcher() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                __DEV__ && console.log('[proximity] location permission status:', status);
                if (status !== 'granted' || !active) return;

                __DEV__ && console.log('[proximity] starting watcher...');
                watchRef.current = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 10 },
                    (pos) => handlePositionRef.current(pos)
                );
                __DEV__ && console.log('[proximity] watcher started');
            } catch (e) {
                __DEV__ && console.log('[proximity] watcher error:', e.message);
            }
        }

        startWatcher();

        return () => {
            __DEV__ && console.log('[proximity] cleaning up watcher');
            active = false;
            watchRef.current?.remove();
        };
    }, []);

    function dismissAlert() {
        if (!activeAlert) return;
        alertedIncidents.current.set(activeAlert.incident.id, activeAlert.stage);
        resetNotification?.();
        setActiveAlert(null);
    }

    return { activeAlert, dismissAlert };
}