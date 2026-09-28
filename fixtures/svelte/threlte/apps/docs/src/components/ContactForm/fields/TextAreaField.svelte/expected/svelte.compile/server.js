import * as $ from 'svelte/internal/server';
import Field from './Field.svelte';

export default function TextAreaField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label,
			rows = 10,
			id = label.toLowerCase().replace(' ', '-'),
			required = false,
			value = void 0
		} = $$props;

		Field($$renderer, {
			label,
			id,
			required,
			children: ($$renderer) => {
				$$renderer.push(`<textarea${$.attr('name', id)}${$.attr('rows', rows)}${$.attr('required', required, true)}>`);

				const $$body = $.escape(value);

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { value });
	});
}