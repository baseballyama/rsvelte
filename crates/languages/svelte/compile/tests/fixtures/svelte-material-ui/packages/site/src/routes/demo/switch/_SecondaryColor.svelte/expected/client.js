import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';

var root = $.from_html(`<div><!></div> <pre class="status"> </pre> <div style="margin-top: 1em;"><!></div> <pre class="status"> </pre>`, 1);

export default function _SecondaryColor($$anchor) {
	let checked1 = $.state(false);
	let checked2 = $.state(false);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Fields of grain.');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, {
					color: 'secondary',
					get checked() {
						return $.get(checked1);
					},

					set checked($$value) {
						$.set(checked1, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);
	var div_1 = $.sibling(pre, 2);
	var node_1 = $.child(div_1);

	{
		const label = ($$anchor) => {
			$.next();

			var text_2 = $.text('Fields of grain.');

			$.append($$anchor, text_2);
		};

		FormField(node_1, {
			align: 'end',
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, {
					color: 'secondary',
					get checked() {
						return $.get(checked2);
					},

					set checked($$value) {
						$.set(checked2, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_1);

	var pre_1 = $.sibling(div_1, 2);
	var text_3 = $.only_child(pre_1);

	$.template_effect(() => {
		$.set_text(text_1, `Checked: ${$.get(checked1) ?? ''}`);
		$.set_text(text_3, `Checked: ${$.get(checked2) ?? ''}`);
	});

	$.append($$anchor, fragment);
}