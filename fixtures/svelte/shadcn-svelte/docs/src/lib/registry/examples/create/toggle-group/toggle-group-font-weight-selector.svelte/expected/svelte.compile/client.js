import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="text-2xl leading-none font-light">Aa</span> <span class="text-xs text-muted-foreground">Light</span>`, 1);
var root_1 = $.from_html(`<span class="text-2xl leading-none font-normal">Aa</span> <span class="text-xs text-muted-foreground">Normal</span>`, 1);
var root_2 = $.from_html(`<span class="text-2xl leading-none font-medium">Aa</span> <span class="text-xs text-muted-foreground">Medium</span>`, 1);
var root_3 = $.from_html(`<span class="text-2xl leading-none font-bold">Aa</span> <span class="text-xs text-muted-foreground">Bold</span>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`Use <code class="rounded-md bg-muted px-1 py-0.5 font-mono"> </code> to set the font weight.`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_font_weight_selector($$anchor) {
	let fontWeight = $.state("normal");

	Example($$anchor, {
		title: 'Font Weight Selector',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_6();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Font Weight');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
							ToggleGroup_Root($$anchor, {
								type: 'single',
								variant: 'outline',
								spacing: 2,
								size: 'lg',
								get value() {
									return $.get(fontWeight);
								},

								set value($$value) {
									$.set(fontWeight, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_4();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
										ToggleGroup_Item($$anchor, {
											value: 'light',
											'aria-label': 'Light',
											class: 'flex size-16 flex-col items-center justify-center rounded-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();

												$.next(2);
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
										ToggleGroup_Item_1($$anchor, {
											value: 'normal',
											'aria-label': 'Normal',
											class: 'flex size-16 flex-col items-center justify-center rounded-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();

												$.next(2);
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
										ToggleGroup_Item_2($$anchor, {
											value: 'medium',
											'aria-label': 'Medium',
											class: 'flex size-16 flex-col items-center justify-center rounded-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();

												$.next(2);
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
										ToggleGroup_Item_3($$anchor, {
											value: 'bold',
											'aria-label': 'Bold',
											class: 'flex size-16 flex-col items-center justify-center rounded-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_3();

												$.next(2);
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_2, 2);

						$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_8 = root_5();
									var code = $.sibling($.first_child(fragment_8));
									var text_1 = $.only_child(code);

									$.next();
									$.template_effect(() => $.set_text(text_1, `font-${$.get(fontWeight) ?? ''}`));
									$.append($$anchor, fragment_8);
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