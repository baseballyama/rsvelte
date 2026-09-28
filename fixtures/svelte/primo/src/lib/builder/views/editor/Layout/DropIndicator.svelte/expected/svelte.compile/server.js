import * as $ from 'svelte/internal/server';

export default function DropIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { node = void 0 } = $$props;

		$$renderer.push(`<div class="DropIndicator svelte-197decz"></div>`);
		$.bind_props($$props, { node });
	});
}