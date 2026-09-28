import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a = void 0 } = $$props;

		$.bind_props($$props, { a });
	});
}