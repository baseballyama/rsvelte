import * as $ from 'svelte/internal/server';
import BookmarkIcon from "@lucide/svelte/icons/bookmark";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_demo($$renderer) {
	Toggle($$renderer, {
		'aria-label': 'Toggle bookmark',
		size: 'sm',
		variant: 'outline',
		class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500',
		children: ($$renderer) => {
			BookmarkIcon($$renderer, {});
			$$renderer.push(`<!----> Bookmark`);
		},
		$$slots: { default: true }
	});
}