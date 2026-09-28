import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <div style="margin-top: 1em;"><!></div> <pre class="status"> </pre>`, 1);

export default function _Group($$anchor) {
	const binding_group = [];

	let options = [
		{ name: 'Bashful', disabled: false },
		{ name: 'Doc', disabled: true },
		{ name: 'Dopey', disabled: false },
		{ name: 'Happy', disabled: false },
		{ name: 'Sleepy', disabled: false },
		{ name: 'Sneezy', disabled: false },
		{ name: 'Grumpy', disabled: false }
	];

	let selected = $.state($.proxy(['Happy', 'Grumpy']));
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => options, $.index, ($$anchor, option) => {
		var div = root();
		var node_1 = $.child(div);

		{
			const label = ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(option).name ?? ''}${$.get(option).disabled ? ' (disabled)' : ''}`));
				$.append($$anchor, text);
			};

			FormField(node_1, {
				label,
				children: ($$anchor, $$slotProps) => {
					Switch($$anchor, {
						get value() {
							return $.get(option).name;
						},

						get disabled() {
							return $.get(option).disabled;
						},

						get group() {
							return $.get(selected);
						},

						set group($$value) {
							$.set(selected, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$.reset(div);
		$.append($$anchor, div);
	});

	var div_1 = $.sibling(node, 2);
	var node_2 = $.child(div_1);

	Button(node_2, {
		onclick: () => {
			const idx = $.get(selected).findIndex((v) => v === 'Doc');

			if (idx > -1) {
				$.get(selected).splice(idx, 1);
			} else {
				$.get(selected).push('Doc');
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Toggle Doc Programmatically');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var pre = $.sibling(div_1, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_2, `Selected: ${$0 ?? ''}`), [() => $.get(selected).join(', ')]);
	$.append($$anchor, fragment);
}