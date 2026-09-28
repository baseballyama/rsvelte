import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="flex rounded-lg shadow-xs shadow-black/[.04]"><div class="relative"><select class="peer border-input bg-background text-muted-foreground ring-offset-background hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 inline-flex h-full appearance-none items-center rounded-s-lg border ps-3 pe-8 text-sm transition-shadow focus:z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Protocol"><option>https://</option><option>http://</option><option>ftp://</option><option>sftp://</option><option>ws://</option><option>wss://</option></select> <span class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-px flex h-full w-9 items-center justify-center peer-disabled:opacity-50"><!></span></div> <!></div></div>`);

export default function Input_17($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with start select');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var select = $.child(div_2);
	var option = $.child(select);

	option.value = option.__value = 'https://';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'http://';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'ftp://';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'sftp://';

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 'ws://';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'wss://';
	$.reset(select);

	var span = $.sibling(select, 2);
	var node_1 = $.child(span);

	ChevronDown(node_1, { size: 16, 'aria-hidden': 'true' });
	$.reset(span);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Input(node_2, {
		get id() {
			return uid;
		},
		class: '-ms-px rounded-s-none shadow-none focus-visible:z-10',
		placeholder: '192.168.1.1',
		type: 'text'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}