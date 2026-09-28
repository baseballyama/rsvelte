import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tooltip_formatted($$renderer) {
	Example($$renderer, {
		title: 'Formatted Content',
		children: ($$renderer) => {
			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline', class: 'w-fit' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Status`);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col gap-1"><p class="font-semibold">Active</p> <p class="text-xs opacity-80">Last updated 2 hours ago</p></div>`);
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
		},
		$$slots: { default: true }
	});
}