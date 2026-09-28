import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import PlusIcon from '@lucide/svelte/icons/plus';
import SearchIcon from '@lucide/svelte/icons/search';
import { InfoMenu, NotificationMenu, SettingsMenu } from '$lib/components/_extras/navbars';

var root = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="relative flex-1"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"><!></div></div> <div class="flex items-center gap-4"><div class="inline-flex items-center gap-2 max-md:hidden"><!> <!></div> <div class="flex items-center gap-2"><!> <!> <!> <!></div> <!></div></div></header>`);

export default function Navbar_16($$anchor) {
	const id = $.props_id();
	let checked = $.state(false);
	var header = root();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => `input-${id}`);

		Input(node, {
			get id() {
				return $.get($0);
			},
			class: 'peer h-8 w-full max-w-xs ps-8 pe-2',
			placeholder: 'Search...',
			type: 'search'
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	SearchIcon(node_1, { size: 16 });
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_2 = $.child(div_4);

	Label(node_2, {
		get for() {
			return `switch-${id}`;
		},
		class: 'text-sm font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test mode');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Switch(node_3, {
		get id() {
			return `switch-${id}`;
		},

		get checked() {
			return $.get(checked);
		},
		onCheckedChange: (value) => $.set(checked, value, true),
		class: 'h-5 w-8 [&_span]:size-4 [&_span]:data-[state=checked]:translate-x-3 rtl:[&_span]:data-[state=checked]:-translate-x-3',
		'aria-label': 'Toggle switch'
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_4 = $.child(div_5);

	Button(node_4, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Open layout menu',
		children: ($$anchor, $$slotProps) => {
			LayoutGridIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	InfoMenu(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	NotificationMenu(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	SettingsMenu(node_7, {});
	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	Button(node_8, {
		class: 'size-8 rounded-full',
		size: 'icon',
		'aria-label': 'Add new item',
		children: ($$anchor, $$slotProps) => {
			PlusIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}