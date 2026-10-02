import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Toggle_group_vertical_with_spacing($$anchor) {
	let value = $.state("top");

	Example($$anchor, {
		title: 'Vertical With Spacing',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
				ToggleGroup_Root($$anchor, {
					size: 'sm',
					type: 'single',
					variant: 'outline',
					orientation: 'vertical',
					spacing: 1,
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
								value: 'top',
								'aria-label': 'Toggle top',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Top');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
							ToggleGroup_Item_1($$anchor, {
								value: 'bottom',
								'aria-label': 'Toggle bottom',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Bottom');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
							ToggleGroup_Item_2($$anchor, {
								value: 'left',
								'aria-label': 'Toggle left',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Left');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
							ToggleGroup_Item_3($$anchor, {
								value: 'right',
								'aria-label': 'Toggle right',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Right');

									$.append($$anchor, text_3);
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