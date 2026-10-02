import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Ipv4address_input_reactive($$anchor) {
	let value = '192.168.1.1';
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

				IPv4AddressInput(node_2, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				});

				var node_3 = $.sibling(node_2, 2);

				Input(node_3, {
					class: 'w-[198px]',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}