export const handleError = ({ error, event }) => {
	console.error(error, event.url.pathname);
};
