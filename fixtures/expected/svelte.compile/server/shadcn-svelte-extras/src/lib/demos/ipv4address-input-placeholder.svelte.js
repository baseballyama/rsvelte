import * as $ from 'svelte/internal/server';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

export default function Ipv4address_input_placeholder($$renderer) {
	if (Field.Field) {
		$$renderer.push('<!--[-->');

		Field.Field($$renderer, {
			class: 'w-fit',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->IP Address`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				IPv4AddressInput($$renderer, { placeholder: '0 0 0 0' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}