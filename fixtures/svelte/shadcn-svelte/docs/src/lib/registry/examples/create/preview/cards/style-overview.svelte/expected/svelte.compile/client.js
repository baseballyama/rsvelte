import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { getFont, getStyle } from "$lib/registry/config.js";

var root = $.from_html(`<div class="flex flex-col flex-wrap items-center gap-2"><div class="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"></div> <div class="hidden max-w-14 truncate font-mono text-[0.60rem] md:block"> </div></div>`);

var root_1 = $.from_html(
	`<div class="flex flex-col gap-1"><div class="text-2xl font-medium"> </div> <div class="line-clamp-2 text-base text-muted-foreground">Designers love packing quirky glyphs into test phrases. This is a preview of the typography
				styles.</div></div> <div class="grid grid-cols-6 gap-3"></div>`,
	1
);

export default function Style_overview($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	const currentFont = $.derived(() => getFont(designSystem.font));
	const currentStyle = $.derived(() => getStyle(designSystem.style));

	const colorVariants = [
		"--background",
		"--foreground",
		"--primary",
		"--secondary",
		"--muted",
		"--accent",
		"--destructive",
		"--chart-1",
		"--chart-2",
		"--chart-3",
		"--chart-4",
		"--chart-5"
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.first_child(fragment_2);
							var div_1 = $.child(div);
							var text = $.only_child(div_1);

							$.next(2);
							$.reset(div);

							var div_2 = $.sibling(div, 2);

							$.each(div_2, 20, () => colorVariants, (variant) => variant, ($$anchor, variant) => {
								var div_3 = root();
								var div_4 = $.sibling($.child(div_3), 2);
								var text_1 = $.only_child(div_4, true);

								$.reset(div_3);

								$.template_effect(() => {
									$.set_style(div_3, `--color: var(${variant ?? ''})`);
									$.set_text(text_1, variant);
								});

								$.append($$anchor, div_3);
							});

							$.reset(div_2);
							$.template_effect(() => $.set_text(text, `${$.get(currentStyle)?.title ?? "Vega" ?? ''} - ${$.get(currentFont)?.title ?? "Inter" ?? ''}`));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}