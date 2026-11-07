import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);

export default function Ipv4address_input_placeholder($$anchor) {
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

						var text = $.text('IP Address');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				IPv4AddressInput(node_2, { placeholder: '0 0 0 0' });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}