import * as $ from 'svelte/internal/server';
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_size_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-start gap-8">`);

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Small`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Group`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon-sm',
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

	$$renderer.push(` `);

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Group`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
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

	$$renderer.push(` `);

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Large`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Group`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon-lg',
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

	$$renderer.push(`</div>`);
}