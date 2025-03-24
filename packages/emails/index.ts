import type { WelcomeProps, InviteProps } from './types';

const welcome = (await import('./components/emails/welcome.vue')).default;
const invite = (await import('./components/emails/invite.vue')).default;

export { welcome, invite };
export type { WelcomeProps, InviteProps };
