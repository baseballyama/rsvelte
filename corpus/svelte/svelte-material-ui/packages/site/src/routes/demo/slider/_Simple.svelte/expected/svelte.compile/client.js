import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<span style="padding-inline-end: 12px; width: max-content; display: block;">Amount of Wonder</span>`);
var root_1 = $.from_html(`<p>No wonder.</p>`);
var root_2 = $.from_html(`<!> <!> <div><!></div> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	let value = $.state(50);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		FormField(node, {
			align: 'end',
			style: 'display: flex;',
			label,
			children: ($$anchor, $$slotProps) => {
				Slider($$anchor, {
					style: 'flex-grow: 1;',
					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(value) == 0) $$render(consequent);
		});
	}

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	Button(node_2, {
		onclick: () => $.set(value, 100),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Maximum Wonder!');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Value: ${$.get(value) ?? ''}`));
	$.append($$anchor, fragment);
}