import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form = void 0 } = $$props;

		$$renderer.push(`<p><input type="number"${$.attr('value', form.count)}/></p>`);
		$.bind_props($$props, { form });
	});
}