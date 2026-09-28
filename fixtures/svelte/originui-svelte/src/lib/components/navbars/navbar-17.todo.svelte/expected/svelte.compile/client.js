import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import BookmarkIcon from '@lucide/svelte/icons/bookmark';
import HomeIcon from '@lucide/svelte/icons/home';
import { Filters } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

var root = $.from_html(`<!> <span class="sr-only">Home</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="max-sm:sr-only">Saved</span>`, 1);
var root_3 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><!> <div class="flex items-center gap-2"><!> <!></div></div></header>`);

export default function Navbar_17_todo($$anchor) {
	var // import { DatePicker, Filters } from '$lib/components/_extras/navbars';
	header = root_3();

	var div = $.child(header);
	var node = $.child(div);

	Breadcrumb(node, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					BreadcrumbItem(node_1, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									HomeIcon(node_2, { size: 16, 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					BreadcrumbSeparator(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					BreadcrumbItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbPage($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Reports');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_5 = $.child(div_1);

	Filters(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		size: 'sm',
		variant: 'outline',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_7 = $.first_child(fragment_5);

			BookmarkIcon(node_7, {
				class: 'text-muted-foreground/80 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next(2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}