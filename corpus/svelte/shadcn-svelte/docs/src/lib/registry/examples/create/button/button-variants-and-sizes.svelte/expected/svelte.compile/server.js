import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_variants_and_sizes($$renderer) {
	Example($$renderer, {
		title: 'Variants & Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'xs',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'ghost',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'ghost',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'lg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'ghost',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}