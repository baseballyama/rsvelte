import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_html(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium">Popover with button</p> <p class="text-muted-foreground text-xs">I am a popover that would like to look like a tooltip. I can&lsquo;t be a tooltip because
					of the interactive element inside me.</p></div> <!></div>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function Popover_04($$anchor) {
	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Tooltip-like popover');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			PopoverContent(node_1, {
				class: 'max-w-[280px] py-3 shadow-none',
				side: 'top',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_2 = $.sibling($.child(div), 2);

					Button(node_2, {
						size: 'sm',
						class: 'h-7 px-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Know more');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}