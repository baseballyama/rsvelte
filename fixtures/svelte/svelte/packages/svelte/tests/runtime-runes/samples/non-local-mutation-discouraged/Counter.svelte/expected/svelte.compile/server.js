import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { object = void 0, reset } = $$props;

		$$renderer.push(`<button>clicks: ${$.escape(object.count)}</button> <button>reset</button>`);
		$.bind_props($$props, { object });
	});
}