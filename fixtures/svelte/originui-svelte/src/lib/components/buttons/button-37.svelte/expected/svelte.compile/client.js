import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import GitForkIcon from '@lucide/svelte/icons/git-fork';

var root = $.from_html(`<!> Fork <span class="border-primary-foreground/30 text-primary-foreground/60 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">18</span>`, 1);
var root_1 = $.from_html(`<div class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse"><!> <!></div>`);

export default function Button_37($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			GitForkIcon(node_1, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Options',
		children: ($$anchor, $$slotProps) => {
			ChevronDownIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}