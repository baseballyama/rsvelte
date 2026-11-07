import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tooltip_long_content($$renderer) {
	Example($$renderer, {
		title: 'Long Content',
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
											$$renderer.push(`<!---->Show Tooltip`);
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
									$$renderer.push(`<!---->To learn more about how this works, check out the docs. If you have any questions, please
			reach out to us.`);
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