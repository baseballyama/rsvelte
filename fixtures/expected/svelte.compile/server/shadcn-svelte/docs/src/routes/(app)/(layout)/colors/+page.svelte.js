import * as $ from 'svelte/internal/server';
import ColorPalette from "$lib/components/color-palette.svelte";
import { getColors } from "$lib/colors.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colors = getColors();
		const clipboard = new UseClipboard({ delay: 0, reset: false });

		$$renderer.push(`<div class="grid gap-8 lg:gap-16 xl:gap-20"><!--[-->`);

		const each_array = $.ensure_array_like(colors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let colorPalette = each_array[$$index];

			ColorPalette($$renderer, { colorPalette, clipboard });
		}

		$$renderer.push(`<!--]--></div>`);
	});
}