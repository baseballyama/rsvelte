import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Popover_08($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-4">`);

	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Feedback`);
							},
							$$slots: { default: true }
						}
					]));
				}

				PopoverTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			PopoverContent($$renderer, {
				class: 'w-72',
				children: ($$renderer) => {
					$$renderer.push(`<h2 class="mb-2 text-sm font-semibold">Send us feedback</h2> <form class="space-y-3">`);

					Textarea($$renderer, {
						id: 'feedback',
						placeholder: 'How can we improve Origin UI?',
						'aria-label': 'Send feedback'
					});

					$$renderer.push(`<!----> <div class="flex flex-col sm:flex-row sm:justify-end">`);

					Button($$renderer, {
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Send feedback`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></form>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}