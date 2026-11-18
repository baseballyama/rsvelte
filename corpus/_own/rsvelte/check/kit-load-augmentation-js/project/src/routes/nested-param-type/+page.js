/**
 * @param {{ url: URL }} event
 */
export async function load(event) {
	return { slug: event.params.slug };
}
