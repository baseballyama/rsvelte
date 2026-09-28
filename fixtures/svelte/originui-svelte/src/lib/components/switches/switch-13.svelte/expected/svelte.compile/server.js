import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import IconMoon from '@lucide/svelte/icons/moon';
import IconSun from '@lucide/svelte/icons/sun';

export default function Switch_13($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div><div class="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">`);

	Switch($$renderer, {
		id: uid,
		checked: true,
		class: 'peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full'
	});

	$$renderer.push(`<!----> <span class="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full">`);
	IconMoon($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></span> <span class="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">`);
	IconSun($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></span></div> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Labeled switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}