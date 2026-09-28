import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import HistoryIcon from '@lucide/svelte/icons/history';
import MessageSquareText from '@lucide/svelte/icons/message-square-text';
import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

export default function Navbar_19($$renderer) {
	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2">`);

	Button($$renderer, {
		class: 'size-8',
		variant: 'ghost',
		size: 'icon',
		'aria-label': 'Go back',
		href: '#',
		children: ($$renderer) => {
			ChevronLeftIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h1 class="text-sm font-medium">Basic UI</h1></div> <div class="flex items-center gap-2">`);

	Button($$renderer, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'History',
		children: ($$renderer) => {
			HistoryIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Save',
		children: ($$renderer) => {
			MessageSquareText($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Add user',
		children: ($$renderer) => {
			UserRoundPlus($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="ml-2 flex items-center gap-2"><div class="relative">`);

	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarImage($$renderer, { src: './avatar-80-07.jpg', alt: 'Kelly King' });
			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->KK`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="border-background absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-emerald-500"><span class="sr-only">Online</span></span></div> <div class="relative">`);

	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarImage($$renderer, { src: './avatar-72-01.jpg', alt: 'Martha Johnson' });
			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->KK`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="border-background bg-muted-foreground absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2"><span class="sr-only">Online</span></span></div> <div class="relative">`);

	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarImage($$renderer, { src: './avatar.jpg', alt: 'Linda Green' });
			$$renderer.push(`<!----> `);

			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->KK`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="border-background bg-muted-foreground absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2"><span class="sr-only">Online</span></span></div> `);

	Button($$renderer, {
		variant: 'secondary',
		class: 'bg-secondary text-muted-foreground ring-background hover:bg-secondary hover:text-foreground flex size-8 items-center justify-center rounded-full text-xs',
		size: 'icon',
		children: ($$renderer) => {
			$$renderer.push(`<!---->+3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></header>`);
}