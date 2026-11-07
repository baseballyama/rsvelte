import * as $ from 'svelte/internal/server';
import * as constants from '$lib/constants/generator';
import { globals, settingsColors } from '$lib/state/generator.svelte';
import { genColorRamp, genRandomSeed, getColorKey, seedColor } from '$lib/utils/generator/colors';
import ControlsColorsContrast from './ControlsColorsContrast.svelte';
import DicesIcon from '@lucide/svelte/icons/dices';
import EraserIcon from '@lucide/svelte/icons/eraser';
import PencilIcon from '@lucide/svelte/icons/pencil';
import SproutIcon from '@lucide/svelte/icons/sprout';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

export default function ControlsColors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorSelection = [
			{
				label: 'Primary',
				description: 'The primary brand color.',
				value: 'primary',
				class: 'preset-filled-primary-500'
			},

			{
				label: 'Secondary',
				description: 'A secondary accent color.',
				value: 'secondary',
				class: 'preset-filled-secondary-500'
			},

			{
				label: 'Tertiary',
				description: 'A tertiary accent color.',
				value: 'tertiary',
				class: 'preset-filled-tertiary-500'
			},

			{
				label: 'Success',
				description: 'Used for successful states.',
				value: 'success',
				class: 'preset-filled-success-500'
			},

			{
				label: 'Warning',
				description: 'Used for warning states.',
				value: 'warning',
				class: 'preset-filled-warning-500'
			},

			{
				label: 'Error',
				description: 'Used for error states.',
				value: 'error',
				class: 'preset-filled-error-500'
			},

			{
				label: 'Surface',
				description: 'The neutral surface tones.',
				value: 'surface',
				class: 'preset-filled-surface-500'
			}
		];

		const shadesAll = constants.colorShades;

		const shades3x = [
			constants.colorShades[0],
			500,
			constants.colorShades[constants.colorShades.length - 1]
		]; // 50/500/950

		// State
		let showAllShades = false;

		const rxShadeArray = $.derived(() => showAllShades ? shadesAll : shades3x);

		function onClearPalette() {
			if (confirm('This will reset each color palette to neutral tones. This can be useful when starting a brand new theme. All current color changes will be lost, are you sure you wish to continue?')) {
				constants.colorNames.forEach((colorName) => seedColor(colorName, '#CCCCCC'));
			}
		}

		function promptColorSeed(colorName) {
			const promptSeed = prompt(`Automatically generate a ${colorName} color palette from a hex color value that you provide.`);

			if (promptSeed) seedColor(colorName, promptSeed);
		}

		function promptRandomColor(colorName) {
			if (confirm(`Generate a random palette for the ${colorName} color?`)) {
				genRandomSeed(colorName);
			}
		}

		$$renderer.push(`<div class="space-y-4"><p class="opacity-60">Define a palette per each available theme color.</p> <button type="button" class="btn preset-outlined-surface-200-800 hover:preset-tonal w-full">`);
		EraserIcon($$renderer, { size: 20 });
		$$renderer.push(`<!----> <span>Clear All Palettes</span></button> `);

		Tabs($$renderer, {
			value: globals.activeColor,
			onValueChange: (e) => globals.activeColor = e.value,
			children: ($$renderer) => {
				if (Tabs.List) {
					$$renderer.push('<!--[-->');

					Tabs.List($$renderer, {
						class: 'justify-between',
						children: ($$renderer) => {
							if (Tabs.Indicator) {
								$$renderer.push('<!--[-->');
								Tabs.Indicator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like(colorSelection);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let color = each_array[$$index];

								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: color.value,
										class: `aspect-square w-13 flex justify-center items-center ${$.stringify(color.class)}`,
										children: ($$renderer) => {
											{
												function children($$renderer, tabs) {
													if (tabs().value === color.value) {
														$$renderer.push('<!--[0-->');
														PencilIcon($$renderer, { size: 20 });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}

												if (Tabs.Context) {
													$$renderer.push('<!--[-->');
													Tabs.Context($$renderer, { children, $$slots: { default: true } });
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
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array_1 = $.ensure_array_like(colorSelection);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let color = each_array_1[$$index_2];

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: color.value,
							children: ($$renderer) => {
								if (color.value === globals.activeColor) {
									$$renderer.push('<!--[0-->');

									const activeColorLabel = colorSelection.find((c) => c.value === globals.activeColor)?.label;

									$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-[1fr_auto_auto] items-center gap-2"><h3 class="h5">${$.escape(activeColorLabel)}</h3> <button type="button" class="chip preset-outlined-surface-300-700 hover:preset-tonal" title="Generate a full palette based on a single color value. The provide color represents shade 500.">`);
									SproutIcon($$renderer, { size: 14 });
									$$renderer.push(`<!----> <span>Seed</span></button> <button type="button" class="chip preset-outlined-surface-300-700 hover:preset-tonal" title="Generate a palette using a randomly selected color.">`);
									DicesIcon($$renderer, { size: 14 });
									$$renderer.push(`<!----> <span>Random</span></button></div> `);

									Tabs($$renderer, {
										value: showAllShades ? 'all-stops' : 'three-stops',
										onValueChange: (e) => showAllShades = e.value === 'all-stops',
										children: ($$renderer) => {
											if (Tabs.List) {
												$$renderer.push('<!--[-->');

												Tabs.List($$renderer, {
													children: ($$renderer) => {
														if (Tabs.Indicator) {
															$$renderer.push('<!--[-->');
															Tabs.Indicator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Tabs.Trigger) {
															$$renderer.push('<!--[-->');

															Tabs.Trigger($$renderer, {
																value: 'three-stops',
																class: 'flex-1',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Three Stops`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Tabs.Trigger) {
															$$renderer.push('<!--[-->');

															Tabs.Trigger($$renderer, {
																value: 'all-stops',
																class: 'flex-1',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->All Stops`);
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

									$$renderer.push(`<!----> <div>`);

									if (showAllShades) {
										$$renderer.push(`<!--[0--><p class="opacity-60">All stops must be manually defined.</p>`);
									} else {
										$$renderer.push(`<!--[-1--><p class="opacity-60">Stops automatically blend between 50/500/950.</p>`);
									}

									$$renderer.push(`<!--]--></div> <table class="table"><tbody><!--[-->`);

									const each_array_2 = $.ensure_array_like(rxShadeArray());

									for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
										let shade = each_array_2[$$index_1];

										$$renderer.push(`<tr><td class="text-xs opacity-60">${$.escape(shade)}</td><td><input type="text" class="input"${$.attr('value', settingsColors[getColorKey(color.value, shade.toString())])}/></td><td class="w-[1%] whitespace-nowrap"><input class="input scale-85" type="color"${$.attr('value', settingsColors[getColorKey(color.value, shade.toString())])}/></td></tr>`);
									}

									$$renderer.push(`<!--]--></tbody></table> `);
									ControlsColorsContrast($$renderer, { colorValue: color.value });
									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}