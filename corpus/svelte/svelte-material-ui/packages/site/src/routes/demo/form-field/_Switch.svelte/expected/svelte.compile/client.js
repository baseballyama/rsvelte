import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FormField from '@smui/form-field';
import Switch from '@smui/switch';

var root = $.from_html(`I agree to the terms and conditions of the software, <small style="opacity: .4;">and hereby sign away my rights just to use this app.</small>`, 1);
var root_1 = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Switch($$anchor) {
	let agreed = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const label = ($$anchor) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, {
					get checked() {
						return $.get(agreed);
					},

					set checked($$value) {
						$.set(agreed, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Agreed: ${$.get(agreed) ? 'Yes, muahahah.' : 'Not yet.'}`));
	$.append($$anchor, fragment);
}