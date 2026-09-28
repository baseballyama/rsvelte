import * as $ from 'svelte/internal/server';
import * as constants from '$lib/constants/generator';
import { settingsCustomFonts, settingsTypography } from '$lib/state/generator.svelte';

import {
	customFontOptionValue,
	fetchFontsourceFont,
	parseFontsourceId
} from '$lib/utils/generator/fonts';

import { Tabs } from '@skeletonlabs/skeleton-svelte';
import chroma from 'chroma-js';

export default function ControlsTypography($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Constants
		// State
		const WHITE = 'oklch(1 0 0 / 1)';

		const BLACK = 'oklch(0 0 0 / 1)';

		// Local
		let category = 'base';

		let decorationState = 'default';
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
		let baseLightColorName = initialBaseLight.name;
		let baseLightShade = initialBaseLight.shade;
		let baseDarkColorName = initialBaseDark.name;
		let baseDarkShade = initialBaseDark.shade;
		let headingLightColorName = initialHeadingLight.name;
		let headingLightShade = initialHeadingLight.shade;
		let headingDarkColorName = initialHeadingDark.name;
		let headingDarkShade = initialHeadingDark.shade;
		let anchorLightColorName = initialAnchorLight.name;
		let anchorLightShade = initialAnchorLight.shade;
		let anchorDarkColorName = initialAnchorDark.name;
		let anchorDarkShade = initialAnchorDark.shade;

		const initialDecorationColor = Object.fromEntries(decorationStates.map((state) => [
			state,
			parseColorRef(settingsTypography[anchorDecorationKey(state, 'text-decoration-color')], null, '', '500')
		]));

		let decorationColorName = Object.fromEntries(decorationStates.map((state) => [state, initialDecorationColor[state].name]));
		let decorationColorShade = Object.fromEntries(decorationStates.map((state) => [state, initialDecorationColor[state].shade]));

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

		$$renderer.push(`<div class="space-y-4"><section class="space-y-4"><header class="flex justify-between items-center gap-4"><div class="flex items-center gap-2"><h3 class="h5">Custom Fonts</h3> <span class="badge preset-filled-primary-500">Beta</span></div> <a class="btn btn-xs preset-tonal" href="https://skeleton.dev/docs/svelte/design/themes#custom-fonts" target="_blank">View Docs</a></header> <p class="opacity-60">Import custom fonts to preview via <a href="https://fontsource.org/" target="_blank" class="underline">Fontsource</a>.</p> <div class="grid grid-cols-2 gap-4"><div class="label space-y-2"><span class="label-text">Custom Font 1</span> <button type="button"${$.attr_class(`chip w-full justify-center ${settingsCustomFonts.font1
			? 'preset-tonal'
			: 'preset-outlined-surface-300-700 hover:preset-tonal'}`)}>${$.escape(settingsCustomFonts.font1?.family ?? 'Import')}</button></div> <div class="label space-y-2"><span class="label-text">Custom Font 2</span> <button type="button"${$.attr_class(`chip w-full justify-center ${settingsCustomFonts.font2
			? 'preset-tonal'
			: 'preset-outlined-surface-300-700 hover:preset-tonal'}`)}>${$.escape(settingsCustomFonts.font2?.family ?? 'Import')}</button></div></div></section> <section class="space-y-4"><header class="flex justify-between items-center gap-4"><h3 class="h5">Typographic Scale</h3> <a class="btn btn-xs preset-tonal" href="https://designcode.io/typographic-scales" target="_blank">View Docs</a></header> <div class="grid grid-cols-3 preset-outlined-surface-200-800 rounded-container overflow-hidden divide-x divide-y divide-surface-200-800"><!--[-->`);

		const each_array = $.ensure_array_like(constants.typographicScales);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let typographicScale = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class(`flex flex-col items-center py-2 ${settingsTypography['--text-scaling'] === typographicScale.value ? 'preset-filled' : 'hover:preset-tonal-primary'}`)}><strong class="text-[16px]">${$.escape(typographicScale.value)}</strong> <strong class="text-[10px] opacity-50">${$.escape(typographicScale.label)}</strong></button>`);
		}

		$$renderer.push(`<!--]--></div></section> <h3 class="h5">Typographic Feature</h3> `);

		Tabs($$renderer, {
			value: category,
			onValueChange: (e) => category = e.value,
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
									class: 'flex-1',
									value: 'base',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Base`);
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
									class: 'flex-1',
									value: 'headings',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Headings`);
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
									class: 'flex-1',
									value: 'anchors',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Anchors`);
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

				$$renderer.push(` `);

				if (Tabs.Content) {
					$$renderer.push('<!--[-->');

					Tabs.Content($$renderer, {
						value: 'base',
						children: ($$renderer) => {
							$$renderer.push(`<p class="mb-5 opacity-60">Set global defaults for text colors and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: `${settingsTypography['--typo-base--color-light']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: baseLightColorName }, ($$renderer) => {
								$$renderer.option({ value: 'black' }, ($$renderer) => {
									$$renderer.push(`Black`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(constants.colorNames);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let colorName = each_array_1[$$index_1];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (baseLightColorName !== 'black') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: baseLightShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_2 = $.ensure_array_like(constants.colorShades);

									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let colorShade = each_array_2[$$index_2];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: `${settingsTypography['--typo-base--color-dark']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: baseDarkColorName }, ($$renderer) => {
								$$renderer.option({ value: 'white' }, ($$renderer) => {
									$$renderer.push(`White`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_3 = $.ensure_array_like(constants.colorNames);

								for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
									let colorName = each_array_3[$$index_3];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (baseDarkColorName !== 'white') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: baseDarkShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_4 = $.ensure_array_like(constants.colorShades);

									for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
										let colorShade = each_array_4[$$index_4];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-family',
									value: settingsTypography['--typo-base--font-family']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_5 = $.ensure_array_like(constants.fontFamilies);

									for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
										let fontFamily = each_array_5[$$index_5];

										$$renderer.option({ value: fontFamily }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontFamily)}`);
										});
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font1) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-1)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font1.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font2) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-2)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font2.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Size</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-size',
									value: settingsTypography['--typo-base--font-size']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_6 = $.ensure_array_like(constants.fontSizes);

									for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
										let fontSize = each_array_6[$$index_6];

										$$renderer.option({ value: fontSize }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontSize)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Line Height</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--line-height',
									value: settingsTypography['--typo-base--line-height']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_7 = $.ensure_array_like(constants.lineHeights);

									for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
										let lineHeight = each_array_7[$$index_7];

										$$renderer.option({ value: lineHeight }, ($$renderer) => {
											$$renderer.push(`${$.escape(lineHeight)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Weight</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-weight',
									value: settingsTypography['--typo-base--font-weight']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_8 = $.ensure_array_like(constants.fontWeights);

									for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
										let fontWeight = each_array_8[$$index_8];

										$$renderer.option({ value: fontWeight }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontWeight)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Style</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-style',
									value: settingsTypography['--typo-base--font-style']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_9 = $.ensure_array_like(constants.fontStyles);

									for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
										let fontStyle = each_array_9[$$index_9];

										$$renderer.option({ value: fontStyle }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStyle)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Letter Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--letter-spacing',
									value: settingsTypography['--typo-base--letter-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_10 = $.ensure_array_like(constants.letterSpacings);

									for (let $$index_10 = 0,
										$$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
										let letterSpacing = each_array_10[$$index_10];

										$$renderer.option({ value: letterSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(letterSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Word Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--word-spacing',
									value: settingsTypography['--typo-base--word-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_11 = $.ensure_array_like(constants.wordSpacings);

									for (let $$index_11 = 0,
										$$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
										let wordSpacing = each_array_11[$$index_11];

										$$renderer.option({ value: wordSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(wordSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Stretch</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-stretch',
									value: settingsTypography['--typo-base--font-stretch']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_12 = $.ensure_array_like(constants.fontStretches);

									for (let $$index_12 = 0,
										$$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
										let fontStretch = each_array_12[$$index_12];

										$$renderer.option({ value: fontStretch }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStretch)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Kerning</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--font-kerning',
									value: settingsTypography['--typo-base--font-kerning']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_13 = $.ensure_array_like(constants.fontKernings);

									for (let $$index_13 = 0,
										$$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
										let fontKerning = each_array_13[$$index_13];

										$$renderer.option({ value: fontKerning }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontKerning)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Hyphens</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--hyphens',
									value: settingsTypography['--typo-base--hyphens']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_14 = $.ensure_array_like(constants.hyphensOptions);

									for (let $$index_14 = 0,
										$$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
										let hyphensOption = each_array_14[$$index_14];

										$$renderer.option({ value: hyphensOption }, ($$renderer) => {
											$$renderer.push(`${$.escape(hyphensOption)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Transform</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--text-transform',
									value: settingsTypography['--typo-base--text-transform']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_15 = $.ensure_array_like(constants.textTransforms);

									for (let $$index_15 = 0,
										$$length = each_array_15.length; $$index_15 < $$length; $$index_15++) {
										let textTransform = each_array_15[$$index_15];

										$$renderer.option({ value: textTransform }, ($$renderer) => {
											$$renderer.push(`${$.escape(textTransform)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Shadow</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-base--text-shadow',
									value: settingsTypography['--typo-base--text-shadow']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_16 = $.ensure_array_like(constants.textShadows);

									for (let $$index_16 = 0,
										$$length = each_array_16.length; $$index_16 < $$length; $$index_16++) {
										let textShadow = each_array_16[$$index_16];

										$$renderer.option({ value: textShadow }, ($$renderer) => {
											$$renderer.push(`${$.escape(textShadow)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Tabs.Content) {
					$$renderer.push('<!--[-->');

					Tabs.Content($$renderer, {
						value: 'headings',
						children: ($$renderer) => {
							$$renderer.push(`<p class="mb-5 opacity-60">Adjust headings (H1-H6) text color and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: settingsTypography['--typo-heading--color-light'] === 'inherit'
									? `${settingsTypography['--typo-base--color-light']}`
									: `${settingsTypography['--typo-heading--color-light']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: headingLightColorName }, ($$renderer) => {
								$$renderer.option({ value: 'inherit' }, ($$renderer) => {
									$$renderer.push(`inherit`);
								});

								$$renderer.option({ value: 'black' }, ($$renderer) => {
									$$renderer.push(`Black`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_17 = $.ensure_array_like(constants.colorNames);

								for (let $$index_17 = 0,
									$$length = each_array_17.length; $$index_17 < $$length; $$index_17++) {
									let colorName = each_array_17[$$index_17];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (headingLightColorName !== 'inherit' && headingLightColorName !== 'black') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: headingLightShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_18 = $.ensure_array_like(constants.colorShades);

									for (let $$index_18 = 0,
										$$length = each_array_18.length; $$index_18 < $$length; $$index_18++) {
										let colorShade = each_array_18[$$index_18];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: settingsTypography['--typo-heading--color-dark'] === 'inherit'
									? `${settingsTypography['--typo-base--color-dark']}`
									: `${settingsTypography['--typo-heading--color-dark']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: headingDarkColorName }, ($$renderer) => {
								$$renderer.option({ value: 'inherit' }, ($$renderer) => {
									$$renderer.push(`inherit`);
								});

								$$renderer.option({ value: 'white' }, ($$renderer) => {
									$$renderer.push(`White`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_19 = $.ensure_array_like(constants.colorNames);

								for (let $$index_19 = 0,
									$$length = each_array_19.length; $$index_19 < $$length; $$index_19++) {
									let colorName = each_array_19[$$index_19];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (headingDarkColorName !== 'inherit' && headingDarkColorName !== 'white') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: headingDarkShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_20 = $.ensure_array_like(constants.colorShades);

									for (let $$index_20 = 0,
										$$length = each_array_20.length; $$index_20 < $$length; $$index_20++) {
										let colorShade = each_array_20[$$index_20];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--font-family',
									value: settingsTypography['--typo-heading--font-family']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_21 = $.ensure_array_like(constants.fontFamilies);

									for (let $$index_21 = 0,
										$$length = each_array_21.length; $$index_21 < $$length; $$index_21++) {
										let fontFamily = each_array_21[$$index_21];

										$$renderer.option({ value: fontFamily }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontFamily)}`);
										});
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font1) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-1)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font1.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font2) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-2)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font2.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Weight</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--font-weight',
									value: settingsTypography['--typo-heading--font-weight']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_22 = $.ensure_array_like(constants.fontWeights);

									for (let $$index_22 = 0,
										$$length = each_array_22.length; $$index_22 < $$length; $$index_22++) {
										let fontWeight = each_array_22[$$index_22];

										$$renderer.option({ value: fontWeight }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontWeight)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Style</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--font-style',
									value: settingsTypography['--typo-heading--font-style']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_23 = $.ensure_array_like(constants.fontStyles);

									for (let $$index_23 = 0,
										$$length = each_array_23.length; $$index_23 < $$length; $$index_23++) {
										let fontStyle = each_array_23[$$index_23];

										$$renderer.option({ value: fontStyle }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStyle)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Letter Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--letter-spacing',
									value: settingsTypography['--typo-heading--letter-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_24 = $.ensure_array_like(constants.letterSpacings);

									for (let $$index_24 = 0,
										$$length = each_array_24.length; $$index_24 < $$length; $$index_24++) {
										let letterSpacing = each_array_24[$$index_24];

										$$renderer.option({ value: letterSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(letterSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Word Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--word-spacing',
									value: settingsTypography['--typo-heading--word-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_25 = $.ensure_array_like(constants.wordSpacings);

									for (let $$index_25 = 0,
										$$length = each_array_25.length; $$index_25 < $$length; $$index_25++) {
										let wordSpacing = each_array_25[$$index_25];

										$$renderer.option({ value: wordSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(wordSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Stretch</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--font-stretch',
									value: settingsTypography['--typo-heading--font-stretch']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_26 = $.ensure_array_like(constants.fontStretches);

									for (let $$index_26 = 0,
										$$length = each_array_26.length; $$index_26 < $$length; $$index_26++) {
										let fontStretch = each_array_26[$$index_26];

										$$renderer.option({ value: fontStretch }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStretch)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Kerning</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--font-kerning',
									value: settingsTypography['--typo-heading--font-kerning']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_27 = $.ensure_array_like(constants.fontKernings);

									for (let $$index_27 = 0,
										$$length = each_array_27.length; $$index_27 < $$length; $$index_27++) {
										let fontKerning = each_array_27[$$index_27];

										$$renderer.option({ value: fontKerning }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontKerning)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Hyphens</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--hyphens',
									value: settingsTypography['--typo-heading--hyphens']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_28 = $.ensure_array_like(constants.hyphensOptions);

									for (let $$index_28 = 0,
										$$length = each_array_28.length; $$index_28 < $$length; $$index_28++) {
										let hyphensOption = each_array_28[$$index_28];

										$$renderer.option({ value: hyphensOption }, ($$renderer) => {
											$$renderer.push(`${$.escape(hyphensOption)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Transform</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--text-transform',
									value: settingsTypography['--typo-heading--text-transform']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_29 = $.ensure_array_like(constants.textTransforms);

									for (let $$index_29 = 0,
										$$length = each_array_29.length; $$index_29 < $$length; $$index_29++) {
										let textTransform = each_array_29[$$index_29];

										$$renderer.option({ value: textTransform }, ($$renderer) => {
											$$renderer.push(`${$.escape(textTransform)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Shadow</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-heading--text-shadow',
									value: settingsTypography['--typo-heading--text-shadow']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_30 = $.ensure_array_like(constants.textShadows);

									for (let $$index_30 = 0,
										$$length = each_array_30.length; $$index_30 < $$length; $$index_30++) {
										let textShadow = each_array_30[$$index_30];

										$$renderer.option({ value: textShadow }, ($$renderer) => {
											$$renderer.push(`${$.escape(textShadow)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Tabs.Content) {
					$$renderer.push('<!--[-->');

					Tabs.Content($$renderer, {
						value: 'anchors',
						children: ($$renderer) => {
							$$renderer.push(`<p class="mb-5 opacity-60">Adjust anchor link text color and font styles.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: settingsTypography['--typo-anchor--color-light'] === 'inherit'
									? `${settingsTypography['--typo-base--color-light']}`
									: `${settingsTypography['--typo-anchor--color-light']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: anchorLightColorName }, ($$renderer) => {
								$$renderer.option({ value: 'inherit' }, ($$renderer) => {
									$$renderer.push(`inherit`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_31 = $.ensure_array_like(constants.colorNames);

								for (let $$index_31 = 0,
									$$length = each_array_31.length; $$index_31 < $$length; $$index_31++) {
									let colorName = each_array_31[$$index_31];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (anchorLightColorName !== 'inherit') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: anchorLightShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_32 = $.ensure_array_like(constants.colorShades);

									for (let $$index_32 = 0,
										$$length = each_array_32.length; $$index_32 < $$length; $$index_32++) {
										let colorShade = each_array_32[$$index_32];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <label class="label space-y-2"><span class="label-text">Dark Mode Font Color</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
								background: settingsTypography['--typo-anchor--color-dark'] === 'inherit'
									? `${settingsTypography['--typo-base--color-dark']}`
									: `${settingsTypography['--typo-anchor--color-dark']}`
							})}></div> `);

							$$renderer.select({ class: 'select', value: anchorDarkColorName }, ($$renderer) => {
								$$renderer.option({ value: 'inherit' }, ($$renderer) => {
									$$renderer.push(`inherit`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array_33 = $.ensure_array_like(constants.colorNames);

								for (let $$index_33 = 0,
									$$length = each_array_33.length; $$index_33 < $$length; $$index_33++) {
									let colorName = each_array_33[$$index_33];

									$$renderer.option({ value: colorName }, ($$renderer) => {
										$$renderer.push(`${$.escape(colorName)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							});

							$$renderer.push(` `);

							if (anchorDarkColorName !== 'inherit') {
								$$renderer.push('<!--[0-->');

								$$renderer.select({ class: 'select', value: anchorDarkShade }, ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_34 = $.ensure_array_like(constants.colorShades);

									for (let $$index_34 = 0,
										$$length = each_array_34.length; $$index_34 < $$length; $$index_34++) {
										let colorShade = each_array_34[$$index_34];

										$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
											$$renderer.push(`${$.escape(colorShade)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></label> <hr class="hr col-span-2"/> <label class="label col-span-2"><span class="label-text">Font Family</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-family',
									value: settingsTypography['--typo-anchor--font-family']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_35 = $.ensure_array_like(constants.fontFamilies);

									for (let $$index_35 = 0,
										$$length = each_array_35.length; $$index_35 < $$length; $$index_35++) {
										let fontFamily = each_array_35[$$index_35];

										$$renderer.option({ value: fontFamily }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontFamily)}`);
										});
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font1) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-1)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font1.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);

									if (settingsCustomFonts.font2) {
										$$renderer.push('<!--[0-->');

										$$renderer.option({ value: 'var(--font-custom-2)' }, ($$renderer) => {
											$$renderer.push(`${$.escape(settingsCustomFonts.font2.family)}`);
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <hr class="hr col-span-2"/> <label class="label"><span class="label-text">Font Size</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-size',
									value: settingsTypography['--typo-anchor--font-size']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_36 = $.ensure_array_like(constants.fontSizes);

									for (let $$index_36 = 0,
										$$length = each_array_36.length; $$index_36 < $$length; $$index_36++) {
										let fontSize = each_array_36[$$index_36];

										$$renderer.option({ value: fontSize }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontSize)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Line Height</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--line-height',
									value: settingsTypography['--typo-anchor--line-height']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_37 = $.ensure_array_like(constants.lineHeights);

									for (let $$index_37 = 0,
										$$length = each_array_37.length; $$index_37 < $$length; $$index_37++) {
										let lineHeight = each_array_37[$$index_37];

										$$renderer.option({ value: lineHeight }, ($$renderer) => {
											$$renderer.push(`${$.escape(lineHeight)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Weight</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-weight',
									value: settingsTypography['--typo-anchor--font-weight']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_38 = $.ensure_array_like(constants.fontWeights);

									for (let $$index_38 = 0,
										$$length = each_array_38.length; $$index_38 < $$length; $$index_38++) {
										let fontWeight = each_array_38[$$index_38];

										$$renderer.option({ value: fontWeight }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontWeight)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Style</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-style',
									value: settingsTypography['--typo-anchor--font-style']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_39 = $.ensure_array_like(constants.fontStyles);

									for (let $$index_39 = 0,
										$$length = each_array_39.length; $$index_39 < $$length; $$index_39++) {
										let fontStyle = each_array_39[$$index_39];

										$$renderer.option({ value: fontStyle }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStyle)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Letter Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--letter-spacing',
									value: settingsTypography['--typo-anchor--letter-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_40 = $.ensure_array_like(constants.letterSpacings);

									for (let $$index_40 = 0,
										$$length = each_array_40.length; $$index_40 < $$length; $$index_40++) {
										let letterSpacing = each_array_40[$$index_40];

										$$renderer.option({ value: letterSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(letterSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Word Spacing</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--word-spacing',
									value: settingsTypography['--typo-anchor--word-spacing']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_41 = $.ensure_array_like(constants.wordSpacings);

									for (let $$index_41 = 0,
										$$length = each_array_41.length; $$index_41 < $$length; $$index_41++) {
										let wordSpacing = each_array_41[$$index_41];

										$$renderer.option({ value: wordSpacing }, ($$renderer) => {
											$$renderer.push(`${$.escape(wordSpacing)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Stretch</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-stretch',
									value: settingsTypography['--typo-anchor--font-stretch']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_42 = $.ensure_array_like(constants.fontStretches);

									for (let $$index_42 = 0,
										$$length = each_array_42.length; $$index_42 < $$length; $$index_42++) {
										let fontStretch = each_array_42[$$index_42];

										$$renderer.option({ value: fontStretch }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontStretch)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Font Kerning</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--font-kerning',
									value: settingsTypography['--typo-anchor--font-kerning']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_43 = $.ensure_array_like(constants.fontKernings);

									for (let $$index_43 = 0,
										$$length = each_array_43.length; $$index_43 < $$length; $$index_43++) {
										let fontKerning = each_array_43[$$index_43];

										$$renderer.option({ value: fontKerning }, ($$renderer) => {
											$$renderer.push(`${$.escape(fontKerning)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Hyphens</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--hyphens',
									value: settingsTypography['--typo-anchor--hyphens']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_44 = $.ensure_array_like(constants.hyphensOptions);

									for (let $$index_44 = 0,
										$$length = each_array_44.length; $$index_44 < $$length; $$index_44++) {
										let hyphensOption = each_array_44[$$index_44];

										$$renderer.option({ value: hyphensOption }, ($$renderer) => {
											$$renderer.push(`${$.escape(hyphensOption)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Transform</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--text-transform',
									value: settingsTypography['--typo-anchor--text-transform']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_45 = $.ensure_array_like(constants.textTransforms);

									for (let $$index_45 = 0,
										$$length = each_array_45.length; $$index_45 < $$length; $$index_45++) {
										let textTransform = each_array_45[$$index_45];

										$$renderer.option({ value: textTransform }, ($$renderer) => {
											$$renderer.push(`${$.escape(textTransform)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label> <label class="label"><span class="label-text">Text Shadow</span> `);

							$$renderer.select(
								{
									class: 'select',
									name: '--typo-anchor--text-shadow',
									value: settingsTypography['--typo-anchor--text-shadow']
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_46 = $.ensure_array_like(constants.textShadows);

									for (let $$index_46 = 0,
										$$length = each_array_46.length; $$index_46 < $$length; $$index_46++) {
										let textShadow = each_array_46[$$index_46];

										$$renderer.option({ value: textShadow }, ($$renderer) => {
											$$renderer.push(`${$.escape(textShadow)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);

							$$renderer.push(`</label></div> <div class="mt-8 space-y-4"><h2 class="h5">Anchor Decoration</h2> `);

							Tabs($$renderer, {
								value: decorationState,
								onValueChange: (e) => decorationState = e.value,
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
														class: 'flex-1',
														value: 'default',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Default`);
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
														class: 'flex-1',
														value: 'hover',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Hover`);
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
														class: 'flex-1',
														value: 'active',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Active`);
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
														class: 'flex-1',
														value: 'focus',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Focus`);
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

									$$renderer.push(` `);

									if (Tabs.Content) {
										$$renderer.push('<!--[-->');

										Tabs.Content($$renderer, {
											value: decorationState,
											children: ($$renderer) => {
												$$renderer.push(`<div class="grid grid-cols-2 gap-4"><label class="label"><span class="label-text">Line</span> `);

												$$renderer.select(
													{
														class: 'select',
														value: settingsTypography[anchorDecorationKey(decorationState, 'text-decoration-line')]
													},
													($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_47 = $.ensure_array_like(constants.textDecorations);

														for (let $$index_47 = 0,
															$$length = each_array_47.length; $$index_47 < $$length; $$index_47++) {
															let textDecoration = each_array_47[$$index_47];

															$$renderer.option({ value: textDecoration }, ($$renderer) => {
																$$renderer.push(`${$.escape(textDecoration)}`);
															});
														}

														$$renderer.push(`<!--]-->`);
													}
												);

												$$renderer.push(`</label> <label class="label"><span class="label-text">Color</span> `);

												$$renderer.select({ class: 'select', value: decorationColorName[decorationState] }, ($$renderer) => {
													$$renderer.option({ value: 'inherit' }, ($$renderer) => {
														$$renderer.push(`inherit`);
													});

													$$renderer.push(`<!--[-->`);

													const each_array_48 = $.ensure_array_like(constants.colorNames);

													for (let $$index_48 = 0,
														$$length = each_array_48.length; $$index_48 < $$length; $$index_48++) {
														let colorName = each_array_48[$$index_48];

														$$renderer.option({ value: colorName }, ($$renderer) => {
															$$renderer.push(`${$.escape(colorName)}`);
														});
													}

													$$renderer.push(`<!--]-->`);
												});

												$$renderer.push(` `);

												if (decorationColorName[decorationState] !== 'inherit') {
													$$renderer.push('<!--[0-->');

													$$renderer.select(
														{
															class: 'select',
															value: decorationColorShade[decorationState]
														},
														($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_49 = $.ensure_array_like(constants.colorShades);

															for (let $$index_49 = 0,
																$$length = each_array_49.length; $$index_49 < $$length; $$index_49++) {
																let colorShade = each_array_49[$$index_49];

																$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
																	$$renderer.push(`${$.escape(colorShade)}`);
																});
															}

															$$renderer.push(`<!--]-->`);
														}
													);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></label> <label class="label"><span class="label-text">Style</span> `);

												$$renderer.select(
													{
														class: 'select',
														value: settingsTypography[anchorDecorationKey(decorationState, 'text-decoration-style')]
													},
													($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_50 = $.ensure_array_like(constants.decorationStyles);

														for (let $$index_50 = 0,
															$$length = each_array_50.length; $$index_50 < $$length; $$index_50++) {
															let decorationStyle = each_array_50[$$index_50];

															$$renderer.option({ value: decorationStyle }, ($$renderer) => {
																$$renderer.push(`${$.escape(decorationStyle)}`);
															});
														}

														$$renderer.push(`<!--]-->`);
													}
												);

												$$renderer.push(`</label> <label class="label"><span class="label-text">Thickness</span> `);

												$$renderer.select(
													{
														class: 'select',
														value: settingsTypography[anchorDecorationKey(decorationState, 'text-decoration-thickness')]
													},
													($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_51 = $.ensure_array_like(constants.decorationThicknesses);

														for (let $$index_51 = 0,
															$$length = each_array_51.length; $$index_51 < $$length; $$index_51++) {
															let decorationThickness = each_array_51[$$index_51];

															$$renderer.option({ value: decorationThickness }, ($$renderer) => {
																$$renderer.push(`${$.escape(decorationThickness)}`);
															});
														}

														$$renderer.push(`<!--]-->`);
													}
												);

												$$renderer.push(`</label> <label class="label"><span class="label-text">Underline Offset</span> `);

												$$renderer.select(
													{
														class: 'select',
														value: settingsTypography[anchorDecorationKey(decorationState, 'text-underline-offset')]
													},
													($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_52 = $.ensure_array_like(constants.underlineOffsets);

														for (let $$index_52 = 0,
															$$length = each_array_52.length; $$index_52 < $$length; $$index_52++) {
															let underlineOffset = each_array_52[$$index_52];

															$$renderer.option({ value: underlineOffset }, ($$renderer) => {
																$$renderer.push(`${$.escape(underlineOffset)}`);
															});
														}

														$$renderer.push(`<!--]-->`);
													}
												);

												$$renderer.push(`</label> <label class="label"><span class="label-text">Underline Position</span> `);

												$$renderer.select(
													{
														class: 'select',
														value: settingsTypography[anchorDecorationKey(decorationState, 'text-underline-position')]
													},
													($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_53 = $.ensure_array_like(constants.underlinePositions);

														for (let $$index_53 = 0,
															$$length = each_array_53.length; $$index_53 < $$length; $$index_53++) {
															let underlinePosition = each_array_53[$$index_53];

															$$renderer.option({ value: underlinePosition }, ($$renderer) => {
																$$renderer.push(`${$.escape(underlinePosition)}`);
															});
														}

														$$renderer.push(`<!--]-->`);
													}
												);

												$$renderer.push(`</label></div>`);
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

							$$renderer.push(`<!----></div>`);
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

		$$renderer.push(`<!----></div>`);
	});
}