import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Toggle_group_sizes($$anchor) {
	let value1 = $.state("top");
	let value2 = $.state("top");

	Example($$anchor, {
		title: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
				ToggleGroup_Root($$anchor, {
					size: 'sm',
					type: 'single',
					variant: 'outline',
					get value() {
						return $.get(value1);
					},

					set value($$value) {
						$.set(value1, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root_1) => {
				ToggleGroup_Root_1($$anchor, {
					type: 'single',
					variant: 'outline',
					get value() {
						return $.get(value2);
					},

					set value($$value) {
						$.set(value2, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_6 = $.first_child(fragment_2);

						$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_4) => {
							ToggleGroup_Item_4($$anchor, {
								value: 'top',
								'aria-label': 'Toggle top',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Top');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_5) => {
							ToggleGroup_Item_5($$anchor, {
								value: 'bottom',
								'aria-label': 'Toggle bottom',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Bottom');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_6) => {
							ToggleGroup_Item_6($$anchor, {
								value: 'left',
								'aria-label': 'Toggle left',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Left');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_7) => {
							ToggleGroup_Item_7($$anchor, {
								value: 'right',
								'aria-label': 'Toggle right',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Right');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}