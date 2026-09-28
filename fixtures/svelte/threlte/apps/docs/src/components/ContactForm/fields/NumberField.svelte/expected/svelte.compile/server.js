import * as $ from 'svelte/internal/server';
import Field from './Field.svelte';

export default function NumberField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label,
			id = label.toLowerCase().replace(' ', '-'),
			required = false,
			value = undefined
		} = $$props;

		Field($$renderer, {
			label,
			id,
			required,
			children: ($$renderer) => {
				$$renderer.push(`<input type="number"${$.attr('name', id)}${$.attr('required', required, true)}${$.attr('value', value)}/>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { value });
	});
}