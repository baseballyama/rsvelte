import * as $ from 'svelte/internal/server';

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0 } = $$props;

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', value, true)}/></label>`);
		$.bind_props($$props, { value });
	});
}