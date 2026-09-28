import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';
import UI from '../../ui/index.js';
import fieldTypes from '../../stores/app/fieldTypes.js';

var root = $.from_html(`<div><span class="primo--field-label">Show if</span> <div class="container svelte-1agxqep"><!> <!> <!> <button class="delete svelte-1agxqep"><!></button></div></div>`);

export default function Condition($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();
	let condition = $.derived(() => $$props.field.config?.condition);

	const comparisons = [
		{ icon: 'ph:equals-bold', label: 'Equals', value: '=' },
		{
			icon: 'ph:not-equals-bold',
			label: `Doesn't equal`,
			value: '!='
		}
	];

	function dispatch_update(props) {
		dispatch('input', { ...$.get(condition), ...props });
	}

	function delete_condition() {
		dispatch('input', null);
	}

	var div = root();
	let classes;
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(condition)?.field);

		let $1 = $.derived(() => $$props.comparable_fields.map((f) => ({
			icon: $fieldTypes().find((t) => t.id === f.type).icon,
			label: f.label,
			value: f.id,
			disabled: f.config?.condition
		})));

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				fallback_label: 'Field',
				get value() {
					return $.get($0);
				},

				get options() {
					return $.get($1);
				},

				$$events: {
					input: ({ detail: field_id }) => {
						let default_value = '';
						const selected_field = $$props.comparable_fields.find((f) => f.id === field_id);

						if (selected_field.type === 'select') {
							default_value = selected_field.config?.options?.[0]?.value;
						} else {
							default_value = selected_field.value;
						}

						dispatch_update({ field: field_id, value: default_value });
					}
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(condition)?.comparison);

		$.component(node_1, () => UI.Select, ($$anchor, UI_Select_1) => {
			UI_Select_1($$anchor, {
				get value() {
					return $.get($0);
				},

				get options() {
					return comparisons;
				},

				$$events: {
					input: ({ detail: comparison }) => dispatch_update({ comparison })
				}
			});
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			{
				let $0 = $.derived(() => $.get(condition)?.value);
				let $1 = $.derived(() => $$props.field_to_compare.config?.options || []);

				$.component(node_3, () => UI.Select, ($$anchor, UI_Select_2) => {
					UI_Select_2($$anchor, {
						fullwidth: true,
						get value() {
							return $.get($0);
						},

						get options() {
							return $.get($1);
						},
						$$events: { input: ({ detail: value }) => dispatch_update({ value }) }
					});
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(condition)?.value);

				$.component(node_4, () => UI.Toggle, ($$anchor, UI_Toggle) => {
					UI_Toggle($$anchor, {
						get toggled() {
							return $.get($0);
						},
						hideLabel: true,
						$$events: {
							toggle: ({ detail }) => {
								dispatch_update({ value: detail });
							}
						}
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => $.get(condition)?.value || '');

				$.component(node_5, () => UI.TextInput, ($$anchor, UI_TextInput) => {
					UI_TextInput($$anchor, {
						placeholder: 'Value',
						get value() {
							return $.get($0);
						},
						oninput: (value) => dispatch_update({ value })
					});
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.field_to_compare?.type === 'select') $$render(consequent); else if ($$props.field_to_compare?.type === 'switch') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var button = $.sibling(node_2, 2);
	var node_6 = $.child(button);

	Icon(node_6, { icon: 'ion:trash' });
	$.reset(button);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'Condition svelte-1agxqep', null, classes, { collapsed: $$props.collapsed }));
	$.delegated('click', button, delete_condition);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);