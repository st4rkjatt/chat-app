import {jwtDecode} from 'jwt-decode';

// Function to check if the token is valid and not expired
export const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false; // No token found
    try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decodedToken.exp > currentTime;
    } catch (error) {
        console.error("Token decoding error:", error);
        return false;
    }
};