import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'disabled',
	'range',
	'discrete',
	'tickMarks',
	'step',
	'min',
	'max',
	'minRange',
	'value',
	'start',
	'end',
	'valueToAriaValueTextFn',
	'hideFocusStylesForPointerEvents',
	'input$class'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="mdc-slider__tick-marks"></div>`);
var root_2 = $.from_html(`<div class="mdc-slider__value-indicator-container" aria-hidden="true"><div class="mdc-slider__value-indicator"><span class="mdc-slider__value-indicator-text"> </span></div></div>`);
var root_3 = $.from_html(`<div><!> <div class="mdc-slider__thumb-knob"></div> <input/></div> <div><!> <div class="mdc-slider__thumb-knob"></div> <input/></div>`, 1);
var root_4 = $.from_html(`<div><!> <div class="mdc-slider__thumb-knob"></div> <input/></div>`);
var root_5 = $.from_html(`<div><div class="mdc-slider__track"><div class="mdc-slider__track--inactive"></div> <div class="mdc-slider__track--active"><div class="mdc-slider__track--active_fill"></div></div> <!></div> <!></div>`);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		disabled = $.prop($$props, 'disabled', 3, false),
		range = $.prop($$props, 'range', 3, false),
		discrete = $.prop($$props, 'discrete', 3, false),
		tickMarks = $.prop($$props, 'tickMarks', 3, false),
		step = $.prop($$props, 'step', 3, 1),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 100),
		minRange = $.prop($$props, 'minRange', 3, 0),
		value = $.prop($$props, 'value', 15),
		start = $.prop($$props, 'start', 15),
		end = $.prop($$props, 'end', 15),
		valueToAriaValueTextFn = $.prop($$props, 'valueToAriaValueTextFn', 3, (value) => `${value}`),
		hideFocusStylesForPointerEvents = $.prop($$props, 'hideFocusStylesForPointerEvents', 3, false),
		input$class = $.prop($$props, 'input$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let input = $.state(void 0);
	let inputStart = $.state(void 0);
	let thumbEl;
	let thumbStart = undefined;
	let thumbKnob;
	let thumbKnobStart = undefined;
	let internalClasses = $.proxy({});
	let thumbStartClasses = $.proxy({});
	let thumbClasses = $.proxy({});
	let inputAttrs = $.proxy({});
	let inputStartAttrs = $.proxy({});
	let trackActiveStyles = $.proxy({});
	let thumbStyles = $.proxy({});
	let thumbStartStyles = $.proxy({});
	let thumbRippleActive = $.state(false);
	let thumbStartRippleActive = $.state(false);
	let currentTickMarks = $.state($.proxy([]));
	let inputProps = getContext('SMUI:generic:input:props') ?? {};
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let previousMin = min();

	$.user_effect(() => {
		if (min() !== previousMin) {
			if ($.get(instance)) {
				$.get(instance).setMin(min());
			}

			previousMin = min();
		}
	});

	let previousMax = max();

	$.user_effect(() => {
		if (max() !== previousMax) {
			if ($.get(instance)) {
				$.get(instance).setMax(max());
			}

			previousMax = max();
		}
	});

	let previousStep = step();

	$.user_effect(() => {
		if (step() !== previousStep) {
			if ($.get(instance)) {
				$.get(instance).setStep(step());
			}

			previousStep = step();
		}
	});

	let previousDiscrete = discrete();

	$.user_effect(() => {
		if (discrete() !== previousDiscrete) {
			if ($.get(instance)) {
				$.get(instance).setIsDiscrete(discrete());
			}

			previousDiscrete = discrete();
		}
	});

	let previousTickMarks = tickMarks();

	$.user_effect(() => {
		if (tickMarks() !== previousTickMarks) {
			if ($.get(instance)) {
				$.get(instance).setHasTickMarks(tickMarks());
			}

			previousTickMarks = tickMarks();
		}
	});

	if (tickMarks() && step() > 0) {
		const absMax = max() + Math.abs(min());

		if (range() && typeof start() === 'number' && typeof end() === 'number') {
			const absStart = start() + Math.abs(min());
			const absEnd = end() + Math.abs(min());

			$.set(
				currentTickMarks,
				[
					...Array(absStart / step()).map(() => TickMark.INACTIVE),
					...Array(absMax / step() - absStart / step() - (absMax - absEnd) / step() + 1).map(() => TickMark.ACTIVE),
					...Array((absMax - absEnd) / step()).map(() => TickMark.INACTIVE)
				],
				true
			);
		} else if (typeof value() === 'number') {
			const absValue = value() + Math.abs(min());

			$.set(
				currentTickMarks,
				[
					...Array(absValue / step() + 1).map(() => TickMark.ACTIVE),
					...Array((absMax - absValue) / step()).map(() => TickMark.INACTIVE)
				],
				true
			);
		}
	}

	if (range() && typeof start() === 'number' && typeof end() === 'number') {
		const percent = (end() - start()) / (max() - min());
		const percentStart = start() / (max() - min());
		const percentEnd = end() / (max() - min());

		trackActiveStyles.transform = `scaleX(${percent})`;
		thumbStyles.left = `calc(${percentEnd * 100}% -24px)`;
		thumbStartStyles.left = `calc(${percentStart * 100}% -24px)`;
	} else if (typeof value() === 'number') {
		const percent = value() / (max() - min());

		trackActiveStyles.transform = `scaleX(${percent})`;
		thumbStyles.left = `calc(${percent * 100}% -24px)`;
	}

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	let previousValue = value();
	let previousStart = start();
	let previousEnd = end();

	$.user_effect(() => {
		if ($.get(instance)) {
			if (previousValue !== value() && typeof value() === 'number') {
				$.get(instance).setValue(value());
			}

			if (previousStart !== start() && typeof start() === 'number') {
				$.get(instance).setValueStart(start());
			}

			if (previousEnd !== end() && typeof end() === 'number') {
				$.get(instance).setValue(end());
			}

			previousValue = value();
			previousStart = start();
			previousEnd = end();

			// Needed for range start to take effect.
			$.get(instance).layout();
		}
	});

	const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');
	const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCSliderFoundation({
				hasClass,
				addClass,
				removeClass,
				addThumbClass,
				removeThumbClass,
				getAttribute: (attribute) => getElement().getAttribute(attribute),
				getInputValue: (thumb) => `${(range() ? thumb === Thumb.START ? start() : end() : value()) ?? 0}`,
				setInputValue: (val, thumb) => {
					if (range()) {
						if (thumb === Thumb.START) {
							start(Number(val));
							previousStart = start();
						} else {
							end(Number(val));
							previousEnd = end();
						}
					} else {
						value(Number(val));
						previousValue = value();
					}
				},
				getInputAttribute: getInputAttr,
				setInputAttribute: addInputAttr,
				removeInputAttribute: removeInputAttr,
				focusInput: (thumb) => {
					if (range() && thumb === Thumb.START && $.get(inputStart)) {
						$.get(inputStart).focus();
					} else {
						$.get(input)?.focus();
					}
				},
				isInputFocused: (thumb) => (range() && thumb === Thumb.START ? $.get(inputStart) : $.get(input)) === document.activeElement,
				shouldHideFocusStylesForPointerEvents: () => hideFocusStylesForPointerEvents(),
				getThumbKnobWidth: (thumb) => ((range() && thumb === Thumb.START ? thumbKnobStart : thumbKnob) ?? thumbKnob).getBoundingClientRect().width,
				getThumbBoundingClientRect: (thumb) => ((range() && thumb === Thumb.START ? thumbStart : thumbEl) ?? thumbEl).getBoundingClientRect(),
				getBoundingClientRect: () => getElement().getBoundingClientRect(),
				getValueIndicatorContainerWidth: (thumb) => {
					return ((range() && thumb === Thumb.START ? thumbStart : thumbEl) ?? thumbEl).querySelector(`.mdc-slider__value-indicator-container`).getBoundingClientRect().width;
				},
				isRTL: () => getComputedStyle(getElement()).direction === 'rtl',
				setThumbStyleProperty: addThumbStyle,
				removeThumbStyleProperty: removeThumbStyle,
				setTrackActiveStyleProperty: addTrackActiveStyle,
				removeTrackActiveStyleProperty: removeTrackActiveStyle,
				// Handled by Svelte.
				setValueIndicatorText: (_value, _thumb) => undefined,
				getValueToAriaValueTextFn: () => valueToAriaValueTextFn(),
				updateTickMarks: (tickMarks) => {
					$.set(currentTickMarks, tickMarks, true);
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
					if (range() && thumb === Thumb.START) {
						$.set(thumbStartRippleActive, true);
					} else {
						$.set(thumbRippleActive, true);
					}
				},

				emitDragEndEvent: (_, thumb) => {
					// Emitting event is not yet implemented. See issue:
					// https://github.com/material-components/material-components-web/issues/6448
					if (range() && thumb === Thumb.START) {
						$.set(thumbStartRippleActive, false);
					} else {
						$.set(thumbRippleActive, false);
					}
				},
				registerEventHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterEventHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				registerThumbEventHandler: (thumb, evtType, handler) => {
					const el = range() && thumb === Thumb.START ? thumbStart : thumbEl;

					if (el) {
						eventManager.on(el, evtType, handler);
					}
				},

				deregisterThumbEventHandler: (thumb, evtType, handler) => {
					const el = range() && thumb === Thumb.START ? thumbStart : thumbEl;

					if (el) {
						eventManager.off(el, evtType, handler);
					}
				},

				registerInputEventHandler: (thumb, evtType, handler) => {
					const el = range() && thumb === Thumb.START ? $.get(inputStart) : $.get(input);

					if (el) {
						eventManager.on(el, evtType, handler);
					}
				},

				deregisterInputEventHandler: (thumb, evtType, handler) => {
					const el = range() && thumb === Thumb.START ? $.get(inputStart) : $.get(input);

					if (el) {
						eventManager.off(el, evtType, handler);
					}
				},
				registerBodyEventHandler: (evtType, handler) => eventManager.on(document.body, evtType, handler),
				deregisterBodyEventHandler: (evtType, handler) => eventManager.off(document.body, evtType, handler),
				registerWindowEventHandler: (evtType, handler) => eventManager.on(window, evtType, handler),
				deregisterWindowEventHandler: (evtType, handler) => eventManager.off(window, evtType, handler)
			}),
			true
		);

		const accessor = {
			get element() {
				return getElement();
			},

			activateRipple() {
				if (!disabled()) {
					$.set(thumbRippleActive, true);
				}
			},

			deactivateRipple() {
				$.set(thumbRippleActive, false);
			}
		};

		SMUIGenericInputMount && SMUIGenericInputMount(accessor);
		$.get(instance).init();
		$.get(instance).layout({ skipUpdateUI: true });

		return () => {
			SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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
		if (range() && thumb === Thumb.START) {
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
		if (range() && thumb === Thumb.START) {
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
		if (range() && thumb === Thumb.START) {
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
		if (range() && thumb === Thumb.START) {
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
		if (range() && thumb === Thumb.START) {
			if (name === 'value') {
				return `${start()}`;
			}

			return name in inputStartAttrs
				? inputStartAttrs[name] ?? null
				: $.get(inputStart)?.getAttribute(name) ?? null;
		} else {
			if (name === 'value') {
				return `${range() ? end() : value()}`;
			}

			return name in inputAttrs
				? inputAttrs[name] ?? null
				: $.get(input)?.getAttribute(name) ?? null;
		}
	}

	function addInputAttr(name, value, thumb) {
		if (range() && thumb === Thumb.START) {
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
		if (range() && thumb === Thumb.START) {
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
		return $.get(instance)?.layout();
	}

	function getId() {
		return inputProps && inputProps.id;
	}

	function getElement() {
		return element;
	}

	var $$exports = { layout, getId, getElement };
	var div = root_5();

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			...range() ? { 'data-min-range': `${minRange()}` } : {},
			...$1
		}),
		[
			() => Object.entries({
				'mdc-slider': true,
				'mdc-slider--range': range(),
				'mdc-slider--discrete': discrete(),
				'mdc-slider--tick-marks': discrete() && tickMarks(),
				'mdc-slider--disabled': disabled(),
				...internalClasses,
				[className()]: true
			}).filter(([name, value]) => name !== '' && value).map(([name]) => name).join(' '),
			() => exclude(restProps, ['input$'])
		]
	);

	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.only_child(div_2);
	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root_1();

			$.each(div_4, 21, () => $.get(currentTickMarks), $.index, ($$anchor, tickMark) => {
				var div_5 = root();

				$.template_effect(() => $.set_class(div_5, 1, $.clsx($.get(tickMark) === TickMark.ACTIVE
					? 'mdc-slider__tick-mark--active'
					: 'mdc-slider__tick-mark--inactive')));

				$.append($$anchor, div_5);
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if (discrete() && tickMarks() && step() > 0) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_3();
			var div_6 = $.first_child(fragment);
			var node_2 = $.child(div_6);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_2();
					var div_8 = $.child(div_7);
					var span = $.child(div_8);
					var text = $.only_child(span, true);

					$.reset(div_8);
					$.reset(div_7);
					$.template_effect(() => $.set_text(text, start()));
					$.append($$anchor, div_7);
				};

				$.if(node_2, ($$render) => {
					if (discrete()) $$render(consequent_1);
				});
			}

			var div_9 = $.sibling(node_2, 2);

			$.bind_this(div_9, ($$value) => thumbKnobStart = $$value, () => thumbKnobStart);

			var input_1 = $.sibling(div_9, 2);

			var event_handler = (e) => {
				dispatch(getElement(), 'blur', e);
				$$props.input$onblur?.(e);
			};

			var event_handler_1 = (e) => {
				dispatch(getElement(), 'focus', e);
				$$props.input$onfocus?.(e);
			};

			$.attribute_effect(
				input_1,
				($0, $1) => ({
					class: $0,
					type: 'range',
					disabled: disabled(),
					step: step(),
					min: min(),
					max: end(),
					...inputStartAttrs,
					...$1,
					onblur: event_handler,
					onfocus: event_handler_1
				}),
				[
					() => classMap({ 'mdc-slider__input': true, [input$class()]: true }),
					() => prefixFilter(restProps, 'input$')
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input_1, ($$value) => $.set(inputStart, $$value), () => $.get(inputStart));
			$.reset(div_6);
			$.bind_this(div_6, ($$value) => thumbStart = $$value, () => thumbStart);

			$.action(div_6, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
				unbounded: true,
				disabled: disabled(),
				active: $.get(thumbStartRippleActive),
				eventTarget: $.get(inputStart),
				activeTarget: $.get(inputStart),
				addClass: (className) => addThumbClass(className, Thumb.START),
				removeClass: (className) => removeThumbClass(className, Thumb.START),
				addStyle: (name, value) => addThumbStyle(name, value, Thumb.START)
			}));

			var div_10 = $.sibling(div_6, 2);
			var node_3 = $.child(div_10);

			{
				var consequent_2 = ($$anchor) => {
					var div_11 = root_2();
					var div_12 = $.child(div_11);
					var span_1 = $.child(div_12);
					var text_1 = $.only_child(span_1, true);

					$.reset(div_12);
					$.reset(div_11);
					$.template_effect(() => $.set_text(text_1, end()));
					$.append($$anchor, div_11);
				};

				$.if(node_3, ($$render) => {
					if (discrete()) $$render(consequent_2);
				});
			}

			var div_13 = $.sibling(node_3, 2);

			$.bind_this(div_13, ($$value) => thumbKnob = $$value, () => thumbKnob);

			var input_2 = $.sibling(div_13, 2);

			var event_handler_2 = (e) => {
				dispatch(getElement(), 'blur', e);
				$$props.input$onblur?.(e);
			};

			var event_handler_3 = (e) => {
				dispatch(getElement(), 'focus', e);
				$$props.input$onfocus?.(e);
			};

			$.attribute_effect(
				input_2,
				($0, $1) => ({
					class: $0,
					type: 'range',
					disabled: disabled(),
					step: step(),
					min: start(),
					max: max(),
					...inputProps,
					...inputAttrs,
					...$1,
					onblur: event_handler_2,
					onfocus: event_handler_3
				}),
				[
					() => classMap({ 'mdc-slider__input': true, [input$class()]: true }),
					() => prefixFilter(restProps, 'input$')
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input_2, ($$value) => $.set(input, $$value), () => $.get(input));
			$.reset(div_10);
			$.bind_this(div_10, ($$value) => thumbEl = $$value, () => thumbEl);

			$.action(div_10, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
				unbounded: true,
				disabled: disabled(),
				active: $.get(thumbRippleActive),
				eventTarget: $.get(input),
				activeTarget: $.get(input),
				addClass: (className) => addThumbClass(className, Thumb.END),
				removeClass: (className) => removeThumbClass(className, Thumb.END),
				addStyle: (name, value) => addThumbStyle(name, value, Thumb.END)
			}));

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_class(div_6, 1, $0);
					$.set_style(div_6, $1);
					$.set_class(div_10, 1, $2);
					$.set_style(div_10, $3);
				},
				[
					() => $.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbStartClasses })),
					() => Object.entries(thumbStartStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
					() => $.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbClasses })),
					() => Object.entries(thumbStyles).map(([name, value]) => `${name}: ${value};`).join(' ')
				]
			);

			$.bind_value(input_1, start);
			$.bind_value(input_2, end);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_14 = root_4();
			var node_4 = $.child(div_14);

			{
				var consequent_4 = ($$anchor) => {
					var div_15 = root_2();
					var div_16 = $.child(div_15);
					var span_2 = $.child(div_16);
					var text_2 = $.only_child(span_2, true);

					$.reset(div_16);
					$.reset(div_15);
					$.template_effect(() => $.set_text(text_2, value()));
					$.append($$anchor, div_15);
				};

				$.if(node_4, ($$render) => {
					if (discrete()) $$render(consequent_4);
				});
			}

			var div_17 = $.sibling(node_4, 2);

			$.bind_this(div_17, ($$value) => thumbKnob = $$value, () => thumbKnob);

			var input_3 = $.sibling(div_17, 2);

			var event_handler_4 = (e) => {
				dispatch(getElement(), 'blur', e);
				$$props.input$onblur?.(e);
			};

			var event_handler_5 = (e) => {
				dispatch(getElement(), 'focus', e);
				$$props.input$onfocus?.(e);
			};

			$.attribute_effect(
				input_3,
				($0, $1) => ({
					class: $0,
					type: 'range',
					disabled: disabled(),
					step: step(),
					min: min(),
					max: max(),
					...inputProps,
					...inputAttrs,
					...$1,
					onblur: event_handler_4,
					onfocus: event_handler_5
				}),
				[
					() => classMap({ 'mdc-slider__input': true, [input$class()]: true }),
					() => prefixFilter(restProps, 'input$')
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input_3, ($$value) => $.set(input, $$value), () => $.get(input));
			$.reset(div_14);
			$.bind_this(div_14, ($$value) => thumbEl = $$value, () => thumbEl);

			$.action(div_14, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
				unbounded: true,
				disabled: disabled(),
				active: $.get(thumbRippleActive),
				eventTarget: $.get(input),
				activeTarget: $.get(input),
				addClass: (className) => addThumbClass(className, Thumb.END),
				removeClass: (className) => removeThumbClass(className, Thumb.END),
				addStyle: (name, value) => addThumbStyle(name, value, Thumb.END)
			}));

			$.template_effect(
				($0, $1) => {
					$.set_class(div_14, 1, $0);
					$.set_style(div_14, $1);
				},
				[
					() => $.clsx(classMap({ 'mdc-slider__thumb': true, ...thumbClasses })),
					() => Object.entries(thumbStyles).map(([name, value]) => `${name}: ${value};`).join(' ')
				]
			);

			$.bind_value(input_3, value);
			$.append($$anchor, div_14);
		};

		$.if(node_1, ($$render) => {
			if (range()) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.template_effect(($0) => $.set_style(div_3, $0), [
		() => Object.entries(trackActiveStyles).map(([name, value]) => `${name}: ${value};`).join(' ')
	]);

	$.append($$anchor, div);

	return $.pop($$exports);
}