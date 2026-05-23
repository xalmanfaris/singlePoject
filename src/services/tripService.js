import { getCookie } from './cookieService';

const BASE_URL = 'http://172.16.1.48:5042/api/Trip';

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
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The server might be slow or unreachable.');
        }
        throw error;
    }
};

export const saveTripPlan = async (tripData) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...tripData,
            travelers: parseInt(tripData.travelers) || 1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error details:", response.status, errorText);
        throw new Error(`Failed to save trip: ${response.status} ${errorText}`);
    }

    return response.json();
};

export const getMyTrips = async () => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/my-trips`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetchWithTimeout trips');
    }

    return response.json();
};

export const getUserLostItems = async () => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/lost-items`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetchWithTimeout lost items');
    }

    return response.json();
};

export const markItemAsRecovered = async (itemId, recoveredFrom) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const url = recoveredFrom
        ? `${BASE_URL}/lost-items/${itemId}/recover?recoveredFrom=${encodeURIComponent(recoveredFrom)}`
        : `${BASE_URL}/lost-items/${itemId}/recover`;

    const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to mark item as recovered: ${errorText}`);
    }

    return response.json();
};

export const saveChecklistState = async (tripId, checkedItemsJson) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/checklist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ checkedItemsJson })
    });

    if (!response.ok) {
        throw new Error('Failed to save checklist');
    }

    return response.json();
};

export const getChecklistState = async (tripId) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/checklist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetchWithTimeout checklist');
    }

    return response.json();
};

export const deleteTripPlan = async (tripId) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete trip');
    }

    return response.json();
};

export const updateTripLocation = async (tripId, index) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/location/${index}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to update location');
    }

    return response.json();
};

export const getTripLocation = async (tripId) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/location`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetchWithTimeout location');
    }

    return response.json();
};

export const predictLostItems = async (tripId, data) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/predict-lost`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
        timeout: 30000
    });

    if (!response.ok) {
        throw new Error('Failed to predict lost items');
    }

    const result = await response.json();
    return typeof result === 'string' ? JSON.parse(result) : result;
};

export const saveLostItemReason = async (tripId, data) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/lost-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to save lost item reason');
    }

    return response.json();
};

export const removeItemFromDb = async (tripId, itemName) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/item?itemName=${encodeURIComponent(itemName)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to remove item from database');
    }

    return response.json();
};

export const updateActivityTime = async (tripId, day, activityIndex, newTime) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/activity-time`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ day, activityIndex, newTime })
    });

    if (!response.ok) {
        throw new Error('Failed to update activity time');
    }

    return response.json();
};

export const updateTripStartTime = async (tripId, newStartTime) => {
    const userCookie = getCookie('user');
    const token = userCookie ? userCookie.token : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetchWithTimeout(`${BASE_URL}/${tripId}/start-time`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newStartTime })
    });

    if (!response.ok) {
        throw new Error('Failed to update trip start time');
    }

    return response.json();
};

