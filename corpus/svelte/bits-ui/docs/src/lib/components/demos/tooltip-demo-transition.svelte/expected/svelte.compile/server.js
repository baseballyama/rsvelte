import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";
import MagicWand from "phosphor-svelte/lib/MagicWand";
import { fly } from "svelte/transition";

export default function Tooltip_demo_transition($$renderer) {
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
									class: 'border-border-input bg-background-alt shadow-btn ring-dark ring-offset-background\n		hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex size-10 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-offset-2',
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

							{
								function child($$renderer, { wrapperProps, props, open }) {
									if (open) {
										$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}><div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex items-center justify-center border p-3 text-sm font-medium">Make some magic!</div></div></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										sideOffset: 8,
										forceMount: true,
										child,
										$$slots: { child: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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
}