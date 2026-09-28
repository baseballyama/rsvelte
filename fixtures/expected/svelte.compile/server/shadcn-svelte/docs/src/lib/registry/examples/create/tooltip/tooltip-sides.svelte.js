import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tooltip_sides($$renderer) {
	Example($$renderer, {
		title: 'Sides',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(["top", "right", "bottom", "left"]);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let side = each_array[$$index];

				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'w-fit capitalize' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(side)}`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');
									Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									side,
									children: ($$renderer) => {
										$$renderer.push(`<p>Add to library</p>`);
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