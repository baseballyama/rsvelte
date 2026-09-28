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
var root_4 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 1</p>`);
var root_5 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 2</p>`);
var root_6 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 3</p>`);
var root_7 = $.from_html(`<!> <div class="border-border grow rounded-lg border text-start"><!> <!> <!></div>`, 1);

export default function Tab_19($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		orientation: 'vertical',
		class: 'w-full flex-row',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			TabsList(node, {
				class: 'text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_1 = $.first_child(fragment_2);

					TabsTrigger(node_1, {
						value: 'tab-1',
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							House(node_2, {
								class: '-ms-0.5 me-1.5 opacity-60',
								size: 16,
								'aria-hidden': 'true'
							});

							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					TabsTrigger(node_3, {
						value: 'tab-2',
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							PanelsTopLeft(node_4, {
								class: '-ms-0.5 me-1.5 opacity-60',
								size: 16,
								'aria-hidden': 'true'
							});

							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					TabsTrigger(node_5, {
						value: 'tab-3',
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_6 = $.first_child(fragment_5);

							Box(node_6, {
								class: '-ms-0.5 me-1.5 opacity-60',
								size: 16,
								'aria-hidden': 'true'
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

			var div = $.sibling(node, 2);
			var node_7 = $.child(div);

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

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}