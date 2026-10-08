import type { Handle } from '@sveltejs/kit';
import { langOf } from '$lib/i18n';

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, { transformPageChunk: (chunk) => chunk.html.replace('%lang%', langOf(event.url.pathname)) });
