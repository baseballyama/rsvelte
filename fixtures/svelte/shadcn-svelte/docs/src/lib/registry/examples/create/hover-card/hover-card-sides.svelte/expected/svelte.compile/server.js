import * as $ from 'svelte/internal/server';
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Hover_card_sides($$renderer) {
	const HOVER_CARD_SIDES = ["top", "right", "bottom", "left"];

	Example($$renderer, {
		title: 'Sides',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center justify-center gap-4"><!--[-->`);

			const each_array = $.ensure_array_like(HOVER_CARD_SIDES);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let side = each_array[$$index];

				if (HoverCard.Root) {
					$$renderer.push('<!--[-->');

					HoverCard.Root($$renderer, {
						openDelay: 100,
						closeDelay: 100,
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'capitalize' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(side)}`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (HoverCard.Trigger) {
									$$renderer.push('<!--[-->');
									HoverCard.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (HoverCard.Content) {
								$$renderer.push('<!--[-->');

								HoverCard.Content($$renderer, {
									side,
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex flex-col style-vega:gap-2 style-nova:gap-1.5 style-lyra:gap-1 style-maia:gap-2 style-mira:gap-1"><h4 class="font-medium">Hover Card</h4> <p>This hover card appears on the ${$.escape(side)} side of the trigger.</p></div>`);
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
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});
}