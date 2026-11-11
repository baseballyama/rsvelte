import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';

const logger: Handle = async ({ event, resolve }) => resolve(event);
const auth = (async ({ event, resolve }) => resolve(event)) satisfies Handle;

export const handle = sequence(logger, auth);

export const handleError = (({ error, event }) => {
	console.error(error, event.url.pathname);
}) satisfies HandleServerError;

export const handleFetch: HandleFetch = async ({ request, fetch }) => fetch(request);
