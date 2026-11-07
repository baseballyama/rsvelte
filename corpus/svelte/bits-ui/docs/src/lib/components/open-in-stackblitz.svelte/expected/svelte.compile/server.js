import * as $ from 'svelte/internal/server';
import { openInStackBlitz } from "$lib/utils/open-in-stackblitz.js";
import Stackblitz from "$icons/stackblitz.svelte";
import { Tooltip } from "bits-ui";

export default function Open_in_stackblitz($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { demoName, componentName = demoName } = $$props;

		$$renderer.push(`<div class="absolute bottom-2 right-2">`);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							delayDuration: 0,
							children: ($$renderer) => {
								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										onclick: () => openInStackBlitz(demoName, componentName),
										class: 'ring-dark ring-offset-background hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex size-9 cursor-pointer items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2',
										children: ($$renderer) => {
											Stackblitz($$renderer, {
												class: 'text-foreground/30 group-hover:text-foreground size-[18px]'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										sideOffset: 4,
										children: ($$renderer) => {
											$$renderer.push(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex select-none items-center justify-center border p-3 text-xs">Open in StackBlitz</div>`);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}