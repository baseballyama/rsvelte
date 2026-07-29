export function GET(event) {
	return new Response(event.request.method);
}
