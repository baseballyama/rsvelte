import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

var root = $.from_html(`<!> Overview`, 1);
var root_1 = $.from_html(`<!> Repositories`, 1);
var root_2 = $.from_html(`<!> Packages`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 1</p>`);
var root_6 = $.from_html(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 2</p>`);
var root_7 = $.from_html(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 3</p>`);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tab_10($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_8();
			var node = $.first_child(fragment_1);

			ScrollArea(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_4();
					var node_1 = $.first_child(fragment_2);

					TabsList(node_1, {
						class: 'bg-background mb-3 h-auto -space-x-px p-0 shadow-xs shadow-black/5 rtl:space-x-reverse',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_2 = $.first_child(fragment_3);

							TabsTrigger(node_2, {
								value: 'tab-1',
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									House(node_3, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_2, 2);

							TabsTrigger(node_4, {
								value: 'tab-2',
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_5 = $.first_child(fragment_5);

									PanelsTopLeft(node_5, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_4, 2);

							TabsTrigger(node_6, {
								value: 'tab-3',
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_7 = $.first_child(fragment_6);

									Box(node_7, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_1, 2);

					Scrollbar(node_8, { orientation: 'horizontal' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node, 2);

			TabsContent(node_9, {
				value: 'tab-1',
				children: ($$anchor, $$slotProps) => {
					var p = root_5();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			TabsContent(node_10, {
				value: 'tab-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_6();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			TabsContent(node_11, {
				value: 'tab-3',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_7();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}