import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<div class="radio-demo svelte-bhrlk1"></div> <div style="margin-top: 1em;"><!></div> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
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

	let selected = $.state('Grumpy');
	var fragment = root();
	var div = $.first_child(fragment);

	$.each(div, 21, () => options, $.index, ($$anchor, option) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(option).name ?? ''}${$.get(option).disabled ? ' (disabled)' : ''}`));
				$.append($$anchor, text);
			};

			FormField($$anchor, {
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
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
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	Button(node, {
		onclick: () => {
			$.set(selected, 'Doc');
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Select Doc Programmatically');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var pre = $.sibling(div_1, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}