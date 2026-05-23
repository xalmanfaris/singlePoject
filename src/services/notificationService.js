import { getCookie } from './cookieService';

const BASE_URL = 'http://172.16.1.48:5042/api/Notification';

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
