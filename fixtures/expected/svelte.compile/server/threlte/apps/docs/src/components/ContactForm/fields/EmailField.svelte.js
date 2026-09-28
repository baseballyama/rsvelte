import * as $ from 'svelte/internal/server';
import Field from './Field.svelte';

export default function EmailField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label = 'Email',
			id = label.toLowerCase().replace(' ', '-'),
			required = false,
			value = void 0
		} = $$props;

		Field($$renderer, {
			label,
			id,
			required,
			children: ($$renderer) => {
				$$renderer.push(`<input type="email"${$.attr('name', id)}${$.attr('required', required, true)}${$.attr('value', value)}/>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { value });
	});
}