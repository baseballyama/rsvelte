import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useSearchParams, createSearchParamsSchema } from "runed/kit";
import { Button, DemoContainer, Input } from "@svecodocs/kit";

var root = $.from_html(`<div class="flex items-center gap-3"><!> <!> <!></div>`);
var root_1 = $.from_html(`<!> <form class="flex items-center gap-3"><!> <!> <!></form>`, 1);

export default function Use_search_params($$anchor, $$props) {
	$.push($$props, true);

	const params = useSearchParams(createSearchParamsSchema({ fields: { type: "object", default: {}, objectType: {} } }));
	const newField = $.proxy({ key: "", value: "" });

	function addField() {
		if (newField.key.trim() && newField.value.trim()) {
			params.fields = { ...params.fields, [newField.key]: newField.value };
			newField.key = "";
			newField.value = "";
		}
	}

	function removeField(key) {
		const newFields = { ...params.fields };

		delete newFields[key];
		params.fields = newFields;
	}

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => Object.entries(params.fields), ([key, _value]) => key, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let _value = () => $.get($$array)[1];
				var div = root();
				var node_1 = $.child(div);

				Input(node_1, {
					class: 'flex-1',
					get value() {
						return key();
					},
					placeholder: 'Key',
					readonly: true
				});

				var node_2 = $.sibling(node_1, 2);

				Input(node_2, {
					class: 'flex-1',
					placeholder: 'Value',
					get value() {
						return params.fields[key()];
					},

					set value($$value) {
						params.fields[key()] = $$value;
					}
				});

				var node_3 = $.sibling(node_2, 2);

				Button(node_3, {
					class: 'shrink-0',
					variant: 'brand',
					onclick: () => removeField(key()),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Remove');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			});

			var form = $.sibling(node, 2);
			var node_4 = $.child(form);

			Input(node_4, {
				class: 'flex-1',
				placeholder: 'Key',
				get value() {
					return newField.key;
				},

				set value($$value) {
					newField.key = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Input(node_5, {
				class: 'flex-1',
				placeholder: 'Value',
				get value() {
					return newField.value;
				},

				set value($$value) {
					newField.value = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				variant: 'brand',
				class: 'shrink-0',
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Add Field');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(form);

			$.event('submit', form, (e) => {
				e.preventDefault();
				addField();
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}