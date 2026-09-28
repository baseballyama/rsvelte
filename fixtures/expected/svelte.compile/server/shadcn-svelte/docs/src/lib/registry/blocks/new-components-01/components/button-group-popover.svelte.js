import * as $ from 'svelte/internal/server';
import Bot from "@lucide/svelte/icons/bot";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Button_group_popover($$renderer) {
	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					children: ($$renderer) => {
						Bot($$renderer, {});
						$$renderer.push(`<!----> Copilot`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										props,
										{
											variant: 'outline',
											size: 'icon',
											'aria-label': 'Open Popover',
											children: ($$renderer) => {
												ChevronDown($$renderer, {});
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Popover.Trigger) {
									$$renderer.push('<!--[-->');
									Popover.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									align: 'end',
									class: 'rounded-xl p-0 text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<div class="px-4 py-3"><div class="text-sm font-medium">Agent Tasks</div></div> `);
										Separator($$renderer, {});
										$$renderer.push(`<!----> <div class="p-4 text-sm *:[p:not(:last-child)]:mb-2">`);

										Textarea($$renderer, {
											placeholder: 'Describe your task in natural language.',
											class: 'mb-4 resize-none'
										});

										$$renderer.push(`<!----> <p class="font-medium">Start a new task with Copilot</p> <p class="text-muted-foreground">Describe your task in natural language. Copilot will work in the background and open a
					pull request for your review.</p></div>`);
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
}