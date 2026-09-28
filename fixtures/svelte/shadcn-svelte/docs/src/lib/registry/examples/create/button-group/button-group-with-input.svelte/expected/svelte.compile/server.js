import * as $ from 'svelte/internal/server';
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_input($$renderer) {
	Example($$renderer, {
		title: 'With Input',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Button`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { placeholder: 'Type something here...' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Input($$renderer, { placeholder: 'Type something here...' });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Button`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}