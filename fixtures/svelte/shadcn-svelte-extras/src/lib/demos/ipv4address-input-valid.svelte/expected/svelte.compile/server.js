import * as $ from 'svelte/internal/server';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

export default function Ipv4address_input_valid($$renderer) {
	let valid = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
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

					IPv4AddressInput($$renderer, {
						value: '192.168.1.1',
						class: 'aria-invalid:border-destructive',
						get valid() {
							return valid;
						},

						set valid($$value) {
							valid = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <span>Valid: <span${$.attr('data-valid', valid)} class="text-green-500 data-[valid=false]:text-red-600">${$.escape(valid)}</span></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}