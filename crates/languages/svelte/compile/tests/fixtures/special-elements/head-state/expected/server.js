import * as $ from 'svelte/internal/server';

export default function Head_state($$renderer) {
	let title = "Hello";
	$.head('b0p9we', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>${$.escape(title)}</title>`);
		});
	});
	$$renderer.push(`<button>change</button>`);
}
