import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let action = 'old url';

		$$renderer.push(`<form${$.attr('action', action)}><button type="submit">Submit</button></form>`);
	});
}