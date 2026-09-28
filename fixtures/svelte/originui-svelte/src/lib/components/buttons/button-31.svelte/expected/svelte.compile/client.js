import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
import FilesIcon from '@lucide/svelte/icons/files';
import FilmIcon from '@lucide/svelte/icons/film';

var root = $.from_html(`<!> Files`, 1);
var root_1 = $.from_html(`<!> Media`, 1);
var root_2 = $.from_html(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse"><!> <!> <!></div>`);

export default function Button_31($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Button(node, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			FilesIcon(node_1, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			FilmIcon(node_3, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Menu',
		children: ($$anchor, $$slotProps) => {
			EllipsisIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}