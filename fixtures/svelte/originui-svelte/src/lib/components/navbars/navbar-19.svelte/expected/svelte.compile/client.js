import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import HistoryIcon from '@lucide/svelte/icons/history';
import MessageSquareText from '@lucide/svelte/icons/message-square-text';
import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2"><!> <h1 class="text-sm font-medium">Basic UI</h1></div> <div class="flex items-center gap-2"><!> <!> <!> <div class="ml-2 flex items-center gap-2"><div class="relative"><!> <span class="border-background absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-emerald-500"><span class="sr-only">Online</span></span></div> <div class="relative"><!> <span class="border-background bg-muted-foreground absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2"><span class="sr-only">Online</span></span></div> <div class="relative"><!> <span class="border-background bg-muted-foreground absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2"><span class="sr-only">Online</span></span></div> <!></div></div></div></header>`);

export default function Navbar_19($$anchor) {
	var header = root_1();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		class: 'size-8',
		variant: 'ghost',
		size: 'icon',
		'aria-label': 'Go back',
		href: '#',
		children: ($$anchor, $$slotProps) => {
			ChevronLeftIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Button(node_1, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'History',
		children: ($$anchor, $$slotProps) => {
			HistoryIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Save',
		children: ($$anchor, $$slotProps) => {
			MessageSquareText($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Add user',
		children: ($$anchor, $$slotProps) => {
			UserRoundPlus($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node_3, 2);
	var div_4 = $.child(div_3);
	var node_4 = $.child(div_4);

	Avatar(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_5 = $.first_child(fragment_4);

			AvatarImage(node_5, { src: './avatar-80-07.jpg', alt: 'Kelly King' });

			var node_6 = $.sibling(node_5, 2);

			AvatarFallback(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('KK');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_7 = $.child(div_5);

	Avatar(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_8 = $.first_child(fragment_5);

			AvatarImage(node_8, { src: './avatar-72-01.jpg', alt: 'Martha Johnson' });

			var node_9 = $.sibling(node_8, 2);

			AvatarFallback(node_9, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('KK');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_10 = $.child(div_6);

	Avatar(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_11 = $.first_child(fragment_6);

			AvatarImage(node_11, { src: './avatar.jpg', alt: 'Linda Green' });

			var node_12 = $.sibling(node_11, 2);

			AvatarFallback(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('KK');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_6);

	var node_13 = $.sibling(div_6, 2);

	Button(node_13, {
		variant: 'secondary',
		class: 'bg-secondary text-muted-foreground ring-background hover:bg-secondary hover:text-foreground flex size-8 items-center justify-center rounded-full text-xs',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('+3');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}