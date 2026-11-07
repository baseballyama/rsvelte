import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Bolt from '@lucide/svelte/icons/bolt';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import CopyPlus from '@lucide/svelte/icons/copy-plus';
import Files from '@lucide/svelte/icons/files';
import Layers2 from '@lucide/svelte/icons/layers-2';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_03($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Menu with icons `);
								ChevronDown($$renderer, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
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
				children: ($$renderer) => {
					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							CopyPlus($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Copy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							Bolt($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Edit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							Layers2($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Group`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							Files($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Clone`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}