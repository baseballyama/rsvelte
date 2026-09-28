import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import ColorFormatSelector from "./color-format-selector.svelte";
import Color from "./color.svelte";

var root = $.from_html(`<div class="scroll-mt-20 rounded-lg"><div class="flex items-center px-4"><div class="flex-1 ps-1 text-sm font-medium"><h2 class="capitalize"> </h2></div> <!></div> <div class="flex flex-col gap-4 py-4 sm:flex-row sm:gap-2"></div></div>`);

export default function Color_palette($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);

	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	ColorFormatSelector(node, {
		get color() {
			return $$props.colorPalette.colors[0];
		},
		class: 'ms-auto'
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);

	$.each(div_3, 21, () => $$props.colorPalette.colors, (color) => color.hex, ($$anchor, color) => {
		Color($$anchor, {
			get color() {
				return $.get(color);
			},

			get clipboard() {
				return $$props.clipboard;
			}
		});
	});

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'id', $$props.colorPalette.name);
		$.set_text(text, $$props.colorPalette.name);
	});

	$.append($$anchor, div);
	$.pop();
}