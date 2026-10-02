import * as $ from 'svelte/internal/server';
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Radio_group_demo($$renderer) {
	if (RadioGroup.Root) {
		$$renderer.push('<!--[-->');

		RadioGroup.Root($$renderer, {
			value: 'comfortable',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center space-x-2">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');
					RadioGroup.Item($$renderer, { value: 'default', id: 'r1' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Label($$renderer, {
					for: 'r1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');
					RadioGroup.Item($$renderer, { value: 'comfortable', id: 'r2' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Label($$renderer, {
					for: 'r2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Comfortable`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');
					RadioGroup.Item($$renderer, { value: 'compact', id: 'r3' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Label($$renderer, {
					for: 'r3',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Compact`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}