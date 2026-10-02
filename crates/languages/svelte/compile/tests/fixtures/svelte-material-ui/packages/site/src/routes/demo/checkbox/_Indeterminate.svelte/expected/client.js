import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<!> <br/> <!> <pre class="status"> </pre>`, 1);

export default function _Indeterminate($$anchor) {
	let checked = $.state(null);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('I agree to the terms.');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $.get(checked) === null);

					Checkbox($$anchor, {
						get indeterminate() {
							return $.get($0);
						},
						input$required: true,
						get checked() {
							return $.get(checked);
						},

						set checked($$value) {
							$.set(checked, $$value, true);
						}
					});
				}
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		onclick: () => $.set(checked, null),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Reset');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_1, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Checked: ${$.get(checked) ?? 'indeterminate' ?? ''}`));
	$.append($$anchor, fragment);
}