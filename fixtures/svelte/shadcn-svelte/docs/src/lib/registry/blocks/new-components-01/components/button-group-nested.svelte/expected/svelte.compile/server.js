import * as $ from 'svelte/internal/server';
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_nested($$renderer) {
	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->4`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->5`);
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

				$$renderer.push(` `);

				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon-sm',
								'aria-label': 'Previous',
								children: ($$renderer) => {
									ArrowLeft($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon-sm',
								'aria-label': 'Next',
								children: ($$renderer) => {
									ArrowRight($$renderer, {});
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}