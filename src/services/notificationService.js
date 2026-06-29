import { getCookie } from './cookieService';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}/api/Notification`;

export const getNotifications = async () => {
    const userCookie = getCookie('user');
    const token = userCookie ? (userCookie.token || userCookie.Token) : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(BASE_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
};

export const markAsRead = async (notificationId) => {
    const userCookie = getCookie('user');
    const token = userCookie ? (userCookie.token || userCookie.Token) : null;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Failed to mark notification as read');
    return true;
};
