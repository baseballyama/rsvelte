import * as $ from 'svelte/internal/server';
import { PhoneInput } from '$lib/components/ui/phone-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

export default function Phone_input_custom_ordering($$renderer) {
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
					placeholder: 'Enter a phone number',
					order: (a, b) => {
						if (a.iso2 == 'US') return -1;
						if (b.iso2 == 'US') return 1;
						if (a.iso2 == 'CN') return -1;
						if (b.iso2 == 'CN') return 1;

						return a.name.localeCompare(b.name);
					}
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