import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as constants from '$lib/constants/generator';
import { globals, settingsColors } from '$lib/state/generator.svelte';
import { genColorRamp, genRandomSeed, getColorKey, seedColor } from '$lib/utils/generator/colors';
import ControlsColorsContrast from './ControlsColorsContrast.svelte';
import DicesIcon from '@lucide/svelte/icons/dices';
import EraserIcon from '@lucide/svelte/icons/eraser';
import PencilIcon from '@lucide/svelte/icons/pencil';
import SproutIcon from '@lucide/svelte/icons/sprout';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<p class="opacity-60">All stops must be manually defined.</p>`);
var root_3 = $.from_html(`<p class="opacity-60">Stops automatically blend between 50/500/950.</p>`);
var root_4 = $.from_html(`<tr><td class="text-xs opacity-60"> </td><td><input type="text" class="input"/></td><td class="w-[1%] whitespace-nowrap"><input class="input scale-85" type="color"/></td></tr>`);
var root_5 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-[1fr_auto_auto] items-center gap-2"><h3 class="h5"> </h3> <button type="button" class="chip preset-outlined-surface-300-700 hover:preset-tonal" title="Generate a full palette based on a single color value. The provide color represents shade 500."><!> <span>Seed</span></button> <button type="button" class="chip preset-outlined-surface-300-700 hover:preset-tonal" title="Generate a palette using a randomly selected color."><!> <span>Random</span></button></div> <!> <div><!></div> <table class="table"><tbody></tbody></table> <!></div>`);
var root_6 = $.from_html(`<div class="space-y-4"><p class="opacity-60">Define a palette per each available theme color.</p> <button type="button" class="btn preset-outlined-surface-200-800 hover:preset-tonal w-full"><!> <span>Clear All Palettes</span></button> <!></div>`);

export default function ControlsColors($$anchor, $$props) {
	$.push($$props, true);

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
	let showAllShades = $.state(false);

	const rxShadeArray = $.derived(() => $.get(showAllShades) ? shadesAll : shades3x);

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

	var div = root_6();
	var button = $.sibling($.child(div), 2);
	var node = $.child(button);

	EraserIcon(node, { size: 20 });
	$.next(2);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	Tabs(node_1, {
		get value() {
			return globals.activeColor;
		},
		onValueChange: (e) => globals.activeColor = e.value,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Tabs.List, ($$anchor, Tabs_List) => {
				Tabs_List($$anchor, {
					class: 'justify-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
							Tabs_Indicator($$anchor, {});
						});

						var node_4 = $.sibling(node_3, 2);

						$.each(node_4, 16, () => colorSelection, (color) => color, ($$anchor, color) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									get value() {
										return color.value;
									},

									get class() {
										return `aspect-square w-13 flex justify-center items-center ${color.class ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										{
											const children = ($$anchor, tabs = $.noop) => {
												var fragment_4 = $.comment();
												var node_7 = $.first_child(fragment_4);

												{
													var consequent = ($$anchor) => {
														PencilIcon($$anchor, { size: 20 });
													};

													var d = $.derived(() => tabs()().value === color.value);

													$.if(node_7, ($$render) => {
														if ($.get(d)) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_4);
											};

											$.component(node_6, () => Tabs.Context, ($$anchor, Tabs_Context) => {
												Tabs_Context($$anchor, { children, $$slots: { default: true } });
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_2, 2);

			$.each(node_8, 16, () => colorSelection, (color) => color, ($$anchor, color) => {
				var fragment_6 = $.comment();
				var node_9 = $.first_child(fragment_6);

				$.component(node_9, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						get value() {
							return color.value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_10 = $.first_child(fragment_7);

							{
								var consequent_2 = ($$anchor) => {
									const activeColorLabel = $.derived(() => colorSelection.find((c) => c.value === globals.activeColor)?.label);
									var div_1 = root_5();
									var div_2 = $.child(div_1);
									var h3 = $.child(div_2);
									var text = $.only_child(h3, true);
									var button_1 = $.sibling(h3, 2);
									var node_11 = $.child(button_1);

									SproutIcon(node_11, { size: 14 });
									$.next(2);
									$.reset(button_1);

									var button_2 = $.sibling(button_1, 2);
									var node_12 = $.child(button_2);

									DicesIcon(node_12, { size: 14 });
									$.next(2);
									$.reset(button_2);
									$.reset(div_2);

									var node_13 = $.sibling(div_2, 2);

									{
										let $0 = $.derived(() => $.get(showAllShades) ? 'all-stops' : 'three-stops');

										Tabs(node_13, {
											get value() {
												return $.get($0);
											},
											onValueChange: (e) => $.set(showAllShades, e.value === 'all-stops'),
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_14 = $.first_child(fragment_8);

												$.component(node_14, () => Tabs.List, ($$anchor, Tabs_List_1) => {
													Tabs_List_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_1();
															var node_15 = $.first_child(fragment_9);

															$.component(node_15, () => Tabs.Indicator, ($$anchor, Tabs_Indicator_1) => {
																Tabs_Indicator_1($$anchor, {});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
																Tabs_Trigger_1($$anchor, {
																	value: 'three-stops',
																	class: 'flex-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Three Stops');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
																Tabs_Trigger_2($$anchor, {
																	value: 'all-stops',
																	class: 'flex-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('All Stops');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									}

									var div_3 = $.sibling(node_13, 2);
									var node_18 = $.child(div_3);

									{
										var consequent_1 = ($$anchor) => {
											var p = root_2();

											$.append($$anchor, p);
										};

										var alternate = ($$anchor) => {
											var p_1 = root_3();

											$.append($$anchor, p_1);
										};

										$.if(node_18, ($$render) => {
											if ($.get(showAllShades)) $$render(consequent_1); else $$render(alternate, -1);
										});
									}

									$.reset(div_3);

									var table = $.sibling(div_3, 2);
									var tbody = $.child(table);

									$.each(tbody, 21, () => $.get(rxShadeArray), $.index, ($$anchor, shade) => {
										var tr = root_4();
										var td = $.child(tr);
										var text_3 = $.only_child(td, true);
										var td_1 = $.sibling(td);
										var input = $.child(td_1);

										$.remove_input_defaults(input);
										$.reset(td_1);

										var td_2 = $.sibling(td_1);
										var input_1 = $.child(td_2);

										$.remove_input_defaults(input_1);
										$.reset(td_2);
										$.reset(tr);
										$.template_effect(() => $.set_text(text_3, $.get(shade)));
										$.event('blur', input, () => genColorRamp($.get(showAllShades), color.value));
										$.bind_value(input, () => settingsColors[getColorKey(color.value, $.get(shade).toString())], ($$value) => settingsColors[getColorKey(color.value, $.get(shade).toString())] = $$value);
										$.delegated('input', input_1, () => genColorRamp($.get(showAllShades), color.value));
										$.bind_value(input_1, () => settingsColors[getColorKey(color.value, $.get(shade).toString())], ($$value) => settingsColors[getColorKey(color.value, $.get(shade).toString())] = $$value);
										$.append($$anchor, tr);
									});

									$.reset(tbody);
									$.reset(table);

									var node_19 = $.sibling(table, 2);

									ControlsColorsContrast(node_19, {
										get colorValue() {
											return color.value;
										}
									});

									$.reset(div_1);
									$.template_effect(() => $.set_text(text, $.get(activeColorLabel)));
									$.delegated('click', button_1, () => promptColorSeed(color.value));
									$.delegated('click', button_2, () => promptRandomColor(color.value));
									$.append($$anchor, div_1);
								};

								$.if(node_10, ($$render) => {
									if (color.value === globals.activeColor) $$render(consequent_2);
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.delegated('click', button, onClearPalette);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);