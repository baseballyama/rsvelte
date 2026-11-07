import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'hello';

	$$renderer.push(`<textarea>`);

	const $$body = $.escape(value);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea>`);
}