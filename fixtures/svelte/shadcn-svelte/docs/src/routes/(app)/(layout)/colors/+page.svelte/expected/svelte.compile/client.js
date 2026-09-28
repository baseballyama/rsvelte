import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ColorPalette from "$lib/components/color-palette.svelte";
import { getColors } from "$lib/colors.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";

var root = $.from_html(`<div class="grid gap-8 lg:gap-16 xl:gap-20"></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const colors = getColors();
	const clipboard = new UseClipboard({ delay: 0, reset: false });
	var div = root();

	$.each(div, 21, () => colors, (colorPalette) => colorPalette.name, ($$anchor, colorPalette) => {
		ColorPalette($$anchor, {
			get colorPalette() {
				return $.get(colorPalette);
			},

			get clipboard() {
				return clipboard;
			}
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}