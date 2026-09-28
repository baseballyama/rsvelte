import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import ListFilter from '@lucide/svelte/icons/list-filter';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_html(`<div class="space-y-3"><div class="text-muted-foreground text-xs font-medium">Filters</div> <form class="space-y-3"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div role="separator" aria-orientation="horizontal" class="bg-border -mx-3 my-1 h-px"></div> <div class="flex justify-between gap-2"><!> <!></div></form></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Popover_01($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon', 'aria-label': 'Filters' }, props, {
						children: ($$anchor, $$slotProps) => {
							ListFilter($$anchor, { size: 16, 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			PopoverContent(node_2, {
				class: 'w-36 p-3',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var form = $.sibling($.child(div_1), 2);
					var div_2 = $.child(form);
					var node_3 = $.child(div_2);

					Checkbox(node_3, { id: 'popover-filter-01' });

					var node_4 = $.sibling(node_3, 2);

					Label(node_4, {
						for: 'popover-filter-01',
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Real Time');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_5 = $.child(div_3);

					Checkbox(node_5, { id: 'popover-filter-02' });

					var node_6 = $.sibling(node_5, 2);

					Label(node_6, {
						for: 'popover-filter-02',
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Top Channels');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_7 = $.child(div_4);

					Checkbox(node_7, { id: 'popover-filter-03' });

					var node_8 = $.sibling(node_7, 2);

					Label(node_8, {
						for: 'popover-filter-03',
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Last Orders');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_9 = $.child(div_5);

					Checkbox(node_9, { id: 'popover-filter-04' });

					var node_10 = $.sibling(node_9, 2);

					Label(node_10, {
						for: 'popover-filter-04',
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Total Spent');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 4);
					var node_11 = $.child(div_6);

					Button(node_11, {
						size: 'sm',
						variant: 'outline',
						class: 'h-7 px-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Clear');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Button(node_12, {
						size: 'sm',
						class: 'h-7 px-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Apply');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.reset(form);
					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}