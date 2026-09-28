import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { arr = void 0 } = $$props;

		$$renderer.push(`<button></button>`);
		$.bind_props($$props, { arr });
	});
}