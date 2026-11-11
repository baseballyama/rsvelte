/**
 * @typedef {import('./$types.js').PageLoadEvent} Event
 */
export async function load(event) {
	return { slug: event.params.slug };
}
