import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Checkbox($$anchor) {
	let checked = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Form fields let you click the label to toggle or focus the form control.');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
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

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Checked: ${$.get(checked) ? 'Yes' : 'No'}`));
	$.append($$anchor, fragment);
}