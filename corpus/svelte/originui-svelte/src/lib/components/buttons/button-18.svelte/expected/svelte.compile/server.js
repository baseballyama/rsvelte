import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

export default function Button_18($$renderer) {
	Button($$renderer, {
		variant: 'ghost',
		class: 'h-auto p-0 hover:bg-transparent',
		children: ($$renderer) => {
			$$renderer.push(`<enhanced:img class="size-[40px] rounded-full" src="/static/avatar.jpg" alt="Profile image" loading="lazy" aria-hidden="true"></enhanced:img> `);
			ChevronDown($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}