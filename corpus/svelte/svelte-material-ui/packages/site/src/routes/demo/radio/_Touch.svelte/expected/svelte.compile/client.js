import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

var root = $.from_html(`<div class="radio-demo svelte-jw62yo"></div> <pre class="status"> </pre>`, 1);

export default function _Touch($$anchor) {
	const binding_group = [];
	let onoff = $.state('On');
	var fragment = root();
	var div = $.first_child(fragment);

	$.each(div, 20, () => ['On', 'Off'], $.index, ($$anchor, option) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, option));
				$.append($$anchor, text);
			};

			FormField($$anchor, {
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return option;
						},
						touch: true,
						get group() {
							return $.get(onoff);
						},

						set group($$value) {
							$.set(onoff, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(onoff) ?? ''}`));
	$.append($$anchor, fragment);
}