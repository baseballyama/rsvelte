import * as $ from 'svelte/internal/server';
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

export default function Controls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<section class="relative h-screen bg-surface-100-900 border-l border-surface-300-700 pb-96 overflow-y-auto"><header class="sticky top-0 z-10 bg-surface-100/50 dark:bg-surface-900/50 backdrop-blur-xl p-5 flex justify-between items-center gap-4 shadow-lg">`);

		SegmentedControl($$renderer, {
			name: 'display',
			value: view(),
			onValueChange: (e) => globals.panel = e.value,
			class: 'w-full',
			children: ($$renderer) => {
				if (SegmentedControl.Control) {
					$$renderer.push('<!--[-->');

					SegmentedControl.Control($$renderer, {
						children: ($$renderer) => {
							if (SegmentedControl.Indicator) {
								$$renderer.push('<!--[-->');
								SegmentedControl.Indicator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'preview',
									class: 'w-full',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Preview`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'code',
									class: 'w-full',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Code`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></header> `);
		ControlsCore($$renderer, {});
		$$renderer.push(`<!----> <div class="space-y-10">`);

		Accordion($$renderer, {
			collapsible: true,
			class: 'gap-0',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.push(`<hr class="hr"/> `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: item.value,
							class: 'p-0',
							children: ($$renderer) => {
								$$renderer.push(`<h4 class="h4">`);

								if (Accordion.ItemTrigger) {
									$$renderer.push('<!--[-->');

									Accordion.ItemTrigger($$renderer, {
										class: 'grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:preset-tonal px-5 py-3 rounded-none',
										children: ($$renderer) => {
											$$renderer.push(`<span class="btn-icon preset-tonal">`);

											if (item.icon) {
												$$renderer.push('<!--[-->');
												item.icon($$renderer, { class: 'size-5' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</span> ${$.escape(item.label)} `);

											if (Accordion.ItemIndicator) {
												$$renderer.push('<!--[-->');

												Accordion.ItemIndicator($$renderer, {
													children: ($$renderer) => {
														{
															function children($$renderer, accordion) {
																if (accordion().getItemState(item).expanded) {
																	$$renderer.push('<!--[0-->');
																	ChevronUpIcon($$renderer, {});
																} else {
																	$$renderer.push('<!--[-1-->');
																	ChevronDownIcon($$renderer, {});
																}

																$$renderer.push(`<!--]-->`);
															}

															if (Accordion.Context) {
																$$renderer.push('<!--[-->');
																Accordion.Context($$renderer, { children, $$slots: { default: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</h4> `);

								if (Accordion.ItemContent) {
									$$renderer.push('<!--[-->');

									Accordion.ItemContent($$renderer, {
										class: 'p-5',
										children: ($$renderer) => {
											if (item.component) {
												$$renderer.push('<!--[-->');
												item.component($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]--> <hr class="hr"/>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <footer class="p-5"><button class="btn btn-xl w-full preset-filled">Export Theme</button></footer></section>`);
	});
}