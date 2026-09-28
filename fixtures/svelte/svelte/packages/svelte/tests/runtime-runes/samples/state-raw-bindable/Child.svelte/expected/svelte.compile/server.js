import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { object = void 0 } = $$props;

		$$renderer.push(`<button>reassign</button> <button>mutate</button>`);
		$.bind_props($$props, { object });
	});
}