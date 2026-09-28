import * as $ from 'svelte/internal/server';
import { PhoneInput } from '$lib/components/ui/phone-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

export default function Phone_input_default_value($$renderer) {
	if (Field.Field) {
		$$renderer.push('<!--[-->');

		Field.Field($$renderer, {
			class: 'w-fit',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Phone Number`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				PhoneInput($$renderer, {
					value: '+1 418 543 8090',
					placeholder: 'Enter a phone number'
				});

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