import * as $ from 'svelte/internal/server';
import { Input } from '$lib/components/ui/input';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import { Label } from '$lib/components/ui/label';
import * as Field from '$lib/components/ui/field';

export default function Ipv4address_input_reactive($$renderer) {
	let value = '192.168.1.1';
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
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						class: 'w-[198px]',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}