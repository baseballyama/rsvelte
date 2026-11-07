import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_with_icon($$renderer) {
	Example($$renderer, {
		title: 'With Icon',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Toggle($$renderer, {
				'aria-label': 'Toggle bookmark',
				pressed: true,
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
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

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				variant: 'outline',
				'aria-label': 'Toggle bookmark outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BookmarkIcon',
						tabler: 'IconBookmark',
						hugeicons: 'BookmarkIcon',
						phosphor: 'BookmarkIcon',
						remixicon: 'RiBookmarkLine',
						class: 'group-data-[state=on]/toggle:fill-accent-foreground'
					});

					$$renderer.push(`<!----> Bookmark`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}