import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _Required($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		label: 'Standard',
		required: true,
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

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	Select(node_3, {
		variant: 'filled',
		label: 'Filled',
		required: true,
		get value() {
			return $.get(valueB);
		},

		set value($$value) {
			$.set(valueB, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			Option(node_4, { value: '' });

			var node_5 = $.sibling(node_4, 2);

			$.each(node_5, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(fruit)));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var pre_1 = $.sibling(node_3, 2);
	var text_3 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	Select(node_6, {
		variant: 'outlined',
		label: 'Outlined',
		required: true,
		get value() {
			return $.get(valueC);
		},

		set value($$value) {
			$.set(valueC, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_7 = $.first_child(fragment_6);

			Option(node_7, { value: '' });

			var node_8 = $.sibling(node_7, 2);

			$.each(node_8, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(fruit)));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var pre_2 = $.sibling(node_6, 2);
	var text_5 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `Selected: ${$.get(valueA) ?? ''}`);
		$.set_text(text_3, `Selected: ${$.get(valueB) ?? ''}`);
		$.set_text(text_5, `Selected: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, div);
}