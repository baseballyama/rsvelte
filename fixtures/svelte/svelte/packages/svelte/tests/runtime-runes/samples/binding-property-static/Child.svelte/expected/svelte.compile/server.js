import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0 } = $$props;

		$$renderer.push(`<p>${$.escape(value)}</p>`);
		$.bind_props($$props, { value });
	});
}