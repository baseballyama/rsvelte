import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { globals } from '$lib/state/generator.svelte';
import ControlsBackgrounds from './ControlsBackgrounds.svelte';
import ControlsBrand from './ControlsBrand.svelte';
import ControlsColors from './ControlsColors.svelte';
import ControlsCore from './ControlsCore.svelte';
import ControlsEdges from './ControlsEdges.svelte';
import ControlsSpacing from './ControlsSpacing.svelte';
import ControlsTypography from './ControlsTypography.svelte';
import ALargeSmallIcon from '@lucide/svelte/icons/a-large-small';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
import LayersIcon from '@lucide/svelte/icons/layers';
import PaletteIcon from '@lucide/svelte/icons/palette';
import ScalingIcon from '@lucide/svelte/icons/scaling';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import SquareDashedIcon from '@lucide/svelte/icons/square-dashed';
import { Accordion, SegmentedControl } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<span class="btn-icon preset-tonal"><!></span> <!>`, 1);
var root_3 = $.from_html(`<h4 class="h4"><!></h4> <!>`, 1);
var root_4 = $.from_html(`<hr class="hr"/> <!>`, 1);
var root_5 = $.from_html(`<!> <hr class="hr"/>`, 1);
var root_6 = $.from_html(`<section class="relative h-screen bg-surface-100-900 border-l border-surface-300-700 pb-96 overflow-y-auto"><header class="sticky top-0 z-10 bg-surface-100/50 dark:bg-surface-900/50 backdrop-blur-xl p-5 flex justify-between items-center gap-4 shadow-lg"><!></header> <!> <div class="space-y-10"><!></div> <footer class="p-5"><button class="btn btn-xl w-full preset-filled">Export Theme</button></footer></section>`);

export default function Controls($$anchor, $$props) {
	$.push($$props, true);

	let view = $.derived(() => globals.panel);

	const items = [
		{
			value: 'colors',
			icon: PaletteIcon,
			label: 'Color Palette',
			component: ControlsColors
		},

		{
			value: 'brand',
			icon: SparklesIcon,
			label: 'Brand',
			component: ControlsBrand
		},

		{
			value: 'backgrounds',
			icon: LayersIcon,
			label: 'Backgrounds',
			component: ControlsBackgrounds
		},

		{
			value: 'spacing',
			icon: ScalingIcon,
			label: 'Spacing',
			component: ControlsSpacing
		},

		{
			value: 'edges',
			icon: SquareDashedIcon,
			label: 'Edges',
			component: ControlsEdges
		},

		{
			value: 'typography',
			icon: ALargeSmallIcon,
			label: 'Typography',
			component: ControlsTypography
		}
	];

	var section = root_6();
	var header = $.child(section);
	var node = $.child(header);

	SegmentedControl(node, {
		name: 'display',
		get value() {
			return $.get(view);
		},
		onValueChange: (e) => globals.panel = e.value,
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'preview',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Preview');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_3, 2);

						$.component(node_6, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: 'code',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_7 = $.first_child(fragment_3);

									$.component(node_7, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Code');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(header);

	var node_9 = $.sibling(header, 2);

	ControlsCore(node_9, {});

	var div = $.sibling(node_9, 2);
	var node_10 = $.child(div);

	Accordion(node_10, {
		collapsible: true,
		class: 'gap-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_5();
			var node_11 = $.first_child(fragment_4);

			$.each(node_11, 16, () => items, (item) => item, ($$anchor, item) => {
				var fragment_5 = root_4();
				var node_12 = $.sibling($.first_child(fragment_5), 2);

				$.component(node_12, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						get value() {
							return item.value;
						},
						class: 'p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var h4 = $.first_child(fragment_6);
							var node_13 = $.child(h4);

							$.component(node_13, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
								Accordion_ItemTrigger($$anchor, {
									class: 'grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:preset-tonal px-5 py-3 rounded-none',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_2();
										var span = $.first_child(fragment_7);
										var node_14 = $.child(span);

										$.component(node_14, () => item.icon, ($$anchor, $$component) => {
											$$component($$anchor, { class: 'size-5' });
										});

										$.reset(span);

										var text_2 = $.sibling(span);
										var node_15 = $.sibling(text_2);

										$.component(node_15, () => Accordion.ItemIndicator, ($$anchor, Accordion_ItemIndicator) => {
											Accordion_ItemIndicator($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_16 = $.first_child(fragment_8);

													{
														const children = ($$anchor, accordion = $.noop) => {
															var fragment_9 = $.comment();
															var node_17 = $.first_child(fragment_9);

															{
																var consequent = ($$anchor) => {
																	ChevronUpIcon($$anchor, {});
																};

																var d = $.derived(() => accordion()().getItemState(item).expanded);

																var alternate = ($$anchor) => {
																	ChevronDownIcon($$anchor, {});
																};

																$.if(node_17, ($$render) => {
																	if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
																});
															}

															$.append($$anchor, fragment_9);
														};

														$.component(node_16, () => Accordion.Context, ($$anchor, Accordion_Context) => {
															Accordion_Context($$anchor, { children, $$slots: { default: true } });
														});
													}

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.template_effect(() => $.set_text(text_2, ` ${item.label ?? ''} `));
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h4);

							var node_18 = $.sibling(h4, 2);

							$.component(node_18, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
								Accordion_ItemContent($$anchor, {
									class: 'p-5',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = $.comment();
										var node_19 = $.first_child(fragment_12);

										$.component(node_19, () => item.component, ($$anchor, $$component) => {
											$$component($$anchor, {});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.next(2);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var footer = $.sibling(div, 2);
	var button = $.only_child(footer);

	$.reset(section);
	$.delegated('click', button, () => globals.panel = 'code');
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);