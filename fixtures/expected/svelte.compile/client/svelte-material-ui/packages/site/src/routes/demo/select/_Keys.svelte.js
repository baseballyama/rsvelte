import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _Keys($$anchor) {
	let fruits = [
		{ id: 1, label: 'Apple', price: 35 },
		{ id: 2, label: 'Orange', price: 38 },
		{ id: 3, label: 'Banana', price: 28 },
		{ id: 4, label: 'Mango', price: 25 }
	];

	let valueA = $.state(void 0);
	let valueB = $.state(true);
	let valueC = $.state(null);
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		key: (fruit) => `${fruit ? fruit.id : ''}`,
		label: 'Objects',
		get value() {
			return $.get(valueA);
		},

		set value($$value) {
			$.set(valueA, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Option(node_1, { value: undefined });

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => fruits, (fruit) => fruit.label, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(fruit).label));
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
		key: (bool) => `${bool}`,
		label: 'Booleans',
		get value() {
			return $.get(valueB);
		},

		set value($$value) {
			$.set(valueB, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			$.each(node_4, 16, () => [true, false], $.index, ($$anchor, value) => {
				Option($$anchor, {
					get value() {
						return value;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, value ? 'Yes' : 'No'));
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
	var node_5 = $.child(div_3);

	Select(node_5, {
		key: (value) => `${value == null ? '' : value}`,
		label: 'Integers',
		get value() {
			return $.get(valueC);
		},

		set value($$value) {
			$.set(valueC, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_6 = $.first_child(fragment_6);

			Option(node_6, { value: null });

			var node_7 = $.sibling(node_6, 2);

			$.each(node_7, 16, () => [0, 1, 2, 3, 4], $.index, ($$anchor, value) => {
				Option($$anchor, {
					get value() {
						return value;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, value));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var pre_2 = $.sibling(node_5, 2);
	var text_5 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_1, `Selected: ${($.get(valueA) ? $.get(valueA).label : 'None') ?? ''}, Price: ${($.get(valueA) ? $.get(valueA).price : '-') ?? ''}¢`);
			$.set_text(text_3, `Selected: ${$0 ?? ''}`);
			$.set_text(text_5, `Selected: ${$1 ?? ''}`);
		},
		[
			() => JSON.stringify($.get(valueB)),
			() => JSON.stringify($.get(valueC))
		]
	);

	$.append($$anchor, div);
}