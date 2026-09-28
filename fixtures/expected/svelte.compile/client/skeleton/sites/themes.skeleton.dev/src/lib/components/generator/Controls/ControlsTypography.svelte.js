import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as constants from '$lib/constants/generator';
import { settingsCustomFonts, settingsTypography } from '$lib/state/generator.svelte';

import {
	customFontOptionValue,
	fetchFontsourceFont,
	parseFontsourceId
} from '$lib/utils/generator/fonts';

import { Tabs } from '@skeletonlabs/skeleton-svelte';
import chroma from 'chroma-js';

var root = $.from_html(`<button type="button"><strong class="text-[16px]"> </strong> <strong class="text-[10px] opacity-50"> </strong></button>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<option> </option>`);
var root_3 = $.from_html(`<select class="select"></select>`);
var root_4 = $.from_html(`<p class="mb-5 opacity-60">Set global defaults for text colors and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>Black</option><!></select> <!></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>White</option><!></select> <!></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> <select class="select" name="--typo-base--font-family"><!><!><!></select></label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Size</span> <select class="select" name="--typo-base--font-size"></select></label> <label class="label"><span class="label-text">Line Height</span> <select class="select" name="--typo-base--line-height"></select></label> <label class="label"><span class="label-text">Font Weight</span> <select class="select" name="--typo-base--font-weight"></select></label> <label class="label"><span class="label-text">Font Style</span> <select class="select" name="--typo-base--font-style"></select></label> <label class="label"><span class="label-text">Letter Spacing</span> <select class="select" name="--typo-base--letter-spacing"></select></label> <label class="label"><span class="label-text">Word Spacing</span> <select class="select" name="--typo-base--word-spacing"></select></label> <label class="label"><span class="label-text">Font Stretch</span> <select class="select" name="--typo-base--font-stretch"></select></label> <label class="label"><span class="label-text">Font Kerning</span> <select class="select" name="--typo-base--font-kerning"></select></label> <label class="label"><span class="label-text">Hyphens</span> <select class="select" name="--typo-base--hyphens"></select></label> <label class="label"><span class="label-text">Text Transform</span> <select class="select" name="--typo-base--text-transform"></select></label> <label class="label"><span class="label-text">Text Shadow</span> <select class="select" name="--typo-base--text-shadow"></select></label></div>`, 1);
var root_5 = $.from_html(`<p class="mb-5 opacity-60">Adjust headings (H1-H6) text color and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>inherit</option><option>Black</option><!></select> <!></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>inherit</option><option>White</option><!></select> <!></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> <select class="select" name="--typo-heading--font-family"><!><!><!></select></label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Weight</span> <select class="select" name="--typo-heading--font-weight"></select></label> <label class="label"><span class="label-text">Font Style</span> <select class="select" name="--typo-heading--font-style"></select></label> <label class="label"><span class="label-text">Letter Spacing</span> <select class="select" name="--typo-heading--letter-spacing"></select></label> <label class="label"><span class="label-text">Word Spacing</span> <select class="select" name="--typo-heading--word-spacing"></select></label> <label class="label"><span class="label-text">Font Stretch</span> <select class="select" name="--typo-heading--font-stretch"></select></label> <label class="label"><span class="label-text">Font Kerning</span> <select class="select" name="--typo-heading--font-kerning"></select></label> <label class="label"><span class="label-text">Hyphens</span> <select class="select" name="--typo-heading--hyphens"></select></label> <label class="label"><span class="label-text">Text Transform</span> <select class="select" name="--typo-heading--text-transform"></select></label> <label class="label"><span class="label-text">Text Shadow</span> <select class="select" name="--typo-heading--text-shadow"></select></label></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="grid grid-cols-2 gap-4"><label class="label"><span class="label-text">Line</span> <select class="select"></select></label> <label class="label"><span class="label-text">Color</span> <select class="select"><option>inherit</option><!></select> <!></label> <label class="label"><span class="label-text">Style</span> <select class="select"></select></label> <label class="label"><span class="label-text">Thickness</span> <select class="select"></select></label> <label class="label"><span class="label-text">Underline Offset</span> <select class="select"></select></label> <label class="label"><span class="label-text">Underline Position</span> <select class="select"></select></label></div>`);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<p class="mb-5 opacity-60">Adjust anchor link text color and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>inherit</option><!></select> <!></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>inherit</option><!></select> <!></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> <select class="select" name="--typo-anchor--font-family"><!><!><!></select></label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Size</span> <select class="select" name="--typo-anchor--font-size"></select></label> <label class="label"><span class="label-text">Line Height</span> <select class="select" name="--typo-anchor--line-height"></select></label> <label class="label"><span class="label-text">Font Weight</span> <select class="select" name="--typo-anchor--font-weight"></select></label> <label class="label"><span class="label-text">Font Style</span> <select class="select" name="--typo-anchor--font-style"></select></label> <label class="label"><span class="label-text">Letter Spacing</span> <select class="select" name="--typo-anchor--letter-spacing"></select></label> <label class="label"><span class="label-text">Word Spacing</span> <select class="select" name="--typo-anchor--word-spacing"></select></label> <label class="label"><span class="label-text">Font Stretch</span> <select class="select" name="--typo-anchor--font-stretch"></select></label> <label class="label"><span class="label-text">Font Kerning</span> <select class="select" name="--typo-anchor--font-kerning"></select></label> <label class="label"><span class="label-text">Hyphens</span> <select class="select" name="--typo-anchor--hyphens"></select></label> <label class="label"><span class="label-text">Text Transform</span> <select class="select" name="--typo-anchor--text-transform"></select></label> <label class="label"><span class="label-text">Text Shadow</span> <select class="select" name="--typo-anchor--text-shadow"></select></label></div> <div class="mt-8 space-y-4"><h2 class="h5">Anchor Decoration</h2> <!></div>`, 1);
var root_10 = $.from_html(`<div class="space-y-4"><section class="space-y-4"><header class="flex justify-between items-center gap-4"><div class="flex items-center gap-2"><h3 class="h5">Custom Fonts</h3> <span class="badge preset-filled-primary-500">Beta</span></div> <a class="btn btn-xs preset-tonal" href="https://skeleton.dev/docs/svelte/design/themes#custom-fonts" target="_blank">View Docs</a></header> <p class="opacity-60">Import custom fonts to preview via <a href="https://fontsource.org/" target="_blank" class="underline">Fontsource</a>.</p> <div class="grid grid-cols-2 gap-4"><div class="label space-y-2"><span class="label-text">Custom Font 1</span> <button type="button"> </button></div> <div class="label space-y-2"><span class="label-text">Custom Font 2</span> <button type="button"> </button></div></div></section> <section class="space-y-4"><header class="flex justify-between items-center gap-4"><h3 class="h5">Typographic Scale</h3> <a class="btn btn-xs preset-tonal" href="https://designcode.io/typographic-scales" target="_blank">View Docs</a></header> <div class="grid grid-cols-3 preset-outlined-surface-200-800 rounded-container overflow-hidden divide-x divide-y divide-surface-200-800"></div></section> <h3 class="h5">Typographic Feature</h3> <!></div>`);

export default function ControlsTypography($$anchor, $$props) {
	$.push($$props, true);

	// Constants
	// State
	const WHITE = 'oklch(1 0 0 / 1)';

	const BLACK = 'oklch(0 0 0 / 1)';

	// Local
	let category = $.state('base');

	let decorationState = $.state('default');
	const decorationStates = ['default', 'hover', 'active', 'focus'];

	/** Builds a `--typo-anchor--[state--]{suffix}` key for the current decoration state. */
	function anchorDecorationKey(state, suffix) {
		const infix = state === 'default' ? '' : `${state}--`;

		return `--typo-anchor--${infix}${suffix}`;
	}

	/**
	 * Parses a `var(--color-{name}-{shade})` reference back into its parts, or detects `inherit` /
	 * a literal pure black/white (imported themes may carry these as hex/oklch rather than a palette var).
	 */
	function parseColorRef(value, specialHex, specialName, fallbackShade) {
		if (value === 'inherit') return { name: 'inherit', shade: fallbackShade };
		if (specialHex && chroma.valid(value) && chroma(value).hex() === specialHex) return { name: specialName, shade: fallbackShade };

		const match = value.match(/^var\(--color-([a-z]+)-(\d+)\)$/);

		return match
			? { name: match[1], shade: match[2] }
			: { name: 'surface', shade: fallbackShade };
	}

	const initialBaseLight = parseColorRef(settingsTypography['--typo-base--color-light'], '#000000', 'black', '950');
	const initialBaseDark = parseColorRef(settingsTypography['--typo-base--color-dark'], '#ffffff', 'white', '50');
	const initialHeadingLight = parseColorRef(settingsTypography['--typo-heading--color-light'], '#000000', 'black', '950');
	const initialHeadingDark = parseColorRef(settingsTypography['--typo-heading--color-dark'], '#ffffff', 'white', '50');
	const initialAnchorLight = parseColorRef(settingsTypography['--typo-anchor--color-light'], null, '', '500');
	const initialAnchorDark = parseColorRef(settingsTypography['--typo-anchor--color-dark'], null, '', '500');
	let baseLightColorName = $.state($.proxy(initialBaseLight.name));
	let baseLightShade = $.state($.proxy(initialBaseLight.shade));
	let baseDarkColorName = $.state($.proxy(initialBaseDark.name));
	let baseDarkShade = $.state($.proxy(initialBaseDark.shade));
	let headingLightColorName = $.state($.proxy(initialHeadingLight.name));
	let headingLightShade = $.state($.proxy(initialHeadingLight.shade));
	let headingDarkColorName = $.state($.proxy(initialHeadingDark.name));
	let headingDarkShade = $.state($.proxy(initialHeadingDark.shade));
	let anchorLightColorName = $.state($.proxy(initialAnchorLight.name));
	let anchorLightShade = $.state($.proxy(initialAnchorLight.shade));
	let anchorDarkColorName = $.state($.proxy(initialAnchorDark.name));
	let anchorDarkShade = $.state($.proxy(initialAnchorDark.shade));

	const initialDecorationColor = Object.fromEntries(decorationStates.map((state) => [
		state,
		parseColorRef(settingsTypography[anchorDecorationKey(state, 'text-decoration-color')], null, '', '500')
	]));

	let decorationColorName = $.proxy(Object.fromEntries(decorationStates.map((state) => [state, initialDecorationColor[state].name])));
	let decorationColorShade = $.proxy(Object.fromEntries(decorationStates.map((state) => [state, initialDecorationColor[state].shade])));

	$.user_effect(() => {
		settingsTypography['--typo-base--color-light'] = $.get(baseLightColorName) === 'black'
			? BLACK
			: `var(--color-${$.get(baseLightColorName)}-${$.get(baseLightShade)})`;
	});

	$.user_effect(() => {
		settingsTypography['--typo-base--color-dark'] = $.get(baseDarkColorName) === 'white'
			? WHITE
			: `var(--color-${$.get(baseDarkColorName)}-${$.get(baseDarkShade)})`;
	});

	$.user_effect(() => {
		settingsTypography['--typo-heading--color-light'] = $.get(headingLightColorName) === 'inherit'
			? 'inherit'
			: $.get(headingLightColorName) === 'black'
				? BLACK
				: `var(--color-${$.get(headingLightColorName)}-${$.get(headingLightShade)})`;
	});

	$.user_effect(() => {
		settingsTypography['--typo-heading--color-dark'] = $.get(headingDarkColorName) === 'inherit'
			? 'inherit'
			: $.get(headingDarkColorName) === 'white'
				? WHITE
				: `var(--color-${$.get(headingDarkColorName)}-${$.get(headingDarkShade)})`;
	});

	$.user_effect(() => {
		settingsTypography['--typo-anchor--color-light'] = $.get(anchorLightColorName) === 'inherit'
			? 'inherit'
			: `var(--color-${$.get(anchorLightColorName)}-${$.get(anchorLightShade)})`;
	});

	$.user_effect(() => {
		settingsTypography['--typo-anchor--color-dark'] = $.get(anchorDarkColorName) === 'inherit'
			? 'inherit'
			: `var(--color-${$.get(anchorDarkColorName)}-${$.get(anchorDarkShade)})`;
	});

	$.user_effect(() => {
		for (const state of decorationStates) {
			settingsTypography[anchorDecorationKey(state, 'text-decoration-color')] = decorationColorName[state] === 'inherit'
				? 'inherit'
				: `var(--color-${decorationColorName[state]}-${decorationColorShade[state]})`;
		}
	});

	async function promptCustomFont(slot) {
		const input = prompt('Fontsource URL (ex: https://fontsource.org/fonts/poppins)');

		if (!input) return;

		try {
			const font = await fetchFontsourceFont(parseFontsourceId(input));

			settingsCustomFonts[slot] = font;
			settingsTypography[slot === 'font1' ? '--font-custom-1' : '--font-custom-2'] = customFontOptionValue(font);
		} catch(err) {
			alert(err instanceof Error ? err.message : 'Failed to load font from Fontsource.');
		}
	}

	var div = root_10();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 4);
	var div_2 = $.child(div_1);
	var button = $.sibling($.child(div_2), 2);
	var text = $.only_child(button, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var button_1 = $.sibling($.child(div_3), 2);
	var text_1 = $.only_child(button_1, true);

	$.reset(div_3);
	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.sibling($.child(section_1), 2);

	$.each(div_4, 20, () => constants.typographicScales, (typographicScale) => typographicScale, ($$anchor, typographicScale) => {
		var button_2 = root();
		var strong = $.child(button_2);
		var text_2 = $.only_child(strong, true);
		var strong_1 = $.sibling(strong, 2);
		var text_3 = $.only_child(strong_1, true);

		$.reset(button_2);

		$.template_effect(() => {
			$.set_class(button_2, 1, `flex flex-col items-center py-2 ${settingsTypography['--text-scaling'] === typographicScale.value ? 'preset-filled' : 'hover:preset-tonal-primary'}`);
			$.set_text(text_2, typographicScale.value);
			$.set_text(text_3, typographicScale.label);
		});

		$.delegated('click', button_2, () => settingsTypography['--text-scaling'] = typographicScale.value);
		$.append($$anchor, button_2);
	});

	$.reset(div_4);
	$.reset(section_1);

	var node = $.sibling(section_1, 4);

	Tabs(node, {
		get value() {
			return $.get(category);
		},
		onValueChange: (e) => $.set(category, e.value, true),
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
				Tabs_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
							Tabs_Indicator($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
							Tabs_Trigger($$anchor, {
								class: 'flex-1',
								value: 'base',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Base');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
							Tabs_Trigger_1($$anchor, {
								class: 'flex-1',
								value: 'headings',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Headings');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
							Tabs_Trigger_2($$anchor, {
								class: 'flex-1',
								value: 'anchors',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Anchors');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_1, 2);

			$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content) => {
				Tabs_Content($$anchor, {
					value: 'base',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var div_5 = $.sibling($.first_child(fragment_2), 2);
						var label = $.child(div_5);
						var div_6 = $.sibling($.child(label), 2);
						let styles;
						var select = $.sibling(div_6, 2);
						var option = $.child(select);

						option.value = option.__value = 'black';

						var node_7 = $.sibling(option);

						$.each(node_7, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_1 = root_2();
							var text_7 = $.only_child(option_1, true);
							var option_1_value = {};

							$.template_effect(() => {
								$.set_text(text_7, $.get(colorName));

								if (option_1_value !== (option_1_value = $.get(colorName))) {
									option_1.value = (option_1.__value = option_1_value) ?? '';
								}
							});

							$.append($$anchor, option_1);
						});

						$.reset(select);
						$.init_select(select);

						var node_8 = $.sibling(select, 2);

						{
							var consequent = ($$anchor) => {
								var select_1 = root_3();

								$.each(select_1, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_2 = root_2();
									var text_8 = $.only_child(option_2, true);
									var option_2_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_8, $.get(colorShade));

											if (option_2_value !== (option_2_value = $0)) {
												option_2.value = (option_2.__value = option_2_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_2);
								});

								$.reset(select_1);
								$.init_select(select_1);
								$.bind_select_value(select_1, () => $.get(baseLightShade), ($$value) => $.set(baseLightShade, $$value));
								$.append($$anchor, select_1);
							};

							$.if(node_8, ($$render) => {
								if ($.get(baseLightColorName) !== 'black') $$render(consequent);
							});
						}

						$.reset(label);

						var label_1 = $.sibling(label, 2);
						var div_7 = $.sibling($.child(label_1), 2);
						let styles_1;
						var select_2 = $.sibling(div_7, 2);
						var option_3 = $.child(select_2);

						option_3.value = option_3.__value = 'white';

						var node_9 = $.sibling(option_3);

						$.each(node_9, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_4 = root_2();
							var text_9 = $.only_child(option_4, true);
							var option_4_value = {};

							$.template_effect(() => {
								$.set_text(text_9, $.get(colorName));

								if (option_4_value !== (option_4_value = $.get(colorName))) {
									option_4.value = (option_4.__value = option_4_value) ?? '';
								}
							});

							$.append($$anchor, option_4);
						});

						$.reset(select_2);
						$.init_select(select_2);

						var node_10 = $.sibling(select_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var select_3 = root_3();

								$.each(select_3, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_5 = root_2();
									var text_10 = $.only_child(option_5, true);
									var option_5_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_10, $.get(colorShade));

											if (option_5_value !== (option_5_value = $0)) {
												option_5.value = (option_5.__value = option_5_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_5);
								});

								$.reset(select_3);
								$.init_select(select_3);
								$.bind_select_value(select_3, () => $.get(baseDarkShade), ($$value) => $.set(baseDarkShade, $$value));
								$.append($$anchor, select_3);
							};

							$.if(node_10, ($$render) => {
								if ($.get(baseDarkColorName) !== 'white') $$render(consequent_1);
							});
						}

						$.reset(label_1);

						var label_2 = $.sibling(label_1, 4);
						var select_4 = $.sibling($.child(label_2), 2);
						var node_11 = $.child(select_4);

						$.each(node_11, 17, () => constants.fontFamilies, $.index, ($$anchor, fontFamily) => {
							var option_6 = root_2();
							var text_11 = $.only_child(option_6, true);
							var option_6_value = {};

							$.template_effect(() => {
								$.set_text(text_11, $.get(fontFamily));

								if (option_6_value !== (option_6_value = $.get(fontFamily))) {
									option_6.value = (option_6.__value = option_6_value) ?? '';
								}
							});

							$.append($$anchor, option_6);
						});

						var node_12 = $.sibling(node_11);

						{
							var consequent_2 = ($$anchor) => {
								var option_7 = root_2();
								var text_12 = $.only_child(option_7, true);

								option_7.value = option_7.__value = 'var(--font-custom-1)';
								$.template_effect(() => $.set_text(text_12, settingsCustomFonts.font1.family));
								$.append($$anchor, option_7);
							};

							$.if(node_12, ($$render) => {
								if (settingsCustomFonts.font1) $$render(consequent_2);
							});
						}

						var node_13 = $.sibling(node_12);

						{
							var consequent_3 = ($$anchor) => {
								var option_8 = root_2();
								var text_13 = $.only_child(option_8, true);

								option_8.value = option_8.__value = 'var(--font-custom-2)';
								$.template_effect(() => $.set_text(text_13, settingsCustomFonts.font2.family));
								$.append($$anchor, option_8);
							};

							$.if(node_13, ($$render) => {
								if (settingsCustomFonts.font2) $$render(consequent_3);
							});
						}

						$.reset(select_4);
						$.init_select(select_4);
						$.reset(label_2);

						var label_3 = $.sibling(label_2, 4);
						var select_5 = $.sibling($.child(label_3), 2);

						$.each(select_5, 21, () => constants.fontSizes, $.index, ($$anchor, fontSize) => {
							var option_9 = root_2();
							var text_14 = $.only_child(option_9, true);
							var option_9_value = {};

							$.template_effect(() => {
								$.set_text(text_14, $.get(fontSize));

								if (option_9_value !== (option_9_value = $.get(fontSize))) {
									option_9.value = (option_9.__value = option_9_value) ?? '';
								}
							});

							$.append($$anchor, option_9);
						});

						$.reset(select_5);
						$.init_select(select_5);
						$.reset(label_3);

						var label_4 = $.sibling(label_3, 2);
						var select_6 = $.sibling($.child(label_4), 2);

						$.each(select_6, 21, () => constants.lineHeights, $.index, ($$anchor, lineHeight) => {
							var option_10 = root_2();
							var text_15 = $.only_child(option_10, true);
							var option_10_value = {};

							$.template_effect(() => {
								$.set_text(text_15, $.get(lineHeight));

								if (option_10_value !== (option_10_value = $.get(lineHeight))) {
									option_10.value = (option_10.__value = option_10_value) ?? '';
								}
							});

							$.append($$anchor, option_10);
						});

						$.reset(select_6);
						$.init_select(select_6);
						$.reset(label_4);

						var label_5 = $.sibling(label_4, 2);
						var select_7 = $.sibling($.child(label_5), 2);

						$.each(select_7, 21, () => constants.fontWeights, $.index, ($$anchor, fontWeight) => {
							var option_11 = root_2();
							var text_16 = $.only_child(option_11, true);
							var option_11_value = {};

							$.template_effect(() => {
								$.set_text(text_16, $.get(fontWeight));

								if (option_11_value !== (option_11_value = $.get(fontWeight))) {
									option_11.value = (option_11.__value = option_11_value) ?? '';
								}
							});

							$.append($$anchor, option_11);
						});

						$.reset(select_7);
						$.init_select(select_7);
						$.reset(label_5);

						var label_6 = $.sibling(label_5, 2);
						var select_8 = $.sibling($.child(label_6), 2);

						$.each(select_8, 21, () => constants.fontStyles, $.index, ($$anchor, fontStyle) => {
							var option_12 = root_2();
							var text_17 = $.only_child(option_12, true);
							var option_12_value = {};

							$.template_effect(() => {
								$.set_text(text_17, $.get(fontStyle));

								if (option_12_value !== (option_12_value = $.get(fontStyle))) {
									option_12.value = (option_12.__value = option_12_value) ?? '';
								}
							});

							$.append($$anchor, option_12);
						});

						$.reset(select_8);
						$.init_select(select_8);
						$.reset(label_6);

						var label_7 = $.sibling(label_6, 2);
						var select_9 = $.sibling($.child(label_7), 2);

						$.each(select_9, 21, () => constants.letterSpacings, $.index, ($$anchor, letterSpacing) => {
							var option_13 = root_2();
							var text_18 = $.only_child(option_13, true);
							var option_13_value = {};

							$.template_effect(() => {
								$.set_text(text_18, $.get(letterSpacing));

								if (option_13_value !== (option_13_value = $.get(letterSpacing))) {
									option_13.value = (option_13.__value = option_13_value) ?? '';
								}
							});

							$.append($$anchor, option_13);
						});

						$.reset(select_9);
						$.init_select(select_9);
						$.reset(label_7);

						var label_8 = $.sibling(label_7, 2);
						var select_10 = $.sibling($.child(label_8), 2);

						$.each(select_10, 21, () => constants.wordSpacings, $.index, ($$anchor, wordSpacing) => {
							var option_14 = root_2();
							var text_19 = $.only_child(option_14, true);
							var option_14_value = {};

							$.template_effect(() => {
								$.set_text(text_19, $.get(wordSpacing));

								if (option_14_value !== (option_14_value = $.get(wordSpacing))) {
									option_14.value = (option_14.__value = option_14_value) ?? '';
								}
							});

							$.append($$anchor, option_14);
						});

						$.reset(select_10);
						$.init_select(select_10);
						$.reset(label_8);

						var label_9 = $.sibling(label_8, 2);
						var select_11 = $.sibling($.child(label_9), 2);

						$.each(select_11, 21, () => constants.fontStretches, $.index, ($$anchor, fontStretch) => {
							var option_15 = root_2();
							var text_20 = $.only_child(option_15, true);
							var option_15_value = {};

							$.template_effect(() => {
								$.set_text(text_20, $.get(fontStretch));

								if (option_15_value !== (option_15_value = $.get(fontStretch))) {
									option_15.value = (option_15.__value = option_15_value) ?? '';
								}
							});

							$.append($$anchor, option_15);
						});

						$.reset(select_11);
						$.init_select(select_11);
						$.reset(label_9);

						var label_10 = $.sibling(label_9, 2);
						var select_12 = $.sibling($.child(label_10), 2);

						$.each(select_12, 21, () => constants.fontKernings, $.index, ($$anchor, fontKerning) => {
							var option_16 = root_2();
							var text_21 = $.only_child(option_16, true);
							var option_16_value = {};

							$.template_effect(() => {
								$.set_text(text_21, $.get(fontKerning));

								if (option_16_value !== (option_16_value = $.get(fontKerning))) {
									option_16.value = (option_16.__value = option_16_value) ?? '';
								}
							});

							$.append($$anchor, option_16);
						});

						$.reset(select_12);
						$.init_select(select_12);
						$.reset(label_10);

						var label_11 = $.sibling(label_10, 2);
						var select_13 = $.sibling($.child(label_11), 2);

						$.each(select_13, 21, () => constants.hyphensOptions, $.index, ($$anchor, hyphensOption) => {
							var option_17 = root_2();
							var text_22 = $.only_child(option_17, true);
							var option_17_value = {};

							$.template_effect(() => {
								$.set_text(text_22, $.get(hyphensOption));

								if (option_17_value !== (option_17_value = $.get(hyphensOption))) {
									option_17.value = (option_17.__value = option_17_value) ?? '';
								}
							});

							$.append($$anchor, option_17);
						});

						$.reset(select_13);
						$.init_select(select_13);
						$.reset(label_11);

						var label_12 = $.sibling(label_11, 2);
						var select_14 = $.sibling($.child(label_12), 2);

						$.each(select_14, 21, () => constants.textTransforms, $.index, ($$anchor, textTransform) => {
							var option_18 = root_2();
							var text_23 = $.only_child(option_18, true);
							var option_18_value = {};

							$.template_effect(() => {
								$.set_text(text_23, $.get(textTransform));

								if (option_18_value !== (option_18_value = $.get(textTransform))) {
									option_18.value = (option_18.__value = option_18_value) ?? '';
								}
							});

							$.append($$anchor, option_18);
						});

						$.reset(select_14);
						$.init_select(select_14);
						$.reset(label_12);

						var label_13 = $.sibling(label_12, 2);
						var select_15 = $.sibling($.child(label_13), 2);

						$.each(select_15, 21, () => constants.textShadows, $.index, ($$anchor, textShadow) => {
							var option_19 = root_2();
							var text_24 = $.only_child(option_19, true);
							var option_19_value = {};

							$.template_effect(() => {
								$.set_text(text_24, $.get(textShadow));

								if (option_19_value !== (option_19_value = $.get(textShadow))) {
									option_19.value = (option_19.__value = option_19_value) ?? '';
								}
							});

							$.append($$anchor, option_19);
						});

						$.reset(select_15);
						$.init_select(select_15);
						$.reset(label_13);
						$.reset(div_5);

						$.template_effect(() => {
							styles = $.set_style(div_6, '', styles, {
								background: `${settingsTypography['--typo-base--color-light']}`
							});

							styles_1 = $.set_style(div_7, '', styles_1, {
								background: `${settingsTypography['--typo-base--color-dark']}`
							});
						});

						$.bind_select_value(select, () => $.get(baseLightColorName), ($$value) => $.set(baseLightColorName, $$value));
						$.bind_select_value(select_2, () => $.get(baseDarkColorName), ($$value) => $.set(baseDarkColorName, $$value));
						$.bind_select_value(select_4, () => settingsTypography['--typo-base--font-family'], ($$value) => settingsTypography['--typo-base--font-family'] = $$value);
						$.bind_select_value(select_5, () => settingsTypography['--typo-base--font-size'], ($$value) => settingsTypography['--typo-base--font-size'] = $$value);
						$.bind_select_value(select_6, () => settingsTypography['--typo-base--line-height'], ($$value) => settingsTypography['--typo-base--line-height'] = $$value);
						$.bind_select_value(select_7, () => settingsTypography['--typo-base--font-weight'], ($$value) => settingsTypography['--typo-base--font-weight'] = $$value);
						$.bind_select_value(select_8, () => settingsTypography['--typo-base--font-style'], ($$value) => settingsTypography['--typo-base--font-style'] = $$value);
						$.bind_select_value(select_9, () => settingsTypography['--typo-base--letter-spacing'], ($$value) => settingsTypography['--typo-base--letter-spacing'] = $$value);
						$.bind_select_value(select_10, () => settingsTypography['--typo-base--word-spacing'], ($$value) => settingsTypography['--typo-base--word-spacing'] = $$value);
						$.bind_select_value(select_11, () => settingsTypography['--typo-base--font-stretch'], ($$value) => settingsTypography['--typo-base--font-stretch'] = $$value);
						$.bind_select_value(select_12, () => settingsTypography['--typo-base--font-kerning'], ($$value) => settingsTypography['--typo-base--font-kerning'] = $$value);
						$.bind_select_value(select_13, () => settingsTypography['--typo-base--hyphens'], ($$value) => settingsTypography['--typo-base--hyphens'] = $$value);
						$.bind_select_value(select_14, () => settingsTypography['--typo-base--text-transform'], ($$value) => settingsTypography['--typo-base--text-transform'] = $$value);
						$.bind_select_value(select_15, () => settingsTypography['--typo-base--text-shadow'], ($$value) => settingsTypography['--typo-base--text-shadow'] = $$value);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_6, 2);

			$.component(node_14, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
				Tabs_Content_1($$anchor, {
					value: 'headings',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_5();
						var div_8 = $.sibling($.first_child(fragment_3), 2);
						var label_14 = $.child(div_8);
						var div_9 = $.sibling($.child(label_14), 2);
						let styles_2;
						var select_16 = $.sibling(div_9, 2);
						var option_20 = $.child(select_16);

						option_20.value = option_20.__value = 'inherit';

						var option_21 = $.sibling(option_20);

						option_21.value = option_21.__value = 'black';

						var node_15 = $.sibling(option_21);

						$.each(node_15, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_22 = root_2();
							var text_25 = $.only_child(option_22, true);
							var option_22_value = {};

							$.template_effect(() => {
								$.set_text(text_25, $.get(colorName));

								if (option_22_value !== (option_22_value = $.get(colorName))) {
									option_22.value = (option_22.__value = option_22_value) ?? '';
								}
							});

							$.append($$anchor, option_22);
						});

						$.reset(select_16);
						$.init_select(select_16);

						var node_16 = $.sibling(select_16, 2);

						{
							var consequent_4 = ($$anchor) => {
								var select_17 = root_3();

								$.each(select_17, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_23 = root_2();
									var text_26 = $.only_child(option_23, true);
									var option_23_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_26, $.get(colorShade));

											if (option_23_value !== (option_23_value = $0)) {
												option_23.value = (option_23.__value = option_23_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_23);
								});

								$.reset(select_17);
								$.init_select(select_17);
								$.bind_select_value(select_17, () => $.get(headingLightShade), ($$value) => $.set(headingLightShade, $$value));
								$.append($$anchor, select_17);
							};

							$.if(node_16, ($$render) => {
								if ($.get(headingLightColorName) !== 'inherit' && $.get(headingLightColorName) !== 'black') $$render(consequent_4);
							});
						}

						$.reset(label_14);

						var label_15 = $.sibling(label_14, 2);
						var div_10 = $.sibling($.child(label_15), 2);
						let styles_3;
						var select_18 = $.sibling(div_10, 2);
						var option_24 = $.child(select_18);

						option_24.value = option_24.__value = 'inherit';

						var option_25 = $.sibling(option_24);

						option_25.value = option_25.__value = 'white';

						var node_17 = $.sibling(option_25);

						$.each(node_17, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_26 = root_2();
							var text_27 = $.only_child(option_26, true);
							var option_26_value = {};

							$.template_effect(() => {
								$.set_text(text_27, $.get(colorName));

								if (option_26_value !== (option_26_value = $.get(colorName))) {
									option_26.value = (option_26.__value = option_26_value) ?? '';
								}
							});

							$.append($$anchor, option_26);
						});

						$.reset(select_18);
						$.init_select(select_18);

						var node_18 = $.sibling(select_18, 2);

						{
							var consequent_5 = ($$anchor) => {
								var select_19 = root_3();

								$.each(select_19, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_27 = root_2();
									var text_28 = $.only_child(option_27, true);
									var option_27_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_28, $.get(colorShade));

											if (option_27_value !== (option_27_value = $0)) {
												option_27.value = (option_27.__value = option_27_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_27);
								});

								$.reset(select_19);
								$.init_select(select_19);
								$.bind_select_value(select_19, () => $.get(headingDarkShade), ($$value) => $.set(headingDarkShade, $$value));
								$.append($$anchor, select_19);
							};

							$.if(node_18, ($$render) => {
								if ($.get(headingDarkColorName) !== 'inherit' && $.get(headingDarkColorName) !== 'white') $$render(consequent_5);
							});
						}

						$.reset(label_15);

						var label_16 = $.sibling(label_15, 4);
						var select_20 = $.sibling($.child(label_16), 2);
						var node_19 = $.child(select_20);

						$.each(node_19, 17, () => constants.fontFamilies, $.index, ($$anchor, fontFamily) => {
							var option_28 = root_2();
							var text_29 = $.only_child(option_28, true);
							var option_28_value = {};

							$.template_effect(() => {
								$.set_text(text_29, $.get(fontFamily));

								if (option_28_value !== (option_28_value = $.get(fontFamily))) {
									option_28.value = (option_28.__value = option_28_value) ?? '';
								}
							});

							$.append($$anchor, option_28);
						});

						var node_20 = $.sibling(node_19);

						{
							var consequent_6 = ($$anchor) => {
								var option_29 = root_2();
								var text_30 = $.only_child(option_29, true);

								option_29.value = option_29.__value = 'var(--font-custom-1)';
								$.template_effect(() => $.set_text(text_30, settingsCustomFonts.font1.family));
								$.append($$anchor, option_29);
							};

							$.if(node_20, ($$render) => {
								if (settingsCustomFonts.font1) $$render(consequent_6);
							});
						}

						var node_21 = $.sibling(node_20);

						{
							var consequent_7 = ($$anchor) => {
								var option_30 = root_2();
								var text_31 = $.only_child(option_30, true);

								option_30.value = option_30.__value = 'var(--font-custom-2)';
								$.template_effect(() => $.set_text(text_31, settingsCustomFonts.font2.family));
								$.append($$anchor, option_30);
							};

							$.if(node_21, ($$render) => {
								if (settingsCustomFonts.font2) $$render(consequent_7);
							});
						}

						$.reset(select_20);
						$.init_select(select_20);
						$.reset(label_16);

						var label_17 = $.sibling(label_16, 4);
						var select_21 = $.sibling($.child(label_17), 2);

						$.each(select_21, 21, () => constants.fontWeights, $.index, ($$anchor, fontWeight) => {
							var option_31 = root_2();
							var text_32 = $.only_child(option_31, true);
							var option_31_value = {};

							$.template_effect(() => {
								$.set_text(text_32, $.get(fontWeight));

								if (option_31_value !== (option_31_value = $.get(fontWeight))) {
									option_31.value = (option_31.__value = option_31_value) ?? '';
								}
							});

							$.append($$anchor, option_31);
						});

						$.reset(select_21);
						$.init_select(select_21);
						$.reset(label_17);

						var label_18 = $.sibling(label_17, 2);
						var select_22 = $.sibling($.child(label_18), 2);

						$.each(select_22, 21, () => constants.fontStyles, $.index, ($$anchor, fontStyle) => {
							var option_32 = root_2();
							var text_33 = $.only_child(option_32, true);
							var option_32_value = {};

							$.template_effect(() => {
								$.set_text(text_33, $.get(fontStyle));

								if (option_32_value !== (option_32_value = $.get(fontStyle))) {
									option_32.value = (option_32.__value = option_32_value) ?? '';
								}
							});

							$.append($$anchor, option_32);
						});

						$.reset(select_22);
						$.init_select(select_22);
						$.reset(label_18);

						var label_19 = $.sibling(label_18, 2);
						var select_23 = $.sibling($.child(label_19), 2);

						$.each(select_23, 21, () => constants.letterSpacings, $.index, ($$anchor, letterSpacing) => {
							var option_33 = root_2();
							var text_34 = $.only_child(option_33, true);
							var option_33_value = {};

							$.template_effect(() => {
								$.set_text(text_34, $.get(letterSpacing));

								if (option_33_value !== (option_33_value = $.get(letterSpacing))) {
									option_33.value = (option_33.__value = option_33_value) ?? '';
								}
							});

							$.append($$anchor, option_33);
						});

						$.reset(select_23);
						$.init_select(select_23);
						$.reset(label_19);

						var label_20 = $.sibling(label_19, 2);
						var select_24 = $.sibling($.child(label_20), 2);

						$.each(select_24, 21, () => constants.wordSpacings, $.index, ($$anchor, wordSpacing) => {
							var option_34 = root_2();
							var text_35 = $.only_child(option_34, true);
							var option_34_value = {};

							$.template_effect(() => {
								$.set_text(text_35, $.get(wordSpacing));

								if (option_34_value !== (option_34_value = $.get(wordSpacing))) {
									option_34.value = (option_34.__value = option_34_value) ?? '';
								}
							});

							$.append($$anchor, option_34);
						});

						$.reset(select_24);
						$.init_select(select_24);
						$.reset(label_20);

						var label_21 = $.sibling(label_20, 2);
						var select_25 = $.sibling($.child(label_21), 2);

						$.each(select_25, 21, () => constants.fontStretches, $.index, ($$anchor, fontStretch) => {
							var option_35 = root_2();
							var text_36 = $.only_child(option_35, true);
							var option_35_value = {};

							$.template_effect(() => {
								$.set_text(text_36, $.get(fontStretch));

								if (option_35_value !== (option_35_value = $.get(fontStretch))) {
									option_35.value = (option_35.__value = option_35_value) ?? '';
								}
							});

							$.append($$anchor, option_35);
						});

						$.reset(select_25);
						$.init_select(select_25);
						$.reset(label_21);

						var label_22 = $.sibling(label_21, 2);
						var select_26 = $.sibling($.child(label_22), 2);

						$.each(select_26, 21, () => constants.fontKernings, $.index, ($$anchor, fontKerning) => {
							var option_36 = root_2();
							var text_37 = $.only_child(option_36, true);
							var option_36_value = {};

							$.template_effect(() => {
								$.set_text(text_37, $.get(fontKerning));

								if (option_36_value !== (option_36_value = $.get(fontKerning))) {
									option_36.value = (option_36.__value = option_36_value) ?? '';
								}
							});

							$.append($$anchor, option_36);
						});

						$.reset(select_26);
						$.init_select(select_26);
						$.reset(label_22);

						var label_23 = $.sibling(label_22, 2);
						var select_27 = $.sibling($.child(label_23), 2);

						$.each(select_27, 21, () => constants.hyphensOptions, $.index, ($$anchor, hyphensOption) => {
							var option_37 = root_2();
							var text_38 = $.only_child(option_37, true);
							var option_37_value = {};

							$.template_effect(() => {
								$.set_text(text_38, $.get(hyphensOption));

								if (option_37_value !== (option_37_value = $.get(hyphensOption))) {
									option_37.value = (option_37.__value = option_37_value) ?? '';
								}
							});

							$.append($$anchor, option_37);
						});

						$.reset(select_27);
						$.init_select(select_27);
						$.reset(label_23);

						var label_24 = $.sibling(label_23, 2);
						var select_28 = $.sibling($.child(label_24), 2);

						$.each(select_28, 21, () => constants.textTransforms, $.index, ($$anchor, textTransform) => {
							var option_38 = root_2();
							var text_39 = $.only_child(option_38, true);
							var option_38_value = {};

							$.template_effect(() => {
								$.set_text(text_39, $.get(textTransform));

								if (option_38_value !== (option_38_value = $.get(textTransform))) {
									option_38.value = (option_38.__value = option_38_value) ?? '';
								}
							});

							$.append($$anchor, option_38);
						});

						$.reset(select_28);
						$.init_select(select_28);
						$.reset(label_24);

						var label_25 = $.sibling(label_24, 2);
						var select_29 = $.sibling($.child(label_25), 2);

						$.each(select_29, 21, () => constants.textShadows, $.index, ($$anchor, textShadow) => {
							var option_39 = root_2();
							var text_40 = $.only_child(option_39, true);
							var option_39_value = {};

							$.template_effect(() => {
								$.set_text(text_40, $.get(textShadow));

								if (option_39_value !== (option_39_value = $.get(textShadow))) {
									option_39.value = (option_39.__value = option_39_value) ?? '';
								}
							});

							$.append($$anchor, option_39);
						});

						$.reset(select_29);
						$.init_select(select_29);
						$.reset(label_25);
						$.reset(div_8);

						$.template_effect(() => {
							styles_2 = $.set_style(div_9, '', styles_2, {
								background: settingsTypography['--typo-heading--color-light'] === 'inherit'
									? `${settingsTypography['--typo-base--color-light']}`
									: `${settingsTypography['--typo-heading--color-light']}`
							});

							styles_3 = $.set_style(div_10, '', styles_3, {
								background: settingsTypography['--typo-heading--color-dark'] === 'inherit'
									? `${settingsTypography['--typo-base--color-dark']}`
									: `${settingsTypography['--typo-heading--color-dark']}`
							});
						});

						$.bind_select_value(select_16, () => $.get(headingLightColorName), ($$value) => $.set(headingLightColorName, $$value));
						$.bind_select_value(select_18, () => $.get(headingDarkColorName), ($$value) => $.set(headingDarkColorName, $$value));
						$.bind_select_value(select_20, () => settingsTypography['--typo-heading--font-family'], ($$value) => settingsTypography['--typo-heading--font-family'] = $$value);
						$.bind_select_value(select_21, () => settingsTypography['--typo-heading--font-weight'], ($$value) => settingsTypography['--typo-heading--font-weight'] = $$value);
						$.bind_select_value(select_22, () => settingsTypography['--typo-heading--font-style'], ($$value) => settingsTypography['--typo-heading--font-style'] = $$value);
						$.bind_select_value(select_23, () => settingsTypography['--typo-heading--letter-spacing'], ($$value) => settingsTypography['--typo-heading--letter-spacing'] = $$value);
						$.bind_select_value(select_24, () => settingsTypography['--typo-heading--word-spacing'], ($$value) => settingsTypography['--typo-heading--word-spacing'] = $$value);
						$.bind_select_value(select_25, () => settingsTypography['--typo-heading--font-stretch'], ($$value) => settingsTypography['--typo-heading--font-stretch'] = $$value);
						$.bind_select_value(select_26, () => settingsTypography['--typo-heading--font-kerning'], ($$value) => settingsTypography['--typo-heading--font-kerning'] = $$value);
						$.bind_select_value(select_27, () => settingsTypography['--typo-heading--hyphens'], ($$value) => settingsTypography['--typo-heading--hyphens'] = $$value);
						$.bind_select_value(select_28, () => settingsTypography['--typo-heading--text-transform'], ($$value) => settingsTypography['--typo-heading--text-transform'] = $$value);
						$.bind_select_value(select_29, () => settingsTypography['--typo-heading--text-shadow'], ($$value) => settingsTypography['--typo-heading--text-shadow'] = $$value);
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_22 = $.sibling(node_14, 2);

			$.component(node_22, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
				Tabs_Content_2($$anchor, {
					value: 'anchors',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_9();
						var div_11 = $.sibling($.first_child(fragment_4), 2);
						var label_26 = $.child(div_11);
						var div_12 = $.sibling($.child(label_26), 2);
						let styles_4;
						var select_30 = $.sibling(div_12, 2);
						var option_40 = $.child(select_30);

						option_40.value = option_40.__value = 'inherit';

						var node_23 = $.sibling(option_40);

						$.each(node_23, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_41 = root_2();
							var text_41 = $.only_child(option_41, true);
							var option_41_value = {};

							$.template_effect(() => {
								$.set_text(text_41, $.get(colorName));

								if (option_41_value !== (option_41_value = $.get(colorName))) {
									option_41.value = (option_41.__value = option_41_value) ?? '';
								}
							});

							$.append($$anchor, option_41);
						});

						$.reset(select_30);
						$.init_select(select_30);

						var node_24 = $.sibling(select_30, 2);

						{
							var consequent_8 = ($$anchor) => {
								var select_31 = root_3();

								$.each(select_31, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_42 = root_2();
									var text_42 = $.only_child(option_42, true);
									var option_42_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_42, $.get(colorShade));

											if (option_42_value !== (option_42_value = $0)) {
												option_42.value = (option_42.__value = option_42_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_42);
								});

								$.reset(select_31);
								$.init_select(select_31);
								$.bind_select_value(select_31, () => $.get(anchorLightShade), ($$value) => $.set(anchorLightShade, $$value));
								$.append($$anchor, select_31);
							};

							$.if(node_24, ($$render) => {
								if ($.get(anchorLightColorName) !== 'inherit') $$render(consequent_8);
							});
						}

						$.reset(label_26);

						var label_27 = $.sibling(label_26, 2);
						var div_13 = $.sibling($.child(label_27), 2);
						let styles_5;
						var select_32 = $.sibling(div_13, 2);
						var option_43 = $.child(select_32);

						option_43.value = option_43.__value = 'inherit';

						var node_25 = $.sibling(option_43);

						$.each(node_25, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
							var option_44 = root_2();
							var text_43 = $.only_child(option_44, true);
							var option_44_value = {};

							$.template_effect(() => {
								$.set_text(text_43, $.get(colorName));

								if (option_44_value !== (option_44_value = $.get(colorName))) {
									option_44.value = (option_44.__value = option_44_value) ?? '';
								}
							});

							$.append($$anchor, option_44);
						});

						$.reset(select_32);
						$.init_select(select_32);

						var node_26 = $.sibling(select_32, 2);

						{
							var consequent_9 = ($$anchor) => {
								var select_33 = root_3();

								$.each(select_33, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
									var option_45 = root_2();
									var text_44 = $.only_child(option_45, true);
									var option_45_value = {};

									$.template_effect(
										($0) => {
											$.set_text(text_44, $.get(colorShade));

											if (option_45_value !== (option_45_value = $0)) {
												option_45.value = (option_45.__value = option_45_value) ?? '';
											}
										},
										[() => $.get(colorShade).toString()]
									);

									$.append($$anchor, option_45);
								});

								$.reset(select_33);
								$.init_select(select_33);
								$.bind_select_value(select_33, () => $.get(anchorDarkShade), ($$value) => $.set(anchorDarkShade, $$value));
								$.append($$anchor, select_33);
							};

							$.if(node_26, ($$render) => {
								if ($.get(anchorDarkColorName) !== 'inherit') $$render(consequent_9);
							});
						}

						$.reset(label_27);

						var label_28 = $.sibling(label_27, 4);
						var select_34 = $.sibling($.child(label_28), 2);
						var node_27 = $.child(select_34);

						$.each(node_27, 17, () => constants.fontFamilies, $.index, ($$anchor, fontFamily) => {
							var option_46 = root_2();
							var text_45 = $.only_child(option_46, true);
							var option_46_value = {};

							$.template_effect(() => {
								$.set_text(text_45, $.get(fontFamily));

								if (option_46_value !== (option_46_value = $.get(fontFamily))) {
									option_46.value = (option_46.__value = option_46_value) ?? '';
								}
							});

							$.append($$anchor, option_46);
						});

						var node_28 = $.sibling(node_27);

						{
							var consequent_10 = ($$anchor) => {
								var option_47 = root_2();
								var text_46 = $.only_child(option_47, true);

								option_47.value = option_47.__value = 'var(--font-custom-1)';
								$.template_effect(() => $.set_text(text_46, settingsCustomFonts.font1.family));
								$.append($$anchor, option_47);
							};

							$.if(node_28, ($$render) => {
								if (settingsCustomFonts.font1) $$render(consequent_10);
							});
						}

						var node_29 = $.sibling(node_28);

						{
							var consequent_11 = ($$anchor) => {
								var option_48 = root_2();
								var text_47 = $.only_child(option_48, true);

								option_48.value = option_48.__value = 'var(--font-custom-2)';
								$.template_effect(() => $.set_text(text_47, settingsCustomFonts.font2.family));
								$.append($$anchor, option_48);
							};

							$.if(node_29, ($$render) => {
								if (settingsCustomFonts.font2) $$render(consequent_11);
							});
						}

						$.reset(select_34);
						$.init_select(select_34);
						$.reset(label_28);

						var label_29 = $.sibling(label_28, 4);
						var select_35 = $.sibling($.child(label_29), 2);

						$.each(select_35, 21, () => constants.fontSizes, $.index, ($$anchor, fontSize) => {
							var option_49 = root_2();
							var text_48 = $.only_child(option_49, true);
							var option_49_value = {};

							$.template_effect(() => {
								$.set_text(text_48, $.get(fontSize));

								if (option_49_value !== (option_49_value = $.get(fontSize))) {
									option_49.value = (option_49.__value = option_49_value) ?? '';
								}
							});

							$.append($$anchor, option_49);
						});

						$.reset(select_35);
						$.init_select(select_35);
						$.reset(label_29);

						var label_30 = $.sibling(label_29, 2);
						var select_36 = $.sibling($.child(label_30), 2);

						$.each(select_36, 21, () => constants.lineHeights, $.index, ($$anchor, lineHeight) => {
							var option_50 = root_2();
							var text_49 = $.only_child(option_50, true);
							var option_50_value = {};

							$.template_effect(() => {
								$.set_text(text_49, $.get(lineHeight));

								if (option_50_value !== (option_50_value = $.get(lineHeight))) {
									option_50.value = (option_50.__value = option_50_value) ?? '';
								}
							});

							$.append($$anchor, option_50);
						});

						$.reset(select_36);
						$.init_select(select_36);
						$.reset(label_30);

						var label_31 = $.sibling(label_30, 2);
						var select_37 = $.sibling($.child(label_31), 2);

						$.each(select_37, 21, () => constants.fontWeights, $.index, ($$anchor, fontWeight) => {
							var option_51 = root_2();
							var text_50 = $.only_child(option_51, true);
							var option_51_value = {};

							$.template_effect(() => {
								$.set_text(text_50, $.get(fontWeight));

								if (option_51_value !== (option_51_value = $.get(fontWeight))) {
									option_51.value = (option_51.__value = option_51_value) ?? '';
								}
							});

							$.append($$anchor, option_51);
						});

						$.reset(select_37);
						$.init_select(select_37);
						$.reset(label_31);

						var label_32 = $.sibling(label_31, 2);
						var select_38 = $.sibling($.child(label_32), 2);

						$.each(select_38, 21, () => constants.fontStyles, $.index, ($$anchor, fontStyle) => {
							var option_52 = root_2();
							var text_51 = $.only_child(option_52, true);
							var option_52_value = {};

							$.template_effect(() => {
								$.set_text(text_51, $.get(fontStyle));

								if (option_52_value !== (option_52_value = $.get(fontStyle))) {
									option_52.value = (option_52.__value = option_52_value) ?? '';
								}
							});

							$.append($$anchor, option_52);
						});

						$.reset(select_38);
						$.init_select(select_38);
						$.reset(label_32);

						var label_33 = $.sibling(label_32, 2);
						var select_39 = $.sibling($.child(label_33), 2);

						$.each(select_39, 21, () => constants.letterSpacings, $.index, ($$anchor, letterSpacing) => {
							var option_53 = root_2();
							var text_52 = $.only_child(option_53, true);
							var option_53_value = {};

							$.template_effect(() => {
								$.set_text(text_52, $.get(letterSpacing));

								if (option_53_value !== (option_53_value = $.get(letterSpacing))) {
									option_53.value = (option_53.__value = option_53_value) ?? '';
								}
							});

							$.append($$anchor, option_53);
						});

						$.reset(select_39);
						$.init_select(select_39);
						$.reset(label_33);

						var label_34 = $.sibling(label_33, 2);
						var select_40 = $.sibling($.child(label_34), 2);

						$.each(select_40, 21, () => constants.wordSpacings, $.index, ($$anchor, wordSpacing) => {
							var option_54 = root_2();
							var text_53 = $.only_child(option_54, true);
							var option_54_value = {};

							$.template_effect(() => {
								$.set_text(text_53, $.get(wordSpacing));

								if (option_54_value !== (option_54_value = $.get(wordSpacing))) {
									option_54.value = (option_54.__value = option_54_value) ?? '';
								}
							});

							$.append($$anchor, option_54);
						});

						$.reset(select_40);
						$.init_select(select_40);
						$.reset(label_34);

						var label_35 = $.sibling(label_34, 2);
						var select_41 = $.sibling($.child(label_35), 2);

						$.each(select_41, 21, () => constants.fontStretches, $.index, ($$anchor, fontStretch) => {
							var option_55 = root_2();
							var text_54 = $.only_child(option_55, true);
							var option_55_value = {};

							$.template_effect(() => {
								$.set_text(text_54, $.get(fontStretch));

								if (option_55_value !== (option_55_value = $.get(fontStretch))) {
									option_55.value = (option_55.__value = option_55_value) ?? '';
								}
							});

							$.append($$anchor, option_55);
						});

						$.reset(select_41);
						$.init_select(select_41);
						$.reset(label_35);

						var label_36 = $.sibling(label_35, 2);
						var select_42 = $.sibling($.child(label_36), 2);

						$.each(select_42, 21, () => constants.fontKernings, $.index, ($$anchor, fontKerning) => {
							var option_56 = root_2();
							var text_55 = $.only_child(option_56, true);
							var option_56_value = {};

							$.template_effect(() => {
								$.set_text(text_55, $.get(fontKerning));

								if (option_56_value !== (option_56_value = $.get(fontKerning))) {
									option_56.value = (option_56.__value = option_56_value) ?? '';
								}
							});

							$.append($$anchor, option_56);
						});

						$.reset(select_42);
						$.init_select(select_42);
						$.reset(label_36);

						var label_37 = $.sibling(label_36, 2);
						var select_43 = $.sibling($.child(label_37), 2);

						$.each(select_43, 21, () => constants.hyphensOptions, $.index, ($$anchor, hyphensOption) => {
							var option_57 = root_2();
							var text_56 = $.only_child(option_57, true);
							var option_57_value = {};

							$.template_effect(() => {
								$.set_text(text_56, $.get(hyphensOption));

								if (option_57_value !== (option_57_value = $.get(hyphensOption))) {
									option_57.value = (option_57.__value = option_57_value) ?? '';
								}
							});

							$.append($$anchor, option_57);
						});

						$.reset(select_43);
						$.init_select(select_43);
						$.reset(label_37);

						var label_38 = $.sibling(label_37, 2);
						var select_44 = $.sibling($.child(label_38), 2);

						$.each(select_44, 21, () => constants.textTransforms, $.index, ($$anchor, textTransform) => {
							var option_58 = root_2();
							var text_57 = $.only_child(option_58, true);
							var option_58_value = {};

							$.template_effect(() => {
								$.set_text(text_57, $.get(textTransform));

								if (option_58_value !== (option_58_value = $.get(textTransform))) {
									option_58.value = (option_58.__value = option_58_value) ?? '';
								}
							});

							$.append($$anchor, option_58);
						});

						$.reset(select_44);
						$.init_select(select_44);
						$.reset(label_38);

						var label_39 = $.sibling(label_38, 2);
						var select_45 = $.sibling($.child(label_39), 2);

						$.each(select_45, 21, () => constants.textShadows, $.index, ($$anchor, textShadow) => {
							var option_59 = root_2();
							var text_58 = $.only_child(option_59, true);
							var option_59_value = {};

							$.template_effect(() => {
								$.set_text(text_58, $.get(textShadow));

								if (option_59_value !== (option_59_value = $.get(textShadow))) {
									option_59.value = (option_59.__value = option_59_value) ?? '';
								}
							});

							$.append($$anchor, option_59);
						});

						$.reset(select_45);
						$.init_select(select_45);
						$.reset(label_39);
						$.reset(div_11);

						var div_14 = $.sibling(div_11, 2);
						var node_30 = $.sibling($.child(div_14), 2);

						Tabs(node_30, {
							get value() {
								return $.get(decorationState);
							},
							onValueChange: (e) => $.set(decorationState, e.value, true),
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_8();
								var node_31 = $.first_child(fragment_5);

								$.component(node_31, () => Tabs.List, ($$anchor, Tabs_List_1) => {
									Tabs_List_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_6();
											var node_32 = $.first_child(fragment_6);

											$.component(node_32, () => Tabs.Indicator, ($$anchor, Tabs_Indicator_1) => {
												Tabs_Indicator_1($$anchor, {});
											});

											var node_33 = $.sibling(node_32, 2);

											$.component(node_33, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
												Tabs_Trigger_3($$anchor, {
													class: 'flex-1',
													value: 'default',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_59 = $.text('Default');

														$.append($$anchor, text_59);
													},
													$$slots: { default: true }
												});
											});

											var node_34 = $.sibling(node_33, 2);

											$.component(node_34, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_4) => {
												Tabs_Trigger_4($$anchor, {
													class: 'flex-1',
													value: 'hover',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_60 = $.text('Hover');

														$.append($$anchor, text_60);
													},
													$$slots: { default: true }
												});
											});

											var node_35 = $.sibling(node_34, 2);

											$.component(node_35, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_5) => {
												Tabs_Trigger_5($$anchor, {
													class: 'flex-1',
													value: 'active',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_61 = $.text('Active');

														$.append($$anchor, text_61);
													},
													$$slots: { default: true }
												});
											});

											var node_36 = $.sibling(node_35, 2);

											$.component(node_36, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_6) => {
												Tabs_Trigger_6($$anchor, {
													class: 'flex-1',
													value: 'focus',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_62 = $.text('Focus');

														$.append($$anchor, text_62);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								var node_37 = $.sibling(node_31, 2);

								$.component(node_37, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
									Tabs_Content_3($$anchor, {
										get value() {
											return $.get(decorationState);
										},

										children: ($$anchor, $$slotProps) => {
											var div_15 = root_7();
											var label_40 = $.child(div_15);
											var select_46 = $.sibling($.child(label_40), 2);

											$.each(select_46, 21, () => constants.textDecorations, $.index, ($$anchor, textDecoration) => {
												var option_60 = root_2();
												var text_63 = $.only_child(option_60, true);
												var option_60_value = {};

												$.template_effect(() => {
													$.set_text(text_63, $.get(textDecoration));

													if (option_60_value !== (option_60_value = $.get(textDecoration))) {
														option_60.value = (option_60.__value = option_60_value) ?? '';
													}
												});

												$.append($$anchor, option_60);
											});

											$.reset(select_46);
											$.init_select(select_46);
											$.reset(label_40);

											var label_41 = $.sibling(label_40, 2);
											var select_47 = $.sibling($.child(label_41), 2);
											var option_61 = $.child(select_47);

											option_61.value = option_61.__value = 'inherit';

											var node_38 = $.sibling(option_61);

											$.each(node_38, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
												var option_62 = root_2();
												var text_64 = $.only_child(option_62, true);
												var option_62_value = {};

												$.template_effect(() => {
													$.set_text(text_64, $.get(colorName));

													if (option_62_value !== (option_62_value = $.get(colorName))) {
														option_62.value = (option_62.__value = option_62_value) ?? '';
													}
												});

												$.append($$anchor, option_62);
											});

											$.reset(select_47);
											$.init_select(select_47);

											var node_39 = $.sibling(select_47, 2);

											{
												var consequent_12 = ($$anchor) => {
													var select_48 = root_3();

													$.each(select_48, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
														var option_63 = root_2();
														var text_65 = $.only_child(option_63, true);
														var option_63_value = {};

														$.template_effect(
															($0) => {
																$.set_text(text_65, $.get(colorShade));

																if (option_63_value !== (option_63_value = $0)) {
																	option_63.value = (option_63.__value = option_63_value) ?? '';
																}
															},
															[() => $.get(colorShade).toString()]
														);

														$.append($$anchor, option_63);
													});

													$.reset(select_48);
													$.init_select(select_48);
													$.bind_select_value(select_48, () => decorationColorShade[$.get(decorationState)], ($$value) => decorationColorShade[$.get(decorationState)] = $$value);
													$.append($$anchor, select_48);
												};

												$.if(node_39, ($$render) => {
													if (decorationColorName[$.get(decorationState)] !== 'inherit') $$render(consequent_12);
												});
											}

											$.reset(label_41);

											var label_42 = $.sibling(label_41, 2);
											var select_49 = $.sibling($.child(label_42), 2);

											$.each(select_49, 21, () => constants.decorationStyles, $.index, ($$anchor, decorationStyle) => {
												var option_64 = root_2();
												var text_66 = $.only_child(option_64, true);
												var option_64_value = {};

												$.template_effect(() => {
													$.set_text(text_66, $.get(decorationStyle));

													if (option_64_value !== (option_64_value = $.get(decorationStyle))) {
														option_64.value = (option_64.__value = option_64_value) ?? '';
													}
												});

												$.append($$anchor, option_64);
											});

											$.reset(select_49);
											$.init_select(select_49);
											$.reset(label_42);

											var label_43 = $.sibling(label_42, 2);
											var select_50 = $.sibling($.child(label_43), 2);

											$.each(select_50, 21, () => constants.decorationThicknesses, $.index, ($$anchor, decorationThickness) => {
												var option_65 = root_2();
												var text_67 = $.only_child(option_65, true);
												var option_65_value = {};

												$.template_effect(() => {
													$.set_text(text_67, $.get(decorationThickness));

													if (option_65_value !== (option_65_value = $.get(decorationThickness))) {
														option_65.value = (option_65.__value = option_65_value) ?? '';
													}
												});

												$.append($$anchor, option_65);
											});

											$.reset(select_50);
											$.init_select(select_50);
											$.reset(label_43);

											var label_44 = $.sibling(label_43, 2);
											var select_51 = $.sibling($.child(label_44), 2);

											$.each(select_51, 21, () => constants.underlineOffsets, $.index, ($$anchor, underlineOffset) => {
												var option_66 = root_2();
												var text_68 = $.only_child(option_66, true);
												var option_66_value = {};

												$.template_effect(() => {
													$.set_text(text_68, $.get(underlineOffset));

													if (option_66_value !== (option_66_value = $.get(underlineOffset))) {
														option_66.value = (option_66.__value = option_66_value) ?? '';
													}
												});

												$.append($$anchor, option_66);
											});

											$.reset(select_51);
											$.init_select(select_51);
											$.reset(label_44);

											var label_45 = $.sibling(label_44, 2);
											var select_52 = $.sibling($.child(label_45), 2);

											$.each(select_52, 21, () => constants.underlinePositions, $.index, ($$anchor, underlinePosition) => {
												var option_67 = root_2();
												var text_69 = $.only_child(option_67, true);
												var option_67_value = {};

												$.template_effect(() => {
													$.set_text(text_69, $.get(underlinePosition));

													if (option_67_value !== (option_67_value = $.get(underlinePosition))) {
														option_67.value = (option_67.__value = option_67_value) ?? '';
													}
												});

												$.append($$anchor, option_67);
											});

											$.reset(select_52);
											$.init_select(select_52);
											$.reset(label_45);
											$.reset(div_15);
											$.bind_select_value(select_46, () => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-line')], ($$value) => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-line')] = $$value);
											$.bind_select_value(select_47, () => decorationColorName[$.get(decorationState)], ($$value) => decorationColorName[$.get(decorationState)] = $$value);
											$.bind_select_value(select_49, () => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-style')], ($$value) => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-style')] = $$value);
											$.bind_select_value(select_50, () => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-thickness')], ($$value) => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-decoration-thickness')] = $$value);
											$.bind_select_value(select_51, () => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-underline-offset')], ($$value) => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-underline-offset')] = $$value);
											$.bind_select_value(select_52, () => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-underline-position')], ($$value) => settingsTypography[anchorDecorationKey($.get(decorationState), 'text-underline-position')] = $$value);
											$.append($$anchor, div_15);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});

						$.reset(div_14);

						$.template_effect(() => {
							styles_4 = $.set_style(div_12, '', styles_4, {
								background: settingsTypography['--typo-anchor--color-light'] === 'inherit'
									? `${settingsTypography['--typo-base--color-light']}`
									: `${settingsTypography['--typo-anchor--color-light']}`
							});

							styles_5 = $.set_style(div_13, '', styles_5, {
								background: settingsTypography['--typo-anchor--color-dark'] === 'inherit'
									? `${settingsTypography['--typo-base--color-dark']}`
									: `${settingsTypography['--typo-anchor--color-dark']}`
							});
						});

						$.bind_select_value(select_30, () => $.get(anchorLightColorName), ($$value) => $.set(anchorLightColorName, $$value));
						$.bind_select_value(select_32, () => $.get(anchorDarkColorName), ($$value) => $.set(anchorDarkColorName, $$value));
						$.bind_select_value(select_34, () => settingsTypography['--typo-anchor--font-family'], ($$value) => settingsTypography['--typo-anchor--font-family'] = $$value);
						$.bind_select_value(select_35, () => settingsTypography['--typo-anchor--font-size'], ($$value) => settingsTypography['--typo-anchor--font-size'] = $$value);
						$.bind_select_value(select_36, () => settingsTypography['--typo-anchor--line-height'], ($$value) => settingsTypography['--typo-anchor--line-height'] = $$value);
						$.bind_select_value(select_37, () => settingsTypography['--typo-anchor--font-weight'], ($$value) => settingsTypography['--typo-anchor--font-weight'] = $$value);
						$.bind_select_value(select_38, () => settingsTypography['--typo-anchor--font-style'], ($$value) => settingsTypography['--typo-anchor--font-style'] = $$value);
						$.bind_select_value(select_39, () => settingsTypography['--typo-anchor--letter-spacing'], ($$value) => settingsTypography['--typo-anchor--letter-spacing'] = $$value);
						$.bind_select_value(select_40, () => settingsTypography['--typo-anchor--word-spacing'], ($$value) => settingsTypography['--typo-anchor--word-spacing'] = $$value);
						$.bind_select_value(select_41, () => settingsTypography['--typo-anchor--font-stretch'], ($$value) => settingsTypography['--typo-anchor--font-stretch'] = $$value);
						$.bind_select_value(select_42, () => settingsTypography['--typo-anchor--font-kerning'], ($$value) => settingsTypography['--typo-anchor--font-kerning'] = $$value);
						$.bind_select_value(select_43, () => settingsTypography['--typo-anchor--hyphens'], ($$value) => settingsTypography['--typo-anchor--hyphens'] = $$value);
						$.bind_select_value(select_44, () => settingsTypography['--typo-anchor--text-transform'], ($$value) => settingsTypography['--typo-anchor--text-transform'] = $$value);
						$.bind_select_value(select_45, () => settingsTypography['--typo-anchor--text-shadow'], ($$value) => settingsTypography['--typo-anchor--text-shadow'] = $$value);
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_class(button, 1, `chip w-full justify-center ${settingsCustomFonts.font1
			? 'preset-tonal'
			: 'preset-outlined-surface-300-700 hover:preset-tonal'}`);

		$.set_text(text, settingsCustomFonts.font1?.family ?? 'Import');

		$.set_class(button_1, 1, `chip w-full justify-center ${settingsCustomFonts.font2
			? 'preset-tonal'
			: 'preset-outlined-surface-300-700 hover:preset-tonal'}`);

		$.set_text(text_1, settingsCustomFonts.font2?.family ?? 'Import');
	});

	$.delegated('click', button, () => promptCustomFont('font1'));
	$.delegated('click', button_1, () => promptCustomFont('font2'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);