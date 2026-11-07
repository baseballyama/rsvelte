import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext } from 'svelte';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	dispatch,
	SvelteEventManager
} from '@smui/common/internal';

import Ripple from '@smui/ripple';
import { MDCSliderFoundation, Thumb, TickMark } from './mdc';

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether the input is disabled.
		 */
		/**
		 * Whether the input is for a range.
		 */
		/**
		 * Whether to show a discrete value indicator when sliding.
		 */
		/**
		 * Whether to show tick marks on the slider.
		 */
		/**
		 * The step in between values.
		 */
		/**
		 * The minimum value.
		 */
		/**
		 * The maximum value.
		 */
		/**
		 * The minimum range.
		 */
		/**
		 * The value of the input.
		 */
		/**
		 * The value of the start of the range.
		 */
		/**
		 * The value of the end of the range.
		 */
		/**
		 * A function that converts values to their ARIA value strings.
		 */
		/**
		 * Whether to hide focus styles when a change comes from a pointer (finger).
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			disabled = false,
			range = false,
			discrete = false,
			tickMarks = false,
			step = 1,
			min = 0,
			max = 100,
			minRange = 0,
			value = void 0,
			start = void 0,
			end = void 0,
			valueToAriaValueTextFn = (value) => `${value}`,
			hideFocusStylesForPointerEvents = false,
			input$class = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let input = void 0;
		let inputStart = void 0;
		let thumbEl;
		let thumbStart = undefined;
		let thumbKnob;
		let thumbKnobStart = undefined;
		let internalClasses = {};
		let thumbStartClasses = {};
		let thumbClasses = {};
		let inputAttrs = {};
		let inputStartAttrs = {};
		let trackActiveStyles = {};
		let thumbStyles = {};
		let thumbStartStyles = {};
		let thumbRippleActive = false;
		let thumbStartRippleActive = false;
		let currentTickMarks = [];
		let inputProps = getContext('SMUI:generic:input:props') ?? {};
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;
		let previousMin = min;
		let previousMax = max;
		let previousStep = step;
		let previousDiscrete = discrete;
		let previousTickMarks = tickMarks;

		if (tickMarks && step > 0) {
			const absMax = max + Math.abs(min);

			if (range && typeof start === 'number' && typeof end === 'number') {
				const absStart = start + Math.abs(min);
				const absEnd = end + Math.abs(min);

				currentTickMarks = [
					...Array(absStart / step).map(() => TickMark.INACTIVE),
					...Array(absMax / step - absStart / step - (absMax - absEnd) / step + 1).map(() => TickMark.ACTIVE),
					...Array((absMax - absEnd) / step).map(() => TickMark.INACTIVE)
				];
			} else if (typeof value === 'number') {
				const absValue = value + Math.abs(min);

				currentTickMarks = [
					...Array(absValue / step + 1).map(() => TickMark.ACTIVE),
					...Array((absMax - absValue) / step).map(() => TickMark.INACTIVE)
				];
			}
		}

		if (range && typeof start === 'number' && typeof end === 'number') {
			const percent = (end - start) / (max - min);
			const percentStart = start / (max - min);
			const percentEnd = end / (max - min);

			trackActiveStyles.transform = `scaleX(${percent})`;
			thumbStyles.left = `calc(${percentEnd * 100}% -24px)`;
			thumbStartStyles.left = `calc(${percentStart * 100}% -24px)`;
		} else if (typeof value === 'number') {
			const percent = value / (max - min);

			trackActiveStyles.transform = `scaleX(${percent})`;
			thumbStyles.left = `calc(${percent * 100}% -24px)`;
		}

		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		let previousValue = value;
		let previousStart = start;
		let previousEnd = end;

		// Needed for range start to take effect.
		const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');

		const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

		onMount(() => {
			instance = new MDCSliderFoundation({
				hasClass,
				addClass,
				removeClass,
				addThumbClass,
				removeThumbClass,
				getAttribute: (attribute) => getElement().getAttribute(attribute),
				getInputValue: (thumb) => `${(range ? thumb === Thumb.START ? start : end : value) ?? 0}`,
				setInputValue: (val, thumb) => {
					if (range) {
						if (thumb === Thumb.START) {
							start = Number(val);
							previousStart = start;
						} else {
							end = Number(val);
							previousEnd = end;
						}
					} else {
						value = Number(val);
						previousValue = value;
					}
				},
				getInputAttribute: getInputAttr,
				setInputAttribute: addInputAttr,
				removeInputAttribute: removeInputAttr,
				focusInput: (thumb) => {
					if (range && thumb === Thumb.START && inputStart) {
						inputStart.focus();
					} else {
						input?.focus();
					}
				},
				isInputFocused: (thumb) => (range && thumb === Thumb.START ? inputStart : input) === document.activeElement,
				shouldHideFocusStylesForPointerEvents: () => hideFocusStylesForPointerEvents,
				getThumbKnobWidth: (thumb) => ((range && thumb === Thumb.START ? thumbKnobStart : thumbKnob) ?? thumbKnob).getBoundingClientRect().width,
				getThumbBoundingClientRect: (thumb) => ((range && thumb === Thumb.START ? thumbStart : thumbEl) ?? thumbEl).getBoundingClientRect(),
				getBoundingClientRect: () => getElement().getBoundingClientRect(),
				getValueIndicatorContainerWidth: (thumb) => {
					return ((range && thumb === Thumb.START ? thumbStart : thumbEl) ?? thumbEl).querySelector(`.mdc-slider__value-indicator-container`).getBoundingClientRect().width;
				},
				isRTL: () => getComputedStyle(getElement()).direction === 'rtl',
				setThumbStyleProperty: addThumbStyle,
				removeThumbStyleProperty: removeThumbStyle,
				setTrackActiveStyleProperty: addTrackActiveStyle,
				removeTrackActiveStyleProperty: removeTrackActiveStyle,
				// Handled by Svelte.
				setValueIndicatorText: (_value, _thumb) => undefined,
				getValueToAriaValueTextFn: () => valueToAriaValueTextFn,
				updateTickMarks: (tickMarks) => {
					currentTickMarks = tickMarks;
				},

				setPointerCapture: (pointerId) => {
					getElement().setPointerCapture(pointerId);
				},

				emitChangeEvent: (value, thumb) => {
					dispatch(getElement(), 'SMUISliderChange', { value, thumb });
				},

				emitInputEvent: (value, thumb) => {
					dispatch(getElement(), 'SMUISliderInput', { value, thumb });
				},

				emitDragStartEvent: (_, thumb) => {
					// Emitting event is not yet implemented. See issue:
					// https://github.com/material-components/material-components-web/issues/6448
					if (range && thumb === Thumb.START) {
						thumbStartRippleActive = true;
					} else {
						thumbRippleActive = true;
					}
				},

				emitDragEndEvent: (_, thumb) => {
					// Emitting event is not yet implemented. See issue:
					// https://github.com/material-components/material-components-web/issues/6448
					if (range && thumb === Thumb.START) {
						thumbStartRippleActive = false;
					} else {
						thumbRippleActive = false;
					}
				},
				registerEventHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterEventHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				registerThumbEventHandler: (thumb, evtType, handler) => {
					const el = range && thumb === Thumb.START ? thumbStart : thumbEl;

					if (el) {
						eventManager.on(el, evtType, handler);
					}
				},

				deregisterThumbEventHandler: (thumb, evtType, handler) => {
					const el = range && thumb === Thumb.START ? thumbStart : thumbEl;

					if (el) {
						eventManager.off(el, evtType, handler);
					}
				},

				registerInputEventHandler: (thumb, evtType, handler) => {
					const el = range && thumb === Thumb.START ? inputStart : input;

					if (el) {
						eventManager.on(el, evtType, handler);
					}
				},

				deregisterInputEventHandler: (thumb, evtType, handler) => {
					const el = range && thumb === Thumb.START ? inputStart : input;

					if (el) {
						eventManager.off(el, evtType, handler);
					}
				},
				registerBodyEventHandler: (evtType, handler) => eventManager.on(document.body, evtType, handler),
				deregisterBodyEventHandler: (evtType, handler) => eventManager.off(document.body, evtType, handler),
				registerWindowEventHandler: (evtType, handler) => eventManager.on(window, evtType, handler),
				deregisterWindowEventHandler: (evtType, handler) => eventManager.off(window, evtType, handler)
			});

			const accessor = {
				get element() {
					return getElement();
				},

				activateRipple() {
					if (!disabled) {
						thumbRippleActive = true;
					}
				},

				deactivateRipple() {
					thumbRippleActive = false;
				}
			};

			SMUIGenericInputMount && SMUIGenericInputMount(accessor);
			instance.init();
			instance.layout({ skipUpdateUI: true });

			return () => {
				SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
				instance?.destroy();
				instance = undefined;
				eventManager.clear();
			};
		});

		onDestroy(() => {
			if (removeLayoutListener) {
				removeLayoutListener();
			}
		});

		function hasClass(className) {
			return className in internalClasses
				? internalClasses[className]
				: getElement().classList.contains(className);
		}

		function addClass(className) {
			if (!internalClasses[className]) {
				internalClasses[className] = true;
			}
		}

		function removeClass(className) {
			if (!(className in internalClasses) || internalClasses[className]) {
				internalClasses[className] = false;
			}
		}

		function addThumbClass(className, thumb) {
			if (range && thumb === Thumb.START) {
				if (!thumbStartClasses[className]) {
					thumbStartClasses[className] = true;
				}
			} else {
				if (!thumbClasses[className]) {
					thumbClasses[className] = true;
				}
			}
		}

		function removeThumbClass(className, thumb) {
			if (range && thumb === Thumb.START) {
				if (!(className in thumbStartClasses) || thumbStartClasses[className]) {
					thumbStartClasses[className] = false;
				}
			} else {
				if (!(className in thumbClasses) || thumbClasses[className]) {
					thumbClasses[className] = false;
				}
			}
		}

		function addThumbStyle(name, value, thumb) {
			if (range && thumb === Thumb.START) {
				if (thumbStartStyles[name] != value) {
					if (value === '' || value == null) {
						delete thumbStartStyles[name];
					} else {
						thumbStartStyles[name] = value;
					}
				}
			} else {
				if (thumbStyles[name] != value) {
					if (value === '' || value == null) {
						delete thumbStyles[name];
					} else {
						thumbStyles[name] = value;
					}
				}
			}
		}

		function removeThumbStyle(name, thumb) {
			if (range && thumb === Thumb.START) {
				if (name in thumbStartStyles) {
					delete thumbStartStyles[name];
				}
			} else {
				if (name in thumbStyles) {
					delete thumbStyles[name];
				}
			}
		}

		function getInputAttr(name, thumb) {
			// Some custom logic for "value", since Svelte doesn't seem to actually
			// set the attribute, just the DOM property.
			if (range && thumb === Thumb.START) {
				if (name === 'value') {
					return `${start}`;
				}

				return name in inputStartAttrs
					? inputStartAttrs[name] ?? null
					: inputStart?.getAttribute(name) ?? null;
			} else {
				if (name === 'value') {
					return `${range ? end : value}`;
				}

				return name in inputAttrs
					? inputAttrs[name] ?? null
					: input?.getAttribute(name) ?? null;
			}
		}

		function addInputAttr(name, value, thumb) {
			if (range && thumb === Thumb.START) {
				if (inputStartAttrs[name] !== value) {
					inputStartAttrs[name] = value;
				}
			} else {
				if (inputAttrs[name] !== value) {
					inputAttrs[name] = value;
				}
			}
		}

		function removeInputAttr(name, thumb) {
			if (range && thumb === Thumb.START) {
				if (!(name in inputStartAttrs) || inputStartAttrs[name] != null) {
					inputStartAttrs[name] = undefined;
				}
			} else {
				if (!(name in inputAttrs) || inputAttrs[name] != null) {
					inputAttrs[name] = undefined;
				}
			}
		}

		function addTrackActiveStyle(name, value) {
			if (trackActiveStyles[name] != value) {
				if (value === '' || value == null) {
					delete trackActiveStyles[name];
				} else {
					trackActiveStyles[name] = value;
				}
			}
		}

		function removeTrackActiveStyle(name) {
			if (name in trackActiveStyles) {
				delete trackActiveStyles[name];
			}
		}

		function layout() {
			return instance?.layout();
		}

		function getId() {
			return inputProps && inputProps.id;
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(Object.entries({
				'mdc-slider': true,
				'mdc-slider--range': range,
				'mdc-slider--discrete': discrete,
				'mdc-slider--tick-marks': discrete && tickMarks,
				'mdc-slider--disabled': disabled,
				...internalClasses,
				[className]: true
			}).filter(([name, value]) => name !== '' && value).map(([name]) => name).join(' ')),
			...range ? { 'data-min-range': `${minRange}` } : {},
			...exclude(restProps, ['input$'])
		})}><div class="mdc-slider__track"><div class="mdc-slider__track--inactive"></div> <div class="mdc-slider__track--active"><div class="mdc-slider__track--active_fill"${$.attr_style(Object.entries(trackActiveStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}></div></div> `);

		if (discrete && tickMarks && step > 0) {
			$$renderer.push(`<!--[0--><div class="mdc-slider__tick-marks"><!--[-->`);

			const each_array = $.ensure_array_like(currentTickMarks);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tickMark = each_array[$$index];

				$$renderer.push(`<div${$.attr_class($.clsx(tickMark === TickMark.ACTIVE
					? 'mdc-slider__tick-mark--active'
					: 'mdc-slider__tick-mark--inactive'))}></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (range) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbStartClasses })))}${$.attr_style(Object.entries(thumbStartStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}>`);

			if (discrete) {
				$$renderer.push(`<!--[0--><div class="mdc-slider__value-indicator-container" aria-hidden="true"><div class="mdc-slider__value-indicator"><span class="mdc-slider__value-indicator-text">${$.escape(start)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mdc-slider__thumb-knob"></div> <input${$.attributes(
				{
					class: $.clsx(classMap({ 'mdc-slider__input': true, [input$class]: true })),
					type: 'range',
					disabled,
					step,
					min,
					max: end,
					value: start,
					...inputStartAttrs,
					...prefixFilter(restProps, 'input$')
				},
				void 0,
				void 0,
				void 0,
				4
			)}/></div> <div${$.attr_class($.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbClasses })))}${$.attr_style(Object.entries(thumbStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}>`);

			if (discrete) {
				$$renderer.push(`<!--[0--><div class="mdc-slider__value-indicator-container" aria-hidden="true"><div class="mdc-slider__value-indicator"><span class="mdc-slider__value-indicator-text">${$.escape(end)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mdc-slider__thumb-knob"></div> <input${$.attributes(
				{
					class: $.clsx(classMap({ 'mdc-slider__input': true, [input$class]: true })),
					type: 'range',
					disabled,
					step,
					min: start,
					max,
					value: end,
					...inputProps,
					...inputAttrs,
					...prefixFilter(restProps, 'input$')
				},
				void 0,
				void 0,
				void 0,
				4
			)}/></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbClasses })))}${$.attr_style(Object.entries(thumbStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}>`);

			if (discrete) {
				$$renderer.push(`<!--[0--><div class="mdc-slider__value-indicator-container" aria-hidden="true"><div class="mdc-slider__value-indicator"><span class="mdc-slider__value-indicator-text">${$.escape(value)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mdc-slider__thumb-knob"></div> <input${$.attributes(
				{
					class: $.clsx(classMap({ 'mdc-slider__input': true, [input$class]: true })),
					type: 'range',
					disabled,
					step,
					min,
					max,
					value,
					...inputProps,
					...inputAttrs,
					...prefixFilter(restProps, 'input$')
				},
				void 0,
				void 0,
				void 0,
				4
			)}/></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, start, end, layout, getId, getElement });
	});
}