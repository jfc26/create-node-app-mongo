export {};

declare global {
    interface JwtDecodePayload {
        /**
         * the number of seconds elapsed since the epoch
         */
        iat: number;

        /**
         * the number of seconds elapsed since the epoch
         */
        exp: number;
    }

    interface AccessToken {
        userId: string;
    }

    interface RefreshToken {
        _id: string;
        userId: string;
    }
}
