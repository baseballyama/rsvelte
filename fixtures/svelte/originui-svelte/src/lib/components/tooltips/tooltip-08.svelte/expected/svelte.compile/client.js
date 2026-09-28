import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`<ul class="grid gap-3 text-xs"><li class="grid gap-0.5"><span class="text-muted-foreground">Status</span> <span class="font-medium">Completed</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Code Coverage</span> <span class="font-medium">94.3%</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Last Deploy</span> <span class="font-medium">Today at 15:42</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Performance Score</span> <span class="font-medium">98/100</span></li></ul>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_08($$anchor) {
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

									var text = $.text('Stats');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							}));
						};

						TooltipTrigger(node, { child, $$slots: { child: true } });
					}

					var node_1 = $.sibling(node, 2);

					TooltipContent(node_1, {
						class: ' py-3',
						children: ($$anchor, $$slotProps) => {
							var ul = root();

							$.append($$anchor, ul);
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