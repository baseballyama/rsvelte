import * as $ from 'svelte/internal/server';
import Search from "@lucide/svelte/icons/search";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Button_group_input_demo($$renderer) {
	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { placeholder: 'Search...' });
				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					'aria-label': 'Search',
					children: ($$renderer) => {
						Search($$renderer, {});
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