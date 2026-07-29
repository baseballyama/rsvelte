export const handle = async ({ event, resolve }) => {
	return resolve(event);
};

export const handleError = ({ error, event }) => {
	console.error(error, event.url.pathname);
};

export const handleFetch = async ({ request, fetch }) => {
	return fetch(request);
};
