import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <div style="margin-top: 1em;"><!></div> <pre class="status"> </pre></div></div>`);

export default function _Invalid($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueA = $.state('');
	let invalidA = $.state(false);
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		label: 'Fruit',
		get invalid() {
			return $.get(invalidA);
		},
		updateInvalid: false,
		get value() {
			return $.get(valueA);
		},

		set value($$value) {
			$.set(valueA, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Option(node_1, { value: '' });

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(fruit)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 2);
	var node_3 = $.child(div_2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Invalid');

			$.append($$anchor, text_1);
		};

		FormField(node_3, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(invalidA);
					},

					set checked($$value) {
						$.set(invalidA, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_2);

	var pre = $.sibling(div_2, 2);
	var text_2 = $.only_child(pre);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_2, `Selected: ${$.get(valueA) ?? ''}`));
	$.append($$anchor, div);
}