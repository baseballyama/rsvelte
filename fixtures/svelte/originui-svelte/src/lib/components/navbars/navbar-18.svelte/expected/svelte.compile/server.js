import * as $ from 'svelte/internal/server';
import Button from '../ui/button.svelte';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import UploadIcon from '@lucide/svelte/icons/upload';
import { AppToggle, TeamSwitcher } from '$lib/components/_extras/navbars';

export default function Navbar_18($$renderer) {
	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];

	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2">`);
	TeamSwitcher($$renderer, { teams, defaultTeam: teams[0] });
	$$renderer.push(`<!----></div> `);
	AppToggle($$renderer, {});
	$$renderer.push(`<!----> <div class="flex flex-1 items-center justify-end gap-2">`);

	Button($$renderer, {
		size: 'sm',
		variant: 'ghost',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$renderer) => {
			UploadIcon($$renderer, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> <span class="max-sm:sr-only">Export</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'sm',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$renderer) => {
			SparklesIcon($$renderer, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> <span class="max-sm:sr-only">Upgrade</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}