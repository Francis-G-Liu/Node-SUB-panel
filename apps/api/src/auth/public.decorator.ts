import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Routes decorated with @Public() will skip the global AuthGuard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
