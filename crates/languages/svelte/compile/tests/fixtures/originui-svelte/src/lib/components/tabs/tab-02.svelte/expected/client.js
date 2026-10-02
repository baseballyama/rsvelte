import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 1</p>`);
var root_2 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>`);
var root_3 = $.from_html(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tab_02($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			TabsList(node, {
				class: 'bg-transparent',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					TabsTrigger(node_1, {
						value: 'tab-1',
						class: 'data-[state=active]:bg-muted data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Tab 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TabsTrigger(node_2, {
						value: 'tab-2',
						class: 'data-[state=active]:bg-muted data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tab 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TabsTrigger(node_3, {
						value: 'tab-3',
						class: 'data-[state=active]:bg-muted data-[state=active]:shadow-none',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Tab 3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			TabsContent(node_4, {
				value: 'tab-1',
				children: ($$anchor, $$slotProps) => {
					var p = root_1();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			TabsContent(node_5, {
				value: 'tab-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_2();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			TabsContent(node_6, {
				value: 'tab-3',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_3();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}