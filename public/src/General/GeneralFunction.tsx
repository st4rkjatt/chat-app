

export const isTokenExpired = (token: string): boolean => {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp; // Expiration time in seconds since the epoch
    const now = Date.now() / 1000; // Current time in seconds since the epoch
    return exp < now;
}
