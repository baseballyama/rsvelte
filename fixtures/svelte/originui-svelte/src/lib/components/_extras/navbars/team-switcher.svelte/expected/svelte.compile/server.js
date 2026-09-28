import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpIcon from '@lucide/svelte/icons/chevrons-up';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Team_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { defaultTeam, teams } = $$props;
		let selectedTeam = defaultTeam;

		DropdownMenu($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{ variant: 'ghost', class: 'p-0 hover:bg-transparent' },
							props,
							{
								children: ($$renderer) => {
									$$renderer.push(`<span class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">${$.escape(selectedTeam.charAt(0).toUpperCase())}</span> <div class="flex flex-col gap-0.5 leading-none"><span>${$.escape(selectedTeam)}</span></div> `);
									ChevronUpIcon($$renderer, { size: 14, class: 'text-muted-foreground/80' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							}
						]));
					}

					DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
				}

				$$renderer.push(`<!----> `);

				DropdownMenuContent($$renderer, {
					align: 'start',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(teams);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let team = each_array[i];

							DropdownMenuItem($$renderer, {
								onSelect: () => {
									selectedTeam = team;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(team)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}