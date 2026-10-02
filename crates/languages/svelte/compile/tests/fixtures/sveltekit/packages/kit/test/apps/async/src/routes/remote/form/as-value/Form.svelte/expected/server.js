import * as $ from 'svelte/internal/server';
import { as_value_form } from './form.remote';

export default function Form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { value } = $$props;
		const form = $.derived(() => as_value_form.for(value.id));

		$$renderer.push(`<form${$.attributes({ class: 'form', ...form() }, 'svelte-ukzv7l')}><input${$.attributes({ ...form().fields.hidden.string.as('hidden', 'string') }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <input${$.attributes({ ...form().fields.hidden.number.as('hidden', 1) }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <input${$.attributes({ ...form().fields.hidden.boolean.as('hidden', true) }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <input${$.attributes({ ...form().fields.text_field.as('text', value.text_field) }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <input${$.attributes(
			{
				...form().fields.number_field.as('number', value.number_field)
			},
			'svelte-ukzv7l',
			void 0,
			void 0,
			4
		)}/> `);

		$$renderer.select(
			{
				...form().fields.select_field.as('select', value.select_field)
			},
			($$renderer) => {
				$$renderer.option({}, ($$renderer) => {
					$$renderer.push(`apple`);
				});

				$$renderer.option({}, ($$renderer) => {
					$$renderer.push(`banana`);
				});

				$$renderer.option({}, ($$renderer) => {
					$$renderer.push(`cherry`);
				});
			},
			'svelte-ukzv7l'
		);

		$$renderer.push(` <input${$.attributes({ ...form().fields.color_field.as('color', value.color_field) }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <input${$.attributes({ ...form().fields.range_field.as('range', value.range_field) }, 'svelte-ukzv7l', void 0, void 0, 4)}/> <label>Checkbox <input${$.attributes(
			{
				...form().fields.checkbox_field.as('checkbox', value.checkbox_field)
			},
			'svelte-ukzv7l',
			void 0,
			void 0,
			4
		)}/></label> <button${$.attributes({ ...form().fields.id.as('submit', value.id) }, 'svelte-ukzv7l')}>submit</button></form>`);
	});
}