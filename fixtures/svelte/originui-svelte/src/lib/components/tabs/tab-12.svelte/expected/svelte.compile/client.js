import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Box from '@lucide/svelte/icons/box';
import ChartLine from '@lucide/svelte/icons/chart-line';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import Settings from '@lucide/svelte/icons/settings';
import UsersRound from '@lucide/svelte/icons/users-round';
import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

var root = $.from_html(`<!> Overview`, 1);
var root_1 = $.from_html(`<!> Repositories <!>`, 1);
var root_2 = $.from_html(`<!> Packages <!>`, 1);
var root_3 = $.from_html(`<!> Team`, 1);
var root_4 = $.from_html(`<!> Insights`, 1);
var root_5 = $.from_html(`<!> Settings`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 1</p>`);
var root_9 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 2</p>`);
var root_10 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 3</p>`);
var root_11 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 4</p>`);
var root_12 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 5</p>`);
var root_13 = $.from_html(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 6</p>`);
var root_14 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tab_12($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_14();
			var node = $.first_child(fragment_1);

			ScrollArea(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_7();
					var node_1 = $.first_child(fragment_2);

					TabsList(node_1, {
						class: 'text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_6();
							var node_2 = $.first_child(fragment_3);

							TabsTrigger(node_2, {
								value: 'tab-1',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
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
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_5 = $.first_child(fragment_5);

									PanelsTopLeft(node_5, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									var node_6 = $.sibling(node_5, 2);

									Badge(node_6, {
										class: 'bg-primary/15 ms-1.5 min-w-5 px-1',
										variant: 'secondary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('3');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_4, 2);

							TabsTrigger(node_7, {
								value: 'tab-3',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_8 = $.first_child(fragment_6);

									Box(node_8, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									var node_9 = $.sibling(node_8, 2);

									Badge(node_9, {
										class: 'ms-1.5',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('New');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_7, 2);

							TabsTrigger(node_10, {
								value: 'tab-4',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var node_11 = $.first_child(fragment_7);

									UsersRound(node_11, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_10, 2);

							TabsTrigger(node_12, {
								value: 'tab-5',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_13 = $.first_child(fragment_8);

									ChartLine(node_13, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_12, 2);

							TabsTrigger(node_14, {
								value: 'tab-6',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_5();
									var node_15 = $.first_child(fragment_9);

									Settings(node_15, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$.next();
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_1, 2);

					Scrollbar(node_16, { orientation: 'horizontal' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node, 2);

			TabsContent(node_17, {
				value: 'tab-1',
				children: ($$anchor, $$slotProps) => {
					var p = root_8();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			TabsContent(node_18, {
				value: 'tab-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_9();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			TabsContent(node_19, {
				value: 'tab-3',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_10();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			TabsContent(node_20, {
				value: 'tab-4',
				children: ($$anchor, $$slotProps) => {
					var p_3 = root_11();

					$.append($$anchor, p_3);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			TabsContent(node_21, {
				value: 'tab-5',
				children: ($$anchor, $$slotProps) => {
					var p_4 = root_12();

					$.append($$anchor, p_4);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			TabsContent(node_22, {
				value: 'tab-6',
				children: ($$anchor, $$slotProps) => {
					var p_5 = root_13();

					$.append($$anchor, p_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}