import * as $ from 'svelte/internal/server';

export default function Bindable_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected = void 0 } = $$props;

		$$renderer.push(`<input type="text"${$.attr('value', selected.value)}/>`);
		$.bind_props($$props, { selected });
	});
}