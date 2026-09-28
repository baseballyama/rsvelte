import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<input type="hidden"/>`);
var root_1 = $.from_html(`<div class="a svelte-13rslnh"><!></div>`);
var root_2 = $.from_html(`<!> <!> <div class="h svelte-13rslnh"><!></div> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<span><!> <!></span>`);

export default function ColorPicker($$anchor, $$props) {
	$.push($$props, true);

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
	let components = $.prop($$props, 'components', 19, () => ({})),
		label = $.prop($$props, 'label', 3, 'Choose a color'),
		name = $.prop($$props, 'name', 3, undefined),
		nullable = $.prop($$props, 'nullable', 3, false),
		rgb = $.prop($$props, 'rgb', 31, () => $.proxy(nullable() ? null : { r: 255, g: 0, b: 0, a: 1 })),
		hsv = $.prop($$props, 'hsv', 31, () => $.proxy(nullable() ? null : { h: 0, s: 100, v: 100, a: 1 })),
		hex = $.prop($$props, 'hex', 31, () => $.proxy(nullable() ? null : '#ff0000')),
		color = $.prop($$props, 'color', 15, null),
		isDark = $.prop($$props, 'isDark', 15, false),
		isAlpha = $.prop($$props, 'isAlpha', 3, true),
		isDialog = $.prop($$props, 'isDialog', 3, true),
		isOpen = $.prop($$props, 'isOpen', 31, () => !isDialog()),
		position = $.prop($$props, 'position', 3, 'responsive'),
		dir = $.prop($$props, 'dir', 3, 'ltr'),
		isTextInput = $.prop($$props, 'isTextInput', 3, true),
		textInputModes = $.prop($$props, 'textInputModes', 19, () => ['hex', 'rgb', 'hsv']),
		sliderDirection = $.prop($$props, 'sliderDirection', 3, 'vertical'),
		disableCloseClickOutside = $.prop($$props, 'disableCloseClickOutside', 3, false),
		a11yColors = $.prop($$props, 'a11yColors', 19, () => [{ bgHex: '#ffffff' }]),
		a11yLevel = $.prop($$props, 'a11yLevel', 3, 'AA'),
		texts = $.prop($$props, 'texts', 3, undefined),
		a11yTexts = $.prop($$props, 'a11yTexts', 3, undefined);

	/**
	 * Internal old values to trigger color conversion
	 */
	let _rgb = $.state($.proxy({ r: 255, g: 0, b: 0, a: 1 }));

	let _hsv = $.state($.proxy({ h: 0, s: 100, v: 100, a: 1 }));
	let _hex = $.state('#ff0000');
	let isUndefined = $.state(false);

	// svelte-ignore state_referenced_locally
	let _isUndefined = $.state($.proxy($.get(isUndefined)));

	let spanElement = $.state(void 0);
	let labelElement = $.state(void 0);
	let wrapper = $.state(void 0);
	let trap = undefined;
	let innerWidth = $.state(1080);
	let innerHeight = $.state(720);
	const wrapperPadding = 12;

	const default_components = {
		pickerIndicator: PickerIndicator,
		textInput: TextInput,
		input: Input,
		nullabilityCheckbox: NullabilityCheckbox,
		wrapper: Wrapper
	};

	function getComponents() {
		return { ...default_components, ...components() };
	}

	function getTexts() {
		return {
			label: { ...defaultTexts.label, ...texts()?.label },
			color: { ...defaultTexts.color, ...texts()?.color },
			changeTo: texts()?.changeTo ?? defaultTexts.changeTo,
			swatch: { ...texts()?.swatch, ...defaultTexts.swatch }
		};
	}

	function mousedown({ target }) {
		if (isDialog()) {
			if ($.get(labelElement)?.contains(target) || $.get(labelElement)?.isSameNode(target)) {
				isOpen(!isOpen());
			} else if (isOpen() && !$.get(wrapper)?.contains(target) && !disableCloseClickOutside()) {
				isOpen(false);
			}
		}
	}

	function keyup({ key, target }) {
		if (!isDialog() || !$.get(labelElement) || !$.get(spanElement)) {
			return;
		} else if (key === 'Enter' && $.get(labelElement).contains(target)) {
			isOpen(!isOpen());

			setTimeout(() => {
				if ($.get(wrapper)) trap = trapFocus($.get(wrapper));
			});
		} else if (key === 'Escape' && isOpen()) {
			isOpen(false);

			if ($.get(spanElement).contains(target)) {
				$.get(labelElement)?.focus();
				trap?.destroy();
			}
		}
	}

	function selectSwatch(color) {
		hex(color);
		hsv(colord(color).toHsv());
		rgb(colord(color).toRgb());
		$.set(_isUndefined, false);
		$.set(isUndefined, false);
		updateColor();
	}

	function hasColorChanged() {
		return !(hsv() && rgb() && hsv().h === $.get(_hsv).h && hsv().s === $.get(_hsv).s && hsv().v === $.get(_hsv).v && hsv().a === $.get(_hsv).a && rgb().r === $.get(_rgb).r && rgb().g === $.get(_rgb).g && rgb().b === $.get(_rgb).b && rgb().a === $.get(_rgb).a && hex() === $.get(_hex));
	}

	/**
	 * using a function seems to trigger the exported value change only once when all of them has been updated
	 * and not just after the hsv change
	 */
	function updateColor() {
		if ($.get(isUndefined) && !$.get(_isUndefined)) {
			$.set(_isUndefined, true);
			hsv(null);
			rgb(null);
			hex(null);
			$$props.onInput?.({ color: color(), hsv: hsv(), rgb: rgb(), hex: hex() });

			return;
		} else if ($.get(_isUndefined) && !$.get(isUndefined)) {
			$.set(_isUndefined, false);
			hsv($.snapshot($.get(_hsv)));
			rgb($.snapshot($.get(_rgb)));
			hex($.snapshot($.get(_hex)));
			$$props.onInput?.({ color: color(), hsv: hsv(), rgb: rgb(), hex: hex() });

			return;
		} else if (!hsv() && !rgb() && !hex()) {
			$.set(isUndefined, $.set(_isUndefined, true), true);
			$$props.onInput?.({ color: null, hsv: hsv(), rgb: rgb(), hex: hex() });

			return;
		} else if (!hasColorChanged()) {
			return;
		}

		$.set(isUndefined, false);

		// reinitialize empty alpha values
		if (hsv() && hsv().a === undefined) hsv({ ...hsv(), a: 1 });

		if ($.get(_hsv).a === undefined) $.set(_hsv, { ...$.get(_hsv), a: 1 }, true);
		if (rgb() && rgb().a === undefined) rgb({ ...rgb(), a: 1 });
		if ($.get(_rgb).a === undefined) $.set(_rgb, { ...$.get(_rgb), a: 1 }, true);
		if (hex()?.substring(7) === 'ff') hex(hex().substring(0, 7));
		if ($.get(_hex)?.substring(7) === 'ff') $.set(_hex, $.get(_hex).substring(0, 7), true);

		// triggers color computation from the color that changed or if it is the only color defined
		if (hsv() && (hsv().h !== $.get(_hsv).h || hsv().s !== $.get(_hsv).s || hsv().v !== $.get(_hsv).v || hsv().a !== $.get(_hsv).a || !rgb() && !hex())) {
			color(colord(hsv()));
			rgb(color().toRgb());
			hex(color().toHex());
		} else if (rgb() && (rgb().r !== $.get(_rgb).r || rgb().g !== $.get(_rgb).g || rgb().b !== $.get(_rgb).b || rgb().a !== $.get(_rgb).a || !hsv() && !hex())) {
			color(colord(rgb()));
			hex(color().toHex());
			hsv(color().toHsv());
		} else if (hex() && (hex() !== $.get(_hex) || !hsv() && !rgb())) {
			color(colord(hex()));
			rgb(color().toRgb());
			hsv(color().toHsv());
		}

		if (color()) {
			isDark(color().isDark());
		}

		if (!hex() || !hsv() || !rgb()) return;

		// update old colors
		$.set(_hsv, $.snapshot(hsv()), true);

		$.set(_rgb, $.snapshot(rgb()), true);
		$.set(_hex, hex(), true);
		$.set(_isUndefined, $.get(isUndefined), true);
		$$props.onInput?.({ color: color(), hsv: hsv(), rgb: rgb(), hex: hex() });
	}

	$.user_effect(() => {
		if (hsv() || rgb() || hex()) updateColor();
	});

	$.user_effect(() => {
		$.get(isUndefined);
		updateColor();
	});

	function updateLetter(letter) {
		return (letterValue) => {
			if (!hsv()) {
				$.set(isUndefined, false);
				$.set(_isUndefined, false);
				hsv($.snapshot($.get(_hsv)));
			}

			hsv({ ...hsv(), [letter]: letterValue });
		};
	}

	function updateLetters(letters) {
		return (color) => {
			if (!hsv()) {
				$.set(isUndefined, false);
				$.set(_isUndefined, false);
				hsv($.snapshot($.get(_hsv)));
			}

			hsv({
				...hsv(),
				...Object.fromEntries(letters.map((letter) => [letter, color[letter]]))
			});
		};
	}

	async function wrapperBoundaryCheck() {
		await tick();

		if (position() === 'fixed' || !isOpen() || !isDialog() || !$.get(labelElement) || !$.get(wrapper)) return;

		const wrapperRect = $.get(wrapper).getBoundingClientRect();
		const labelRect = $.get(labelElement).getBoundingClientRect();

		if (position() === 'responsive' || position() === 'responsive-y') {
			const isWrapperToLow = labelRect.top + wrapperRect.height + wrapperPadding > $.get(innerHeight);

			if (isWrapperToLow) {
				$.get(wrapper).style.top = `-${wrapperRect.height + wrapperPadding}px`;
			} else {
				$.get(wrapper).style.top = `${labelRect.height + wrapperPadding}px`;
			}
		}

		if (position() === 'responsive' || position() === 'responsive-x') {
			if (dir() === 'rtl') {
				const isWrapperToLeft = labelRect.left + labelRect.width - wrapperRect.width < 0;

				console.log(isWrapperToLeft, labelRect.left - wrapperRect.width, labelRect.left, wrapperRect.width);

				if (isWrapperToLeft) {
					$.get(wrapper).style.left = `0px`;
				} else {
					$.get(wrapper).style.left = `${labelRect.width - wrapperRect.width}px`;
				}
			} else {
				const isWrapperToRight = labelRect.left + wrapperRect.width > $.get(innerWidth);

				if (isWrapperToRight) {
					$.get(wrapper).style.left = `${labelRect.width - wrapperRect.width}px`;
				} else {
					$.get(wrapper).style.left = `0px`;
				}
			}
		}
	}

	$.user_effect(() => {
		if ($.get(innerWidth) && $.get(innerHeight) && isOpen()) wrapperBoundaryCheck();
	});

	const CPComponents = $.derived(getComponents);
	var span = root_3();

	$.event('mousedown', $.window, mousedown);
	$.event('keyup', $.window, keyup);
	$.event('scroll', $.window, wrapperBoundaryCheck);

	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => $.get(CPComponents).input, ($$anchor, CPComponents_input) => {
				CPComponents_input($$anchor, {
					get hex() {
						return hex();
					},

					get label() {
						return label();
					},

					get name() {
						return name();
					},

					get dir() {
						return dir();
					},

					get labelElement() {
						return $.get(labelElement);
					},

					set labelElement($$value) {
						$.set(labelElement, $$value, true);
					}
				});
			});

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var input = root();

			$.remove_input_defaults(input);

			$.template_effect(() => {
				$.set_value(input, hex());
				$.set_attribute(input, 'name', name());
			});

			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if (isDialog()) $$render(consequent); else if (name()) $$render(consequent_1, 1);
		});
	}

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => $.get(CPComponents).wrapper, ($$anchor, CPComponents_wrapper) => {
		CPComponents_wrapper($$anchor, {
			get isOpen() {
				return isOpen();
			},

			get isDialog() {
				return isDialog();
			},

			get wrapper() {
				return $.get(wrapper);
			},

			set wrapper($$value) {
				$.set(wrapper, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						{
							let $0 = $.derived(getTexts);

							$.component(node_4, () => $.get(CPComponents).nullabilityCheckbox, ($$anchor, CPComponents_nullabilityCheckbox) => {
								CPComponents_nullabilityCheckbox($$anchor, {
									get texts() {
										return $.get($0);
									},

									get isUndefined() {
										return $.get(isUndefined);
									},

									set isUndefined($$value) {
										$.set(isUndefined, $$value, true);
									}
								});
							});
						}

						$.append($$anchor, fragment_2);
					};

					$.if(node_3, ($$render) => {
						if (nullable()) $$render(consequent_2);
					});
				}

				var node_5 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(getComponents);
					let $1 = $.derived(() => hsv()?.h ?? $.get(_hsv).h);
					let $2 = $.derived(() => hsv()?.s ?? $.get(_hsv).s);
					let $3 = $.derived(() => hsv()?.v ?? $.get(_hsv).v);
					let $4 = $.derived(() => updateLetters(['s', 'v']));
					let $5 = $.derived(getTexts);

					Picker(node_5, {
						get components() {
							return $.get($0);
						},

						get h() {
							return $.get($1);
						},

						get s() {
							return $.get($2);
						},

						get v() {
							return $.get($3);
						},

						get onInput() {
							return $.get($4);
						},

						get isDark() {
							return isDark();
						},

						get texts() {
							return $.get($5);
						}
					});
				}

				var div = $.sibling(node_5, 2);
				var node_6 = $.child(div);

				{
					let $0 = $.derived(() => hsv()?.h ?? $.get(_hsv).h);
					let $1 = $.derived(() => updateLetter('h'));
					let $2 = $.derived(() => sliderDirection() === 'vertical');
					let $3 = $.derived(() => getTexts().label.h);

					Slider(node_6, {
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get($0);
						},

						get onInput() {
							return $.get($1);
						},

						get direction() {
							return sliderDirection();
						},

						get reverse() {
							return $.get($2);
						},

						get ariaLabel() {
							return $.get($3);
						}
					});
				}

				$.reset(div);

				var node_7 = $.sibling(div, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_1 = root_1();
						let styles;
						var node_8 = $.child(div_1);

						{
							let $0 = $.derived(() => hsv()?.a ?? $.get(_hsv).a);
							let $1 = $.derived(() => updateLetter('a'));
							let $2 = $.derived(() => sliderDirection() === 'vertical');
							let $3 = $.derived(() => getTexts().label.a);

							Slider(node_8, {
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return $.get($0);
								},

								get onInput() {
									return $.get($1);
								},

								get direction() {
									return sliderDirection();
								},

								get reverse() {
									return $.get($2);
								},

								get ariaLabel() {
									return $.get($3);
								}
							});
						}

						$.reset(div_1);
						$.template_effect(($0) => styles = $.set_style(div_1, '', styles, { '--alphaless-color': $0 }), [() => (hex() ? hex() : $.get(_hex)).substring(0, 7)]);
						$.append($$anchor, div_1);
					};

					$.if(node_7, ($$render) => {
						if (isAlpha()) $$render(consequent_3);
					});
				}

				var node_9 = $.sibling(node_7, 2);

				{
					var consequent_4 = ($$anchor) => {
						{
							let $0 = $.derived(getTexts);

							Swatches($$anchor, {
								get swatches() {
									return $$props.swatches;
								},
								selectSwatch,
								get texts() {
									return $.get($0);
								}
							});
						}
					};

					$.if(node_9, ($$render) => {
						if ($$props.swatches && $$props.swatches.length > 0) $$render(consequent_4);
					});
				}

				var node_10 = $.sibling(node_9, 2);

				{
					var consequent_5 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_11 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => hex() ?? $.get(_hex));
							let $1 = $.derived(() => rgb() ?? $.get(_rgb));
							let $2 = $.derived(() => hsv() ?? $.get(_hsv));
							let $3 = $.derived(getTexts);

							$.component(node_11, () => $.get(CPComponents).textInput, ($$anchor, CPComponents_textInput) => {
								CPComponents_textInput($$anchor, {
									get hex() {
										return $.get($0);
									},

									get rgb() {
										return $.get($1);
									},

									get hsv() {
										return $.get($2);
									},

									onInput: (color) => {
										if (color.hsv) {
											hsv(color.hsv);
										} else if (color.rgb) {
											rgb(color.rgb);
										} else if (color.hex) {
											hex(color.hex);
										}
									},

									get isAlpha() {
										return isAlpha();
									},

									get textInputModes() {
										return textInputModes();
									},

									get texts() {
										return $.get($3);
									}
								});
							});
						}

						$.append($$anchor, fragment_4);
					};

					$.if(node_10, ($$render) => {
						if (isTextInput()) $$render(consequent_5);
					});
				}

				var node_12 = $.sibling(node_10, 2);

				{
					var consequent_6 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_13 = $.first_child(fragment_5);

						{
							let $0 = $.derived(getComponents);
							let $1 = $.derived(() => hex() || '#00000000');

							$.component(node_13, () => $.get(CPComponents).a11yNotice, ($$anchor, CPComponents_a11yNotice) => {
								CPComponents_a11yNotice($$anchor, {
									get components() {
										return $.get($0);
									},

									get a11yColors() {
										return a11yColors();
									},

									get hex() {
										return $.get($1);
									},

									get a11yTexts() {
										return a11yTexts();
									},

									get a11yLevel() {
										return a11yLevel();
									}
								});
							});
						}

						$.append($$anchor, fragment_5);
					};

					var d = $.derived(() => getComponents().a11yNotice);

					$.if(node_12, ($$render) => {
						if ($.get(d)) $$render(consequent_6);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(span);
	$.bind_this(span, ($$value) => $.set(spanElement, $$value), () => $.get(spanElement));
	$.template_effect(() => $.set_class(span, 1, `color-picker ${sliderDirection() ?? ''}`, 'svelte-13rslnh'));
	$.bind_window_size('innerWidth', ($$value) => $.set(innerWidth, $$value, true));
	$.bind_window_size('innerHeight', ($$value) => $.set(innerHeight, $$value, true));
	$.append($$anchor, span);
	$.pop();
}