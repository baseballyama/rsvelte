import * as $ from 'svelte/internal/server';
import Minus from "@lucide/svelte/icons/minus";
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_orientation_demo($$renderer) {
	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			orientation: 'vertical',
			'aria-label': 'Media controls',
			class: 'h-fit',
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					children: ($$renderer) => {
						Plus($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					children: ($$renderer) => {
						Minus($$renderer, {});
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