import * as $ from 'svelte/internal/server';

export default function Spongebob_case($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = 'I love Svelte';

		function toSpongeBobCase(text) {
			return text.split('').map((c, i) => i % 2 === 1 ? c.toUpperCase() : c.toLowerCase()).join('');
		}

		$$renderer.push(`<div class="container"><textarea class="svelte-11c92f9">`);

		const $$body = $.escape(toSpongeBobCase(text));

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div>`);
	});
}