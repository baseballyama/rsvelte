import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

var root = $.from_html(`<!> Overview`, 1);
var root_1 = $.from_html(`<!> Repositories`, 1);
var root_2 = $.from_html(`<!> Packages`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 1</p>`);
var root_5 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>`);
var root_6 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tab_14($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			TabsList(node, {
				class: 'mx-auto flex max-w-xs bg-transparent',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_1 = $.first_child(fragment_2);

					TabsTrigger(node_1, {
						value: 'tab-1',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Badge(node_2, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('3');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					TabsTrigger(node_3, {
						value: 'tab-2',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							Badge(node_4, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('0');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					TabsTrigger(node_5, {
						value: 'tab-3',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_6 = $.first_child(fragment_5);

							Badge(node_6, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('7');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node, 2);

			TabsContent(node_7, {
				value: 'tab-1',
				children: ($$anchor, $$slotProps) => {
					var p = root_4();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			TabsContent(node_8, {
				value: 'tab-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_5();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			TabsContent(node_9, {
				value: 'tab-3',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_6();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}