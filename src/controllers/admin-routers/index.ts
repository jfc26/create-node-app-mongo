import { Router } from 'express';
import { verifyAccessTokenMiddleware } from '../../middleware/http/verify-token-middleware';

export default async function loadAdminRouter(parentRouter: Router) {
    const router = Router();

    // TODO -

    // prettier-ignore
    parentRouter.use(
        '/admin',
        verifyAccessTokenMiddleware as any,
        router
    );
}
