import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

var root = $.from_html(`<!> Overview`, 1);
var root_1 = $.from_html(`<!> Repositories`, 1);
var root_2 = $.from_html(`<!> Packages`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 1</p>`);
var root_5 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>`);
var root_6 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tab_13($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			TabsList(node, {
				class: 'border-border h-auto rounded-none border-b bg-transparent p-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_1 = $.first_child(fragment_2);

					TabsTrigger(node_1, {
						value: 'tab-1',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							House(node_2, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					TabsTrigger(node_3, {
						value: 'tab-2',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							PanelsTopLeft(node_4, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					TabsTrigger(node_5, {
						value: 'tab-3',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_6 = $.first_child(fragment_5);

							Box(node_6, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
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