import * as $ from 'svelte/internal/server';
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_split_demo($$renderer) {
	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (ButtonGroup.Separator) {
					$$renderer.push('<!--[-->');
					ButtonGroup.Separator($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Button($$renderer, {
					variant: 'secondary',
					size: 'icon',
					children: ($$renderer) => {
						Plus($$renderer, {});
					},
					$$slots: { default: true }
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