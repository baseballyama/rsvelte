import * as $ from 'svelte/internal/server';
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

export default function Scroll_area_both($$renderer) {
	ScrollArea($$renderer, {
		class: 'h-[200px] w-[350px] rounded-md border p-4',
		orientation: 'both',
		children: ($$renderer) => {
			$$renderer.push(`<div class="w-[400px]">Jokester began sneaking into the castle in the middle of the night and leaving jokes all over
		the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious,
		but he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered
		that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they
		started laughing, they couldn't stop.</div>`);
		},
		$$slots: { default: true }
	});
}