/**
 * Provides the incidents list and all incident-related CRUD operations
 * to the dashboard portion of the app.
 *
 * What's stored in context:
 *  - incidents: Array of all incident objects fetched from Supabase. Kept in-sync with database with Postgres changes subscription.
 *  - fetchIncidents(): fetches the full incident list from Supabase
 *  - fetchIncidentById(): Fetches a single incident by ID. Used by the incident detail screen (/incidents/[id])
 *  - createIncident(): Inserts a new incident, with the current user's ID. real-time subscription picks up the INSERT and adds it to the local list automatically.
 *
 * Real-time behaviour:
 *  A Supabase channel subscribes to all Postgres changes on the `incidents`
 *  table. INSERT events append the new row; UPDATE events replace the
 *  matching row in local state.
 *
 * TODO (Goal 3):
 *  - Add upvoteIncident() for community verification ("Reported by X users")
 *  - Add verifyIncident() for security staff only
 *  - Add addComment() for supporting details on reports
 * TODO (Goal 4):
 *  - Add flagAsResolved() / flagAsOutdated()
 *  - Add followIncident() to subscribe to status-change notifications
 * TODO (Goal 7):
 *  - Add anonymous submission support (omit user_id or use a flag)
 */

import {createContext, useCallback, useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from "../hooks/useUser";
import {useNetwork} from "../hooks/useNetwork";

const TABLE = 'incidents'

export const IncidentsContext = createContext()

export function IncidentsProvider({ children }) {
    // The full list of incidents from the database
    const [incidents, setIncidents] = useState([])
    const { user } = useUser()
    const { isOnline } = useNetwork()


    /**
     * Loads all incidents from the database and replaces local state.
     *
     * Note: Currently fetches ALL incidents with no filters or pagination.
     * TODO: Add pagination or a date range filter as the dataset grows.
     */
    const fetchIncidents = useCallback(async () => {
        // Guard: don't attempt a fetch if there's no authenticated user.
        if (!user?.id) return
        try {
            const { data } = await supabase
                .from(TABLE)
                .select('*')
            // TODO: handle `error` here — currently silently ignored if fetch fails
            setIncidents(data || []) // siva_test
        } catch (error) {
            console.log('fetchIncidents:', error.message)
        }
    }, [user?.id])

    /**
     * Fetches a single incident by its primary key. Returns the incident object, or undefined on error.
     * @param {string} id — UUID of the incident
     * @returns {object|undefined}
     */
    async function fetchIncidentById(id) {
        try {
            const { data } = await supabase
                .from(TABLE)
                .select('*')
                .eq('id', id)
                .single() // Throws if 0 or >1 rows are returned
            return data
        } catch (error) {
            console.log('fetchIncidentById:', error.message)
        }
    }

    /**
     * createIncident(data)
     *
     * Inserts a new incident row, with the current user's id
     *
     * After insert, the real-time subscription fires an INSERT event
     * which appends the new incident to local state
     *
     * @param {object} data — Incident fields: { type, description, severity,
     *                        latitude, longitude }
     */
    async function createIncident(data) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .insert({ ...data, user_id: user.id })
            if (error) throw new Error(error.message)
        } catch (error) {
            console.log('createIncident:', error.message)
        }
    }

    useEffect(() => {
        // If  user logs out, clear local incidents list immediately
        // to prevent a previous user's data from being visible to the next.
        // TODO: to remove, logic from the tutorial
        if (!user?.id) {
            setIncidents([])
            return
        }

        // Initial fetch when the user becomes available
        if (isOnline) fetchIncidents()

        // Set up a real-time Postgres subscription on the incidents table.
        // Any change to `incidents` in the database fires the callback below.
        const channel = supabase
            .channel('incidents-changes') // Channel name — must be unique per client
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: TABLE }, // '*' = INSERT + UPDATE + DELETE
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Append the new row to the end of the list
                        setIncidents((prev) => [...prev, payload.new])
                    }

                    if (payload.eventType === 'UPDATE') {
                        // Replace the matching row in-place (e.g. status change,
                        // upvote count increment, verified flag flip)
                        setIncidents((prev) =>
                            prev.map((b) => b.id === payload.new.id ? payload.new : b)
                        )
                    }
                }
            )
            .subscribe()

        // Clean up the channel when user logs out or the component unmounts.
        return () => supabase.removeChannel(channel)

    }, [user]) // Re-run whenever the user changes (login / logout)

    return (
        <IncidentsContext.Provider value={{ incidents, fetchIncidents, fetchIncidentById, createIncident }}>
            {children}
        </IncidentsContext.Provider>
    )
}