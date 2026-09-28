import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ object?: { count: number }, non_bindable?: { count: number }}} */
		let { object = { count: 0 }, non_bindable = { count: 0 } } = $$props;

		$$renderer.push(`<button>mutate: ${$.escape(object.count)}</button> <button>reassign: ${$.escape(object.count)}</button> <button>mutate: ${$.escape(non_bindable.count)}</button> <button>reassign: ${$.escape(non_bindable.count)}</button>`);
		$.bind_props($$props, { object });
	});
}