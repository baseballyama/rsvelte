import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_with_button($$renderer) {
	Example($$renderer, {
		title: 'With Button',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full gap-2">`);

			if (Input.Root) {
				$$renderer.push('<!--[-->');
				Input.Root($$renderer, { type: 'search', placeholder: 'Search...', class: 'flex-1' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Button.Root) {
				$$renderer.push('<!--[-->');

				Button.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Search`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}