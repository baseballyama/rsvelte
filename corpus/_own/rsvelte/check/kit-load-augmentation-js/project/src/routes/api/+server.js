/**
 * @param {import('./$types.js').RequestEvent} event
 */
export async function GET(event) {
	return new Response(event.request.method);
}
