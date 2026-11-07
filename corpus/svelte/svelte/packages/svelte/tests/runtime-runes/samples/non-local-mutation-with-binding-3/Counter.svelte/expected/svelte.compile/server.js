import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ shared: { count: number }, notshared: { count: number } }} */
		let { shared = void 0, notshared } = $$props;

		$$renderer.push(`<button>clicks: ${$.escape(shared.count)}</button> <button>clicks: ${$.escape(notshared.count)}</button>`);
		$.bind_props($$props, { shared });
	});
}