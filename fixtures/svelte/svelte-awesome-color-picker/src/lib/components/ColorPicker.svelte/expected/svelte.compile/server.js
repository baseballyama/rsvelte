import * as $ from 'svelte/internal/server';
import { defaultTexts } from '$lib/utils/texts.js';
import { trapFocus } from '$lib/utils/trapFocus.js';
import { colord } from 'colord';
import { tick } from 'svelte';
import { Slider } from 'svelte-awesome-slider';
import Picker from './Picker.svelte';
import Input from './variant/default/Input.svelte';
import NullabilityCheckbox from './variant/default/NullabilityCheckbox.svelte';
import PickerIndicator from './variant/default/PickerIndicator.svelte';
import Swatches from './variant/default/Swatches.svelte';
import TextInput from './variant/default/TextInput.svelte';
import Wrapper from './variant/default/Wrapper.svelte';

export default function ColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
		/** input label, hidden when the ColorPicker is always shown (prop `isDialog={false}`) */
		/** input name, useful in a native form */
		/** if set to true, the color picker becomes nullable (rgb, hsv and hex set to undefined) */
		/** rgb color */
		/** hsv color */
		/** hex color */
		/** Colord color */
		/** indicator whether the selected color is light or dark */
		/** if set to false, disables the alpha channel */
		/** if set to false, the input and the label will not be displayed and the ColorPicker will always be visible */
		/** indicator of the popup state */
		/** if set to "responsive", the popup will adjust its x and y position depending on the available window space, "responsive-x" and "responsive-y" limit the behavior to either the x or y axis */
		/** directionality left to right, or right to left*/
		/** if set to false, hide the hex, rgb and hsv text inputs */
		/** configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value */
		/** If set to "horizontal", the hue and alpha sliders will be displayed horizontally. It is necessary to set this props to "horizontal" for the ChromeVariant */
		/** If set to true, it will not be possible to close the color picker by clicking outside */
		/** used with the A11yVariant. Define the accessibility examples in the color picker */
		/** required WCAG contrast level */
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		/** all a11y translation tokens used in the library; override with translations if necessary; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		/** listener, dispatch an event when the color changes */
		/** Optional array of color swatches to display below the picker */
		let {
			components = {},
			label = 'Choose a color',
			name = undefined,
			nullable = false,
			rgb = nullable ? null : { r: 255, g: 0, b: 0, a: 1 },
			hsv = nullable ? null : { h: 0, s: 100, v: 100, a: 1 },
			hex = nullable ? null : '#ff0000',
			color = null,
			isDark = false,
			isAlpha = true,
			isDialog = true,
			isOpen = !isDialog,
			position = 'responsive',
			dir = 'ltr',
			isTextInput = true,
			textInputModes = ['hex', 'rgb', 'hsv'],
			sliderDirection = 'vertical',
			disableCloseClickOutside = false,
			a11yColors = [{ bgHex: '#ffffff' }],
			a11yLevel = 'AA',
			texts = undefined,
			a11yTexts = undefined,
			onInput,
			swatches
		} = $$props;

		/**
		 * Internal old values to trigger color conversion
		 */
		let _rgb = { r: 255, g: 0, b: 0, a: 1 };

		let _hsv = { h: 0, s: 100, v: 100, a: 1 };
		let _hex = '#ff0000';
		let isUndefined = false;

		// svelte-ignore state_referenced_locally
		let _isUndefined = isUndefined;

		let spanElement = void 0;
		let labelElement = void 0;
		let wrapper = void 0;
		let trap = undefined;
		let innerWidth = 1080;
		let innerHeight = 720;
		const wrapperPadding = 12;

		const default_components = {
			pickerIndicator: PickerIndicator,
			textInput: TextInput,
			input: Input,
			nullabilityCheckbox: NullabilityCheckbox,
			wrapper: Wrapper
		};

		function getComponents() {
			return { ...default_components, ...components };
		}

		function getTexts() {
			return {
				label: { ...defaultTexts.label, ...texts?.label },
				color: { ...defaultTexts.color, ...texts?.color },
				changeTo: texts?.changeTo ?? defaultTexts.changeTo,
				swatch: { ...texts?.swatch, ...defaultTexts.swatch }
			};
		}

		function mousedown({ target }) {
			if (isDialog) {
				if (labelElement?.contains(target) || labelElement?.isSameNode(target)) {
					isOpen = !isOpen;
				} else if (isOpen && !wrapper?.contains(target) && !disableCloseClickOutside) {
					isOpen = false;
				}
			}
		}

		function keyup({ key, target }) {
			if (!isDialog || !labelElement || !spanElement) {
				return;
			} else if (key === 'Enter' && labelElement.contains(target)) {
				isOpen = !isOpen;

				setTimeout(() => {
					if (wrapper) trap = trapFocus(wrapper);
				});
			} else if (key === 'Escape' && isOpen) {
				isOpen = false;

				if (spanElement.contains(target)) {
					labelElement?.focus();
					trap?.destroy();
				}
			}
		}

		function selectSwatch(color) {
			hex = color;
			hsv = colord(color).toHsv();
			rgb = colord(color).toRgb();
			_isUndefined = false;
			isUndefined = false;
			updateColor();
		}

		function hasColorChanged() {
			return !(hsv && rgb && hsv.h === _hsv.h && hsv.s === _hsv.s && hsv.v === _hsv.v && hsv.a === _hsv.a && rgb.r === _rgb.r && rgb.g === _rgb.g && rgb.b === _rgb.b && rgb.a === _rgb.a && hex === _hex);
		}

		/**
		 * using a function seems to trigger the exported value change only once when all of them has been updated
		 * and not just after the hsv change
		 */
		function updateColor() {
			if (isUndefined && !_isUndefined) {
				_isUndefined = true;
				hsv = null;
				rgb = null;
				hex = null;
				onInput?.({ color, hsv, rgb, hex });

				return;
			} else if (_isUndefined && !isUndefined) {
				_isUndefined = false;
				hsv = $.snapshot(_hsv);
				rgb = $.snapshot(_rgb);
				hex = $.snapshot(_hex);
				onInput?.({ color, hsv, rgb, hex });

				return;
			} else if (!hsv && !rgb && !hex) {
				isUndefined = _isUndefined = true;
				onInput?.({ color: null, hsv, rgb, hex });

				return;
			} else if (!hasColorChanged()) {
				return;
			}

			isUndefined = false;

			// reinitialize empty alpha values
			if (hsv && hsv.a === undefined) hsv = { ...hsv, a: 1 };

			if (_hsv.a === undefined) _hsv = { ..._hsv, a: 1 };
			if (rgb && rgb.a === undefined) rgb = { ...rgb, a: 1 };
			if (_rgb.a === undefined) _rgb = { ..._rgb, a: 1 };
			if (hex?.substring(7) === 'ff') hex = hex.substring(0, 7);
			if (_hex?.substring(7) === 'ff') _hex = _hex.substring(0, 7);

			// triggers color computation from the color that changed or if it is the only color defined
			if (hsv && (hsv.h !== _hsv.h || hsv.s !== _hsv.s || hsv.v !== _hsv.v || hsv.a !== _hsv.a || !rgb && !hex)) {
				color = colord(hsv);
				rgb = color.toRgb();
				hex = color.toHex();
			} else if (rgb && (rgb.r !== _rgb.r || rgb.g !== _rgb.g || rgb.b !== _rgb.b || rgb.a !== _rgb.a || !hsv && !hex)) {
				color = colord(rgb);
				hex = color.toHex();
				hsv = color.toHsv();
			} else if (hex && (hex !== _hex || !hsv && !rgb)) {
				color = colord(hex);
				rgb = color.toRgb();
				hsv = color.toHsv();
			}

			if (color) {
				isDark = color.isDark();
			}

			if (!hex || !hsv || !rgb) return;

			// update old colors
			_hsv = $.snapshot(hsv);

			_rgb = $.snapshot(rgb);
			_hex = hex;
			_isUndefined = isUndefined;
			onInput?.({ color, hsv, rgb, hex });
		}

		function updateLetter(letter) {
			return (letterValue) => {
				if (!hsv) {
					isUndefined = false;
					_isUndefined = false;
					hsv = $.snapshot(_hsv);
				}

				hsv = { ...hsv, [letter]: letterValue };
			};
		}

		function updateLetters(letters) {
			return (color) => {
				if (!hsv) {
					isUndefined = false;
					_isUndefined = false;
					hsv = $.snapshot(_hsv);
				}

				hsv = {
					...hsv,
					...Object.fromEntries(letters.map((letter) => [letter, color[letter]]))
				};
			};
		}

		async function wrapperBoundaryCheck() {
			await tick();

			if (position === 'fixed' || !isOpen || !isDialog || !labelElement || !wrapper) return;

			const wrapperRect = wrapper.getBoundingClientRect();
			const labelRect = labelElement.getBoundingClientRect();

			if (position === 'responsive' || position === 'responsive-y') {
				const isWrapperToLow = labelRect.top + wrapperRect.height + wrapperPadding > innerHeight;

				if (isWrapperToLow) {
					wrapper.style.top = `-${wrapperRect.height + wrapperPadding}px`;
				} else {
					wrapper.style.top = `${labelRect.height + wrapperPadding}px`;
				}
			}

			if (position === 'responsive' || position === 'responsive-x') {
				if (dir === 'rtl') {
					const isWrapperToLeft = labelRect.left + labelRect.width - wrapperRect.width < 0;

					console.log(isWrapperToLeft, labelRect.left - wrapperRect.width, labelRect.left, wrapperRect.width);

					if (isWrapperToLeft) {
						wrapper.style.left = `0px`;
					} else {
						wrapper.style.left = `${labelRect.width - wrapperRect.width}px`;
					}
				} else {
					const isWrapperToRight = labelRect.left + wrapperRect.width > innerWidth;

					if (isWrapperToRight) {
						wrapper.style.left = `${labelRect.width - wrapperRect.width}px`;
					} else {
						wrapper.style.left = `0px`;
					}
				}
			}
		}

		const CPComponents = $.derived(getComponents);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<span${$.attr_class(`color-picker ${$.stringify(sliderDirection)}`, 'svelte-13rslnh')}>`);

			if (isDialog) {
				$$renderer.push('<!--[0-->');

				if (CPComponents().input) {
					$$renderer.push('<!--[-->');

					CPComponents().input($$renderer, {
						hex,
						label,
						name,
						dir,
						get labelElement() {
							return labelElement;
						},

						set labelElement($$value) {
							labelElement = $$value;
							$$settled = false;
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (name) {
				$$renderer.push(`<!--[1--><input type="hidden"${$.attr('value', hex)}${$.attr('name', name)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (CPComponents().wrapper) {
				$$renderer.push('<!--[-->');

				CPComponents().wrapper($$renderer, {
					isOpen,
					isDialog,
					get wrapper() {
						return wrapper;
					},

					set wrapper($$value) {
						wrapper = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (nullable) {
							$$renderer.push('<!--[0-->');

							if (CPComponents().nullabilityCheckbox) {
								$$renderer.push('<!--[-->');

								CPComponents().nullabilityCheckbox($$renderer, {
									texts: getTexts(),
									get isUndefined() {
										return isUndefined;
									},

									set isUndefined($$value) {
										isUndefined = $$value;
										$$settled = false;
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						Picker($$renderer, {
							components: getComponents(),
							h: hsv?.h ?? _hsv.h,
							s: hsv?.s ?? _hsv.s,
							v: hsv?.v ?? _hsv.v,
							onInput: updateLetters(['s', 'v']),
							isDark,
							texts: getTexts()
						});

						$$renderer.push(`<!----> <div class="h svelte-13rslnh">`);

						Slider($$renderer, {
							min: 0,
							max: 360,
							step: 1,
							value: hsv?.h ?? _hsv.h,
							onInput: updateLetter('h'),
							direction: sliderDirection,
							reverse: sliderDirection === 'vertical',
							ariaLabel: getTexts().label.h
						});

						$$renderer.push(`<!----></div> `);

						if (isAlpha) {
							$$renderer.push(`<!--[0--><div class="a svelte-13rslnh"${$.attr_style('', { '--alphaless-color': (hex ? hex : _hex).substring(0, 7) })}>`);

							Slider($$renderer, {
								min: 0,
								max: 1,
								step: 0.01,
								value: hsv?.a ?? _hsv.a,
								onInput: updateLetter('a'),
								direction: sliderDirection,
								reverse: sliderDirection === 'vertical',
								ariaLabel: getTexts().label.a
							});

							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (swatches && swatches.length > 0) {
							$$renderer.push('<!--[0-->');
							Swatches($$renderer, { swatches, selectSwatch, texts: getTexts() });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (isTextInput) {
							$$renderer.push('<!--[0-->');

							if (CPComponents().textInput) {
								$$renderer.push('<!--[-->');

								CPComponents().textInput($$renderer, {
									hex: hex ?? _hex,
									rgb: rgb ?? _rgb,
									hsv: hsv ?? _hsv,
									onInput: (color) => {
										if (color.hsv) {
											hsv = color.hsv;
										} else if (color.rgb) {
											rgb = color.rgb;
										} else if (color.hex) {
											hex = color.hex;
										}
									},
									isAlpha,
									textInputModes,
									texts: getTexts()
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (getComponents().a11yNotice) {
							$$renderer.push('<!--[0-->');

							if (CPComponents().a11yNotice) {
								$$renderer.push('<!--[-->');

								CPComponents().a11yNotice($$renderer, {
									components: getComponents(),
									a11yColors,
									hex: hex || '#00000000',
									a11yTexts,
									a11yLevel
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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

			$$renderer.push(`</span>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { rgb, hsv, hex, color, isDark, isOpen });
	});
}