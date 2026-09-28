import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Plus from '@lucide/svelte/icons/plus';

var root = $.from_html(`<!> <!>`, 1);

export default function Button_22($$anchor) {
	TooltipProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Add new item'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										Plus($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node, { child, $$slots: { child: true } });
					}

					var node_1 = $.sibling(node, 2);

					TooltipContent(node_1, {
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Tooltip');

							$.append($$anchor, text);
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