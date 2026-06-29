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
        if (error.name === 'AbortError') throw new Error('Authentication request timed out. The server might be unreachable.');
        throw error;
    }
};
const API_URL = `${BASE_URL}/Auth`;

export const getUserProfile = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/User/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }
    return response.json();
};

export const register = async (fullName, email, password) => {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetchWithTimeout(`${API_URL}/register`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Action failed';
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

export const login = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetchWithTimeout(`${API_URL}/login`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Login failed';
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

export const adminLogin = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetchWithTimeout(`${API_URL}/admin-login`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Admin login failed';
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

export const socialLogin = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    const response = await fetchWithTimeout(`${API_URL}/social-login`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Social login failed';
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
export const completeRegistration = async (formData, token) => {
    const response = await fetchWithTimeout(`${API_URL}/complete-registration`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Onboarding failed';
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

export const updateProfile = async (profileData, token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/User/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    });
    if (!response.ok) {
        throw new Error('Failed to update profile');
    }
    return response.json();
};

export const updateProfileImage = async (imageFile, token) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetchWithTimeout(`${BASE_URL}/User/profile-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error('Failed to upload profile image');
    }
    return response.json();
};

export const logout = async (token, refreshToken) => {
    const formData = new FormData();
    if (refreshToken) formData.append('refreshToken', refreshToken);

    const response = await fetchWithTimeout(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error('Logout failed on server');
    }
    return response.json();
};

export const terminateSession = async (sessionId, token) => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);

    const response = await fetchWithTimeout(`${API_URL}/terminate-session`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error('Failed to terminate session');
    }
    return response.json();
};

export const deleteAccount = async (token) => {
    const response = await fetchWithTimeout(`${BASE_URL}/User/delete-account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete account');
    }
    return response.json();
};

export const changePassword = async (currentPassword, newPassword, token) => {
    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);

    const response = await fetchWithTimeout(`${BASE_URL}/User/change-password`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to change password';
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
