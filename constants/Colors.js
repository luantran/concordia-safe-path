export const Colors = {
    primary: '#59A7E7', // light blue — primary actions, highlights
    primaryDark: '#025BA3',   // dark blue — buttons, FAB, active states

    warning: '#cc475a',   // destructive actions, high-urgency alerts
    attention: '#F7B023',
    //   Theme (light / dark)
    dark: {
        text:             '#d4d4d4',
        title:            '#fff',
        background:       '#252231',
        navBackground:    '#201e2b',
        iconColor:        '#9591a5',
        iconColorFocused: '#fff',
        uiBackground:     '#2f2b3d',
        tint:             '#59A7E7',
    },
    light: {
        text:             '#4a5568',
        title:            '#025BA3',
        background:       '#f0f4f8',
        navBackground:    '#ffffff',
        iconColor:        '#59A7E7',
        iconColorFocused: '#025BA3',
        uiBackground:     '#ffffff',
        tint:             '#025BA3',
    },

    //   Incident severity
    severity: {
        high:   '#ff6b6b',   // red
        medium: '#ffd93d',   // yellow
        low:    '#6bcb77',   // green
    },

    // Incident type
    type: {
        protest:      '#e74c3c',
        construction: '#f39c12',
        blockade:     '#27ae60',
        vandalism:    '#8e44ad',
        emergency:    '#cc475a',
    },

    // Badge / status
    badge: {
        verified:         '#27ae60',   // green  — verified by campus
        verifiedBg:       '#27ae6022',
        reported:         '#59A7E7',   // light blue — reported by users
        reportedBg:       '#59A7E722',
        resolved:         '#626262',   // grey   — resolved incidents
        resolvedBg:       '#62626222',
    },

    // Map markers
    marker: {
        building:         '#025BA3',   // dark blue dot — Concordia buildings
        buildingInner:    '#fff',
    },

    // UI utilities
    overlay:              '#00000066', // modal backdrop
    divider:              '#59A7E733', // subtle separator line
    white:                '#fff',
    black:                '#000',

    severityFill: {
    low: "rgba(0,200,0,0.2)",
    medium: "rgba(255,200,0,0.2)",
    high: "rgba(255,0,0,0.2)"
  },
}