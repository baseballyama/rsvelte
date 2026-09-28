import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open: is_open = void 0 } = $$props;

		function open() {
			is_open = !is_open;
		}

		$$renderer.push(`<button>${$.escape(is_open)}</button>`);
		$.bind_props($$props, { open: is_open, open });
	});
}