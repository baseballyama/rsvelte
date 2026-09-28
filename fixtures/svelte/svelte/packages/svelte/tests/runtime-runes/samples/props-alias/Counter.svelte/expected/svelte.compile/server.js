import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count: definedCount = void 0 } = $$props;

		$$renderer.push(`<button>${$.escape(definedCount)}</button>`);
		$.bind_props($$props, { count: definedCount });
	});
}