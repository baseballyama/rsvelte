import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

var root = $.from_html(`<div class="inline-flex -space-x-px rounded-full shadow-2xs rtl:space-x-reverse"><!> <span class="bg-primary text-primary-foreground flex items-center px-1 text-sm font-medium">235</span> <!></div>`);

export default function Button_26($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		class: 'rounded-none shadow-none first:rounded-s-full last:rounded-e-full focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Upvote',
		children: ($$anchor, $$slotProps) => {
			ChevronUpIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		class: 'rounded-none shadow-none first:rounded-s-full last:rounded-e-full focus-visible:z-10',
		size: 'icon',
		'aria-label': 'Downvote',
		children: ($$anchor, $$slotProps) => {
			ChevronDownIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}