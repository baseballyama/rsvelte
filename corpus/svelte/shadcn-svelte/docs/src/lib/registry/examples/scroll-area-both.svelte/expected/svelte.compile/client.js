import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

var root = $.from_html(`<div class="w-[400px]">Jokester began sneaking into the castle in the middle of the night and leaving jokes all over
		the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious,
		but he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered
		that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they
		started laughing, they couldn't stop.</div>`);

export default function Scroll_area_both($$anchor) {
	ScrollArea($$anchor, {
		class: 'h-[200px] w-[350px] rounded-md border p-4',
		orientation: 'both',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}