import * as $ from 'svelte/internal/server';

export default function Head_memo($$renderer) {
	let title = "A";
	function value() {
		return title;
	}
	$.head('151bazv', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>${$.escape(value())}</title>`);
		});
	});
	$$renderer.push(`<button>change</button>`);
}
