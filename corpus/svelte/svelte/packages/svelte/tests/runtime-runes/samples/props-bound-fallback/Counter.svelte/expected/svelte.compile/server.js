import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count = 0 } = $$props;

		$$renderer.push(`<span>${$.escape(count)}</span>`);
		$.bind_props($$props, { count });
	});
}