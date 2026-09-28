import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import ListFilterIcon from '@lucide/svelte/icons/list-filter';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Filters($$renderer) {
	const id = $.props_id($$renderer);

	$$renderer.push(`<div class="flex flex-col gap-4">`);

	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline', size: 'sm', class: 'text-sm' },
						props,
						{
							children: ($$renderer) => {
								ListFilterIcon($$renderer, {
									size: 16,
									class: 'text-muted-foreground/80 -ms-1',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Filters`);
							},
							$$slots: { default: true }
						}
					]));
				}

				PopoverTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			PopoverContent($$renderer, {
				class: 'w-36 p-3',
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-3"><div class="text-xs font-medium">Filters</div> <form><div class="space-y-3"><div class="flex items-center gap-2">`);
					Checkbox($$renderer, { id: `${id}-1` });
					$$renderer.push(`<!----> `);

					Label($$renderer, {
						for: `${id}-1`,
						class: 'font-normal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Real Time`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
					Checkbox($$renderer, { id: `${id}-2` });
					$$renderer.push(`<!----> `);

					Label($$renderer, {
						for: `${id}-2`,
						class: 'font-normal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Top Channels`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
					Checkbox($$renderer, { id: `${id}-3` });
					$$renderer.push(`<!----> `);

					Label($$renderer, {
						for: `${id}-3`,
						class: 'font-normal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Last Orders`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
					Checkbox($$renderer, { id: `${id}-4` });
					$$renderer.push(`<!----> `);

					Label($$renderer, {
						for: `${id}-4`,
						class: 'font-normal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Total Spent`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div> <div role="separator" aria-orientation="horizontal" class="bg-border -mx-3 my-3 h-px"></div> <div class="flex justify-between gap-2">`);

					Button($$renderer, {
						size: 'sm',
						variant: 'outline',
						class: 'h-7 px-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Clear`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						size: 'sm',
						class: 'h-7 px-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Apply`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></form></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}