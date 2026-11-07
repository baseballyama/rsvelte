import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";
import Code from "$lib/components/markdown/code.svelte";

export default function Prop_copy($$renderer, $$props) {
	let { name } = $$props;

	$$renderer.push(`<div class="flex items-center gap-1.5">`);

	if (Popover.Root) {
		$$renderer.push('<!--[-->');

		Popover.Root($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						class: 'rounded-button text-foreground-alt hover:text-foreground-alt/80 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
						children: ($$renderer) => {
							Code($$renderer, {
								class: 'bg-transparent px-0',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(name)}`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Content) {
					$$renderer.push('<!--[-->');

					Popover.Content($$renderer, {
						side: 'top',
						sideOffset: 10,
						class: 'rounded-input border-border bg-background shadow-popover z-50 max-h-[400px] overflow-auto border p-4',
						children: ($$renderer) => {
							$$renderer.push(`<button class="bg-transparent">Copy to clipboard</button>`);
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

	$$renderer.push(`</div>`);
}