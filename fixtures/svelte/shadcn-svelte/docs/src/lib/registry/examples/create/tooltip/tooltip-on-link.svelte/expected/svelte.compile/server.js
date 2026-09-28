import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tooltip_on_link($$renderer) {
	Example($$renderer, {
		title: 'On Link',
		children: ($$renderer) => {
			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({
									href: '/',
									class: 'w-fit text-sm text-primary underline-offset-4 hover:underline',
									...props
								})}>Learn more</a>`);
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
									$$renderer.push(`<p>Click to read the documentation</p>`);
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