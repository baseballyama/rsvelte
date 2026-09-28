import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Globe from '@lucide/svelte/icons/globe';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`<div class="flex gap-3"><!> <div class="space-y-1"><p class="text-[13px] font-medium">Tooltip with title and icon</p> <p class="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich
						content, and a robust API.</p></div></div>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_05($$anchor) {
	TooltipProvider($$anchor, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm' }, props, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('W/ icon');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							}));
						};

						TooltipTrigger(node, { child, $$slots: { child: true } });
					}

					var node_1 = $.sibling(node, 2);

					TooltipContent(node_1, {
						class: 'dark py-3',
						children: ($$anchor, $$slotProps) => {
							var div = root();
							var node_2 = $.child(div);

							Globe(node_2, {
								class: 'mt-0.5 shrink-0 opacity-60',
								size: 16,
								'aria-hidden': 'true'
							});

							$.next(2);
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}