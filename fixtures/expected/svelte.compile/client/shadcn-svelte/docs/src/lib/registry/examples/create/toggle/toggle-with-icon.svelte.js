import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Bookmark`, 1);
var root_1 = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!></div>`);

export default function Toggle_with_icon($$anchor) {
	Example($$anchor, {
		title: 'With Icon',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			Toggle(node, {
				'aria-label': 'Toggle bookmark',
				pressed: true,
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'BookmarkIcon',
						tabler: 'IconBookmark',
						hugeicons: 'BookmarkIcon',
						phosphor: 'BookmarkIcon',
						remixicon: 'RiBookmarkLine',
						class: 'group-data-[state=on]/toggle:fill-accent-foreground'
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Toggle(node_1, {
				variant: 'outline',
				'aria-label': 'Toggle bookmark outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					IconPlaceholder(node_2, {
						lucide: 'BookmarkIcon',
						tabler: 'IconBookmark',
						hugeicons: 'BookmarkIcon',
						phosphor: 'BookmarkIcon',
						remixicon: 'RiBookmarkLine',
						class: 'group-data-[state=on]/toggle:fill-accent-foreground'
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}