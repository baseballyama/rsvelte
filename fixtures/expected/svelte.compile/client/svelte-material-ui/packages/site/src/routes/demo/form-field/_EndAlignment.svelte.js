import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _EndAlignment($$anchor) {
	let checked = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('The input can be aligned at the end too.');

			$.append($$anchor, text);
		};

		FormField(node, {
			align: 'end',
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