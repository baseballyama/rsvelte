import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_21($$renderer) {
	let open = false;

	function toggleOpen() {
		open = !open;
	}

	Button($$renderer, {
		class: 'group rounded-full',
		variant: 'outline',
		size: 'icon',
		onclick: toggleOpen,
		'aria-expanded': open,
		'aria-label': open ? 'Close menu' : 'Open menu',
		children: ($$renderer) => {
			Plus($$renderer, {
				class: 'transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-aria-expanded:rotate-135',
				size: 16,
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});
}