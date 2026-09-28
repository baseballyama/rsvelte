import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref } = $$props;
		let tick = 0;
		let ref_exists = true;

		$$renderer.push(`<p>${$.escape(ref_exists)}</p> <button>check</button>`);
	});
}