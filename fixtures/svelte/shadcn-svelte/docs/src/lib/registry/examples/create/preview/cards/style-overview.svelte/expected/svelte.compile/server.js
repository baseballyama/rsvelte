import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { getFont, getStyle } from "$lib/registry/config.js";

export default function Style_overview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-6',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-1"><div class="text-2xl font-medium">${$.escape(currentStyle()?.title ?? "Vega")} - ${$.escape(currentFont()?.title ?? "Inter")}</div> <div class="line-clamp-2 text-base text-muted-foreground">Designers love packing quirky glyphs into test phrases. This is a preview of the typography
				styles.</div></div> <div class="grid grid-cols-6 gap-3"><!--[-->`);

								const each_array = $.ensure_array_like(colorVariants);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let variant = each_array[$$index];

									$$renderer.push(`<div class="flex flex-col flex-wrap items-center gap-2"${$.attr_style(`--color: var(${$.stringify(variant)})`)}><div class="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"></div> <div class="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">${$.escape(variant)}</div></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}