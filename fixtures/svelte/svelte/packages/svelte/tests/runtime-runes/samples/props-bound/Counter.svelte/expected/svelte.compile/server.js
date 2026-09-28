import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count = void 0 } = $$props;

		$$renderer.push(`<button>${$.escape(count)}</button>`);
		$.bind_props($$props, { count });
	});
}