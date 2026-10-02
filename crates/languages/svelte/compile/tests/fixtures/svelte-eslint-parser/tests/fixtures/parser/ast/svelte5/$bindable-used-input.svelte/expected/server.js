import * as $ from 'svelte/internal/server';

export default function $bindable_used_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { b = void 0 } = $$props;

		function handler() {
			b++;
		}

		$$renderer.push(`<button>Click Me!</button>`);
		$.bind_props($$props, { b });
	});
}