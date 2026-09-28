import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { getColors } from "$lib/colors.js";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div class="flex items-center"></div>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Colors_nav($$anchor, $$props) {
	$.push($$props, true);

	const colors = getColors();
	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_2();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex items-center", $$props.class)]);

	var node = $.child(div);

	ScrollArea(node, {
		class: 'max-w-full',
		orientation: 'both',
		scrollbarXClasses: 'invisible',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.each(div_1, 23, () => colors, (colorPalette) => colorPalette.name, ($$anchor, colorPalette, index) => {
				var a = root();
				var text = $.only_child(a, true);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a, 'href', `/colors#${$.get(colorPalette).name ?? ''}`);
						$.set_attribute(a, 'data-active', $0);
						$.set_class(a, 1, $1);
						$.set_text(text, $.get(colorPalette).name);
					},
					[
						() => page.url.pathname?.startsWith($.get(colorPalette).name) || $.get(index) === 0 && page.url.pathname === "/colors",
						() => $.clsx(cn("flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground capitalize transition-colors hover:text-primary data-[active=true]:text-primary"))
					]
				);

				$.append($$anchor, a);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}