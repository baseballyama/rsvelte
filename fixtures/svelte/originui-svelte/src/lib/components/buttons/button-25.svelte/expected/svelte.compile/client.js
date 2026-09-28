import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';

var root = $.from_html(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse"><!> <span class="border-input flex items-center border px-3 text-sm font-medium">235</span> <!></div>`);

export default function Button_25($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		class: 'rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Upvote',
		children: ($$anchor, $$slotProps) => {
			ChevronUp($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		class: 'rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Downvote',
		children: ($$anchor, $$slotProps) => {
			ChevronDown($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}