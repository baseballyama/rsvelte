import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Field_checkbox($$renderer) {
	if (Field.Label) {
		$$renderer.push('<!--[-->');

		Field.Label($$renderer, {
			for: 'checkbox-demo',
			children: ($$renderer) => {
				if (Field.Field) {
					$$renderer.push('<!--[-->');

					Field.Field($$renderer, {
						orientation: 'horizontal',
						children: ($$renderer) => {
							Checkbox($$renderer, { id: 'checkbox-demo', checked: true });
							$$renderer.push(`<!----> `);

							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									for: 'checkbox-demo',
									class: 'line-clamp-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->I agree to the terms and conditions`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}