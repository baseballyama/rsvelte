/**
 * @typedef {import('@sveltejs/kit').HandleClientError} HandleClientError
 */
export async function handleError({ error, event }) {
	console.error(error, event.url.pathname);
}
