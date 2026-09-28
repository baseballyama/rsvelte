import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<textarea>`);

	const $$body = $.escape(`test'"></textarea><script>alert('BIM');</script>`);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea>`);
}