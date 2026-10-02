import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bar = void 0 } = $$props;

		$$renderer.push(`<button>${$.escape(bar)}</button>`);
		$.bind_props($$props, { bar });
	});
}