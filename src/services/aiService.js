const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}/api`;

const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 10000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') throw new Error('Request timed out. The server might be unreachable.');
        throw error;
    }
};

export const getTransportSuggestion = async (startingLocation, destination, dates, transportMode = null) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/suggest-transport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingLocation,
            destination,
            dates,
            transportMode
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
    }

    return response.json();
};

export const getPreferenceSuggestion = async (startingLocation, destination, dates, travelers, transportMode, budgetMode, budgetRange, budgetStyle) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/suggest-preferences`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingLocation,
            destination,
            dates,
            travelers,
            transportMode,
            budgetMode,
            budgetRange,
            budgetStyle
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get preference suggestion');
    }

    return response.json();
};

export const getBudgetEstimate = async (startingLocation, destination, dates, travelers) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/estimate-budget`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingLocation,
            destination,
            dates,
            travelers
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get budget estimate');
    }

    return response.json();
};
export const getActivitySuggestions = async (startingLocation, destination, dates, tripType, travelers) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/suggest-activities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingLocation,
            destination,
            dates,
            tripType,
            travelers
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get activity suggestions');
    }

    return response.json();
};
export const getPackingSuggestions = async (destination, startingLocation, dates, travelers, transportMode, tripType, foodPreferences, stayType, budgetStyle) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/suggest-packing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination,
            startingLocation,
            dates,
            travelers,
            transportMode,
            tripType,
            foodPreferences,
            stayType,
            budgetStyle
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get packing suggestions');
    }

    return response.json();
};
export const generateTripPlan = async (startingLocation, destination, startDate, endDate, travelers, transportMode, budgetMode, budgetMin, budgetMax, budgetStyle, tripType, foodPreferences, stayPreference, travelPace = 'Moderate') => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/generate-plan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startingLocation,
            destination,
            startDate,
            endDate,
            travelers,
            transportMode,
            budgetMode,
            budgetMin,
            budgetMax,
            budgetStyle,
            tripType,
            foodPreferences,
            stayPreference,
            travelPace
        }),
        timeout: 60000
    });

    if (!response.ok) {
        throw new Error('Failed to generate trip plan');
    }

    return response.json();
};

export const analyzeOmissions = async (destination, omittedItemsJson) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/analyze-omissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination,
            omittedItemsJson
        })
    });

    if (!response.ok) {
        throw new Error('Failed to analyze omissions');
    }

    return response.json();
};

export const getTripInsights = async (destination, startingLocation, dates, travelers) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/trip-insights`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination,
            startingLocation,
            dates,
            travelers
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get trip insights');
    }

    return response.json();
};

export const getRecoverySteps = async (itemName, lastLocation, reason) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Ai/suggest-recovery`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itemName,
            lastLocation,
            reason
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get recovery steps');
    }

    return response.json();
};
