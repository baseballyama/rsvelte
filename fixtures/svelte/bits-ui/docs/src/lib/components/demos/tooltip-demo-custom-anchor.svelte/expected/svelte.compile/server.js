import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";
import MagicWand from "phosphor-svelte/lib/MagicWand";

export default function Tooltip_demo_custom_anchor($$renderer) {
	let customAnchor = null;

	$$renderer.push(`<div class="flex items-center gap-6"><div class="rounded-md border p-3">Custom Anchor</div> `);

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						delayDuration: 200,
						children: ($$renderer) => {
							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');

								Tooltip.Trigger($$renderer, {
									class: 'border-border-input bg-background-alt shadow-btn ring-dark ring-offset-background\n			hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex size-10 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-offset-2',
									children: ($$renderer) => {
										MagicWand($$renderer, { class: 'size-5' });
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
									sideOffset: 8,
									customAnchor,
									class: 'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
									children: ($$renderer) => {
										$$renderer.push(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex items-center justify-center border p-3 text-sm font-medium">Make some magic!</div>`);
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
}