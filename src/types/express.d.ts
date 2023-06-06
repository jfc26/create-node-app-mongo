export {};

declare module 'express' {
    interface Request {
        accessToken: AccessToken;
        refreshToken: RefreshToken;
    }
}
