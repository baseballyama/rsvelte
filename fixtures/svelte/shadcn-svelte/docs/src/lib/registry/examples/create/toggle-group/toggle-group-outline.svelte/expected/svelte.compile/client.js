import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Toggle_group_outline($$anchor) {
	let value = $.state("all");

	Example($$anchor, {
		title: 'Outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
				ToggleGroup_Root($$anchor, {
					variant: 'outline',
					type: 'single',
					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
							ToggleGroup_Item($$anchor, {
								value: 'all',
								'aria-label': 'Toggle all',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('All');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
							ToggleGroup_Item_1($$anchor, {
								value: 'missed',
								'aria-label': 'Toggle missed',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Missed');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}