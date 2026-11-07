import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ object: { count: number }}} */
		let { object = void 0 } = $$props;

		$$renderer.push(`<button>clicks: ${$.escape(object.count)}</button>`);
		$.bind_props($$props, { object });
	});
}