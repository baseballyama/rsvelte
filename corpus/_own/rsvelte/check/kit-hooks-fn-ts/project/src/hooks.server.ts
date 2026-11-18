export function handle({ event, resolve }) {
	return resolve(event);
}

export function handleError({ error, event }) {
	console.error(error, event.url.pathname);
}

export function handleFetch({ request, fetch }) {
	return fetch(request);
}
