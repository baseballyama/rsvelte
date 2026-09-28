import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import PlusIcon from '@lucide/svelte/icons/plus';
import SearchIcon from '@lucide/svelte/icons/search';
import { InfoMenu, NotificationMenu, SettingsMenu } from '$lib/components/_extras/navbars';

export default function Navbar_16($$renderer) {
	const id = $.props_id($$renderer);
	let checked = false;

	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="relative flex-1">`);

	Input($$renderer, {
		id: `input-${id}`,
		class: 'peer h-8 w-full max-w-xs ps-8 pe-2',
		placeholder: 'Search...',
		type: 'search'
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">`);
	SearchIcon($$renderer, { size: 16 });
	$$renderer.push(`<!----></div></div> <div class="flex items-center gap-4"><div class="inline-flex items-center gap-2 max-md:hidden">`);

	Label($$renderer, {
		for: `switch-${id}`,
		class: 'text-sm font-medium',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test mode`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Switch($$renderer, {
		id: `switch-${id}`,
		checked,
		onCheckedChange: (value) => checked = value,
		class: 'h-5 w-8 [&_span]:size-4 [&_span]:data-[state=checked]:translate-x-3 rtl:[&_span]:data-[state=checked]:-translate-x-3',
		'aria-label': 'Toggle switch'
	});

	$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

	Button($$renderer, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Open layout menu',
		children: ($$renderer) => {
			LayoutGridIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	InfoMenu($$renderer, {});
	$$renderer.push(`<!----> `);
	NotificationMenu($$renderer, {});
	$$renderer.push(`<!----> `);
	SettingsMenu($$renderer, {});
	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		class: 'size-8 rounded-full',
		size: 'icon',
		'aria-label': 'Add new item',
		children: ($$renderer) => {
			PlusIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}