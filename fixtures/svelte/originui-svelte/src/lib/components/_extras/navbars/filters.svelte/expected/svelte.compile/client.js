import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';
import ListFilterIcon from '@lucide/svelte/icons/list-filter';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_html(`<!> Filters`, 1);
var root_1 = $.from_html(`<div class="space-y-3"><div class="text-xs font-medium">Filters</div> <form><div class="space-y-3"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div> <div role="separator" aria-orientation="horizontal" class="bg-border -mx-3 my-3 h-px"></div> <div class="flex justify-between gap-2"><!> <!></div></form></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Filters($$anchor) {
	const id = $.props_id();
	var div = root_3();
	var node = $.child(div);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm', class: 'text-sm' }, props, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							ListFilterIcon(node_2, {
								size: 16,
								class: 'text-muted-foreground/80 -ms-1',
								'aria-hidden': 'true'
							});

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_3 = $.sibling(node_1, 2);

			PopoverContent(node_3, {
				class: 'w-36 p-3',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();
					var form = $.sibling($.child(div_1), 2);
					var div_2 = $.child(form);
					var div_3 = $.child(div_2);
					var node_4 = $.child(div_3);

					Checkbox(node_4, {
						get id() {
							return `${id}-1`;
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Label(node_5, {
						get for() {
							return `${id}-1`;
						},
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Real Time');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_6 = $.child(div_4);

					Checkbox(node_6, {
						get id() {
							return `${id}-2`;
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Label(node_7, {
						get for() {
							return `${id}-2`;
						},
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Top Channels');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_8 = $.child(div_5);

					Checkbox(node_8, {
						get id() {
							return `${id}-3`;
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Label(node_9, {
						get for() {
							return `${id}-3`;
						},
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Last Orders');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_10 = $.child(div_6);

					Checkbox(node_10, {
						get id() {
							return `${id}-4`;
						}
					});

					var node_11 = $.sibling(node_10, 2);

					Label(node_11, {
						get for() {
							return `${id}-4`;
						},
						class: 'font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Total Spent');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.reset(div_2);

					var div_7 = $.sibling(div_2, 4);
					var node_12 = $.child(div_7);

					Button(node_12, {
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

					var node_13 = $.sibling(node_12, 2);

					Button(node_13, {
						size: 'sm',
						class: 'h-7 px-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Apply');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);
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