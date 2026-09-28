import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';

var root = $.from_html(`<div class="columns margins" style="justify-content: flex-start;"><div><!> <pre class="status"> </pre></div></div>`);

export default function _Showcase($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = $.state('Orange');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		label: 'Select Menu',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => fruits, $.index, ($$anchor, fruit) => {
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
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(value) ?? ''}`));
	$.append($$anchor, div);
}