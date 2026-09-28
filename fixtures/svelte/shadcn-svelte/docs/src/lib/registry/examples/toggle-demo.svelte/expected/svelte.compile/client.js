import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BookmarkIcon from "@lucide/svelte/icons/bookmark";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

var root = $.from_html(`<!> Bookmark`, 1);

export default function Toggle_demo($$anchor) {
	Toggle($$anchor, {
		'aria-label': 'Toggle bookmark',
		size: 'sm',
		variant: 'outline',
		class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BookmarkIcon(node, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}