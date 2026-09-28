import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import MicIcon from '@lucide/svelte/icons/mic';
import SearchIcon from '@lucide/svelte/icons/search';
import { Logo, ThemeToggle } from '$lib/components/_extras/navbars';

var root = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex-1"><a href="#" class="text-primary hover:text-primary/90"><!></a></div> <div class="grow max-sm:hidden"><div class="relative mx-auto w-full max-w-xs"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"><!></div> <button class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-hidden transition-[color,box-shadow] focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Press to speak" type="submit"><!></button></div></div> <div class="flex flex-1 items-center justify-end gap-2"><!> <!> <!></div></div></header>`);

export default function Navbar_10($$anchor) {
	const id = $.props_id();
	var header = root();
	var div = $.child(header);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.child(a);

	Logo(node, {});
	$.reset(a);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	Input(node_1, {
		get id() {
			return id;
		},
		class: 'peer h-8 px-8',
		placeholder: 'Search...',
		type: 'search'
	});

	var div_4 = $.sibling(node_1, 2);
	var node_2 = $.child(div_4);

	SearchIcon(node_2, { size: 16 });
	$.reset(div_4);

	var button = $.sibling(div_4, 2);
	var node_3 = $.child(button);

	MicIcon(node_3, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var node_4 = $.child(div_5);

	Button(node_4, {
		variant: 'ghost',
		href: '#',
		size: 'sm',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Community');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		size: 'sm',
		href: '#',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get Started');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	ThemeToggle(node_6, {});
	$.reset(div_5);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}