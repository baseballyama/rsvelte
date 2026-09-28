import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Field_switch_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md">`);

	if (Field.Field) {
		$$renderer.push('<!--[-->');

		Field.Field($$renderer, {
			orientation: 'horizontal',
			children: ($$renderer) => {
				if (Field.Content) {
					$$renderer.push('<!--[-->');

					Field.Content($$renderer, {
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									for: '2fa',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Multi-factor authentication`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Description) {
								$$renderer.push('<!--[-->');

								Field.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Enable multi-factor authentication. If you do not have a two-factor device, you can use a
				one-time code sent to your email.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				Switch($$renderer, { id: '2fa' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}