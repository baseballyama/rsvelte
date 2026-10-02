import * as $ from 'svelte/internal/server';
import Toggle from '$lib/components/ui/toggle.svelte';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';

export default function Theme_toggle($$renderer) {
	let theme = 'light';

	$$renderer.push(`<div>`);

	Toggle($$renderer, {
		variant: 'outline',
		class: 'group text-muted-foreground data-[state=on]:text-muted-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground size-8 rounded-full border-none shadow-none data-[state=on]:bg-transparent',
		pressed: theme === 'dark',
		onPressedChange: () => theme = theme === 'dark' ? 'light' : 'dark',
		'aria-label': `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
		children: ($$renderer) => {
			MoonIcon($$renderer, {
				size: 16,
				class: 'shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> `);

			SunIcon($$renderer, {
				size: 16,
				class: 'absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}