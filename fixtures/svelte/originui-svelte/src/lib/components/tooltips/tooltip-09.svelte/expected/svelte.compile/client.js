import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`<div class="space-y-2"><div class="text-[13px] font-medium">Tuesday, Aug 13</div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-indigo-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Sales <span class="ml-auto">$40</span></span></div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-purple-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Revenue <span class="ml-auto">$74</span></span></div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-rose-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Costs <span class="ml-auto">$410</span></span></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_09($$anchor) {
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

									var text = $.text('Chart');

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