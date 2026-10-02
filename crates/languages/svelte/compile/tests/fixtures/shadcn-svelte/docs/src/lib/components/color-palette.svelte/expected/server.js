import * as $ from 'svelte/internal/server';
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import ColorFormatSelector from "./color-format-selector.svelte";
import Color from "./color.svelte";

export default function Color_palette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { colorPalette, clipboard } = $$props;

		$$renderer.push(`<div${$.attr('id', colorPalette.name)} class="scroll-mt-20 rounded-lg"><div class="flex items-center px-4"><div class="flex-1 ps-1 text-sm font-medium"><h2 class="capitalize">${$.escape(colorPalette.name)}</h2></div> `);
		ColorFormatSelector($$renderer, { color: colorPalette.colors[0], class: 'ms-auto' });
		$$renderer.push(`<!----></div> <div class="flex flex-col gap-4 py-4 sm:flex-row sm:gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(colorPalette.colors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let color = each_array[$$index];

			Color($$renderer, { color, clipboard });
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}