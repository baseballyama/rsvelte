import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';
import UI from '../../ui/index.js';
import fieldTypes from '../../stores/app/fieldTypes.js';

export default function Condition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();
		let { field, field_to_compare, comparable_fields, collapsed } = $$props;
		let condition = $.derived(() => field.config?.condition);

		const comparisons = [
			{ icon: 'ph:equals-bold', label: 'Equals', value: '=' },
			{
				icon: 'ph:not-equals-bold',
				label: `Doesn't equal`,
				value: '!='
			}
		];

		function dispatch_update(props) {
			dispatch('input', { ...condition(), ...props });
		}

		function delete_condition() {
			dispatch('input', null);
		}

		$$renderer.push(`<div${$.attr_class('Condition svelte-1agxqep', void 0, { 'collapsed': collapsed })}><span class="primo--field-label">Show if</span> <div class="container svelte-1agxqep">`);

		if (UI.Select) {
			$$renderer.push('<!--[-->');

			UI.Select($$renderer, {
				fallback_label: 'Field',
				value: condition()?.field,
				options: comparable_fields.map((f) => ({
					icon: $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((t) => t.id === f.type).icon,
					label: f.label,
					value: f.id,
					disabled: f.config?.condition
				}))
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (UI.Select) {
			$$renderer.push('<!--[-->');
			UI.Select($$renderer, { value: condition()?.comparison, options: comparisons });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (field_to_compare?.type === 'select') {
			$$renderer.push('<!--[0-->');

			if (UI.Select) {
				$$renderer.push('<!--[-->');

				UI.Select($$renderer, {
					fullwidth: true,
					value: condition()?.value,
					options: field_to_compare.config?.options || []
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (field_to_compare?.type === 'switch') {
			$$renderer.push('<!--[1-->');

			if (UI.Toggle) {
				$$renderer.push('<!--[-->');
				UI.Toggle($$renderer, { toggled: condition()?.value, hideLabel: true });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					placeholder: 'Value',
					value: condition()?.value || '',
					oninput: (value) => dispatch_update({ value })
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> <button class="delete svelte-1agxqep">`);
		Icon($$renderer, { icon: 'ion:trash' });
		$$renderer.push(`<!----></button></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}