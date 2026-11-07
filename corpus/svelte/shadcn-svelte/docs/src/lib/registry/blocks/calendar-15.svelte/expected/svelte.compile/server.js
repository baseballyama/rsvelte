import * as $ from 'svelte/internal/server';
import Construction from "@lucide/svelte/icons/construction";

export default function Calendar_15($$renderer) {
	$$renderer.push(`<div class="flex h-full flex-col items-center justify-center gap-4">`);
	Construction($$renderer, { class: 'size-10' });
	$$renderer.push(`<!----> <span>This block is under construction. Check back soon!</span></div>`);
}