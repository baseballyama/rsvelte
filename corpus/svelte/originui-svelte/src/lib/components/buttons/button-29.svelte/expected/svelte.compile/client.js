import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import FlipHorizontalIcon from '@lucide/svelte/icons/flip-horizontal';
import FlipVerticalIcon from '@lucide/svelte/icons/flip-vertical';

var root = $.from_html(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse"><!> <!></div>`);

export default function Button_29($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Flip Horizontal',
		children: ($$anchor, $$slotProps) => {
			FlipHorizontalIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Flip Vertical',
		children: ($$anchor, $$slotProps) => {
			FlipVerticalIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}