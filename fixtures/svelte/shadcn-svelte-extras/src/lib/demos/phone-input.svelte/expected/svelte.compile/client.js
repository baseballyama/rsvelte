import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput } from '$lib/components/ui/phone-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);

export default function Phone_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
		Field_Field($$anchor, {
			class: 'w-fit',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Phone Number');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				PhoneInput(node_2, { placeholder: 'Enter a phone number' });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}