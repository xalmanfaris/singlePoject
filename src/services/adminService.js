const BASE_URL = 'http://172.16.1.48:5042/api';

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

export const getAllUsers = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch users list');
    }
    return response.json();
};

export const toggleUserStatus = async (userId, token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to toggle user status';
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const toggleUserRole = async (userId, token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/users/${userId}/toggle-role`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to toggle user role';
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const getAllTrips = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/trips`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch system trips list');
    }
    return response.json();
};

export const getTripDetails = async (tripId, token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/trips/${tripId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch trip details');
    }
    return response.json();
};

export const getAllLostItems = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/lost-items`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch lost items');
    }
    return response.json();
};

export const sendAdminManualNotification = async (tripId, contextType, activityName = null, customMessage = null, token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/trips/${tripId}/manual-notify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contextType, activityName, customMessage })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to send admin manual notification');
    }

    return response.json();
};

export const getOverviewStats = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/Admin/overview-stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch overview stats');
    }
    return response.json();
};

