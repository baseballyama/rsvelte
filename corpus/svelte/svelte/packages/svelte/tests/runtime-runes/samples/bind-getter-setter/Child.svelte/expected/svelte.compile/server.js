import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a = void 0 } = $$props;

		$$renderer.push(`<input type="value"${$.attr('value', (() => a)())}/>`);
		$.bind_props($$props, { a });
	});
}