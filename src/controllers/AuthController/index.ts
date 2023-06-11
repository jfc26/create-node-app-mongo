import { Router } from 'express';
import { AuthController } from './AuthController';
import { verifyRefreshTokenMiddleware } from '../../middleware/http/verify-token-middleware';

export default async function loadAuthRouter(parentRouter: Router) {
    const router = Router();

    const controller = await AuthController.instance();

    // prettier-ignore
    router.post(
        '/sign-in',
        controller.signInValidatorMiddleware as any,
        controller.signInRoute as any,
    );

    // prettier-ignore
    router.get(
        '/sign-out',
        verifyRefreshTokenMiddleware as any,
        controller.signOutRoute as any,
    );

    // prettier-ignore
    router.get(
        '/refresh-token',
        verifyRefreshTokenMiddleware as any,
        controller.refreshToken as any,
    );

    parentRouter.use('/auth', router);
}
