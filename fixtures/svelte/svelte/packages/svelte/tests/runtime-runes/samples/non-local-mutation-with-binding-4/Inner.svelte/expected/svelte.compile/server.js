import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { object = void 0 } = $$props;

		$$renderer.push(`<button>clicks: ${$.escape(object.count)}</button>`);
		$.bind_props($$props, { object });
	});
}