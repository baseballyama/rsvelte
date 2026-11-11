export function GET(event) {
	return new Response(event.request.method);
}

// #1918: arrow-const arm — `add_api_method_types` used to match only `FunctionDeclaration`.
export const POST = async ({ request }) => {
	return new Response(request.method);
};
