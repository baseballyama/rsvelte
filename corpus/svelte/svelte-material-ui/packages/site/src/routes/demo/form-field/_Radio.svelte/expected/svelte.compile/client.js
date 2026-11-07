import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FormField from '@smui/form-field';
import Radio from '@smui/radio';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Radio($$anchor) {
	const binding_group = [];
	let selected = $.state('yes');
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ['yes', 'no'], $.index, ($$anchor, option) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), [() => `${option[0].toUpperCase()}${option.slice(1)}`]);
				$.append($$anchor, text);
			};

			FormField($$anchor, {
				style: 'margin-right: 1em;',
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return option;
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

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}