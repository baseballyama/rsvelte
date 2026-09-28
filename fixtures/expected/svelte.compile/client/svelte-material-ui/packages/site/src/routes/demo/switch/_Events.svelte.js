import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<div><!></div> <div style="margin-top: 1em;"><!> (Notice that this doesn't fire an event.)</div> <pre class="status"> </pre>`, 1);

export default function _Events($$anchor) {
	let checked = $.state(false);
	let event = $.state(void 0);
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
					onSMUISwitchChange: (e) => $.set(event, e, true),
					get checked() {
						return $.get(checked);
					},

					set checked($$value) {
						$.set(checked, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Button(node_1, {
		onclick: () => $.set(checked, !$.get(checked)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Toggle Programmatically');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_1);

	var pre = $.sibling(div_1, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_2, `Checked: ${$.get(checked) ?? ''}, Event: ${$0 ?? ''}`), [
		() => $.get(event) ? JSON.stringify($.get(event).detail) : 'None yet.'
	]);

	$.append($$anchor, fragment);
}