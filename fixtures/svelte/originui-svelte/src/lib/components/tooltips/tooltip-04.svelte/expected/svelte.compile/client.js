import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`<div class="space-y-1"><p class="text-[13px] font-medium">Tooltip with title</p> <p class="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich
					content, and a robust API. You can even use them as a full-featured dropdown menu by
					setting the <code>trigger</code> prop to <code>click</code>.</p></div>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_04($$anchor) {
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

									var text = $.text('W/ title');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							}));
						};

						TooltipTrigger(node, { child, $$slots: { child: true } });
					}

					var node_1 = $.sibling(node, 2);

					TooltipContent(node_1, {
						class: 'py-3',
						children: ($$anchor, $$slotProps) => {
							var div = root();

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