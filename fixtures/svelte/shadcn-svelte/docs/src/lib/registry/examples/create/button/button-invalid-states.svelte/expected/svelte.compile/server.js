import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_invalid_states($$renderer) {
	Example($$renderer, {
		title: 'Invalid States',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'xs',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'sm',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'lg',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'link',
				'aria-invalid': 'true',
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