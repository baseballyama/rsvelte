import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext, tick } from 'svelte';
import { events } from '@smui/common/dom';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	dispatch,
	SvelteEventManager
} from '@smui/common/internal';

import { ContextFragment } from '@smui/common';
import Ripple from '@smui/ripple';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import NotchedOutline from '@smui/notched-outline';
import { MDCTextFieldFoundation } from './mdc';
import HelperLine from './HelperLine.svelte';
import Prefix from './Prefix.svelte';
import Suffix from './Suffix.svelte';
import Input from './Input.svelte';
import Textarea from './Textarea.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'disabled',
	'required',
	'textarea',
	'variant',
	'noLabel',
	'label',
	'type',
	'value',
	'files',
	'invalid',
	'updateInvalid',
	'initialInvalid',
	'dirty',
	'prefix',
	'suffix',
	'validateOnValueChange',
	'useNativeValidation',
	'withLeadingIcon',
	'withTrailingIcon',
	'input',
	'floatingLabel',
	'lineRipple',
	'notchedOutline',
	'children',
	'leadingIcon',
	'trailingIcon',
	'internalCounter',
	'line',
	'helper'
]);

var root = $.from_html(`<span class="mdc-text-field__ripple"></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span><!> <!></span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<label><!> <!> <!> <!> <!> <!> <!></label>`);
var root_5 = $.from_html(`<div><!> <!> <!> <!> <!></div>`);

export default function Textfield($$anchor, $$props) {
	$.push($$props, true);

	const { applyPassive } = events;
	let uninitializedValue = () => {};

	function isUninitializedValue(value) {
		return value === uninitializedValue;
	}

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	/**
	 * Whether to show a ripple animation.
	 */
	/**
	 * Whether the input is disabled.
	 */
	/**
	 * Whether the input is required.
	 */
	/**
	 * Whether the input is a textarea.
	 */
	/**
	 * The styling variant of the input.
	 */
	/**
	 * Do not use a label.
	 */
	/**
	 * The label or a spot for the label.
	 */
	/**
	 * The input type.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * The selected files of the input if it is "file" type.
	 */
	/**
	 * Whether the input is invalid.
	 */
	/**
	 * Set to false to prevent updating the value passed to invalid.
	 *
	 * Defaults to true if and only if the invalid prop was not explicitly set.
	 */
	/**
	 * Set to true to update the invalid state immediately on instantiation.
	 */
	/**
	 * Whether the input has been changed.
	 */
	/**
	 * The prefix on the input or a spot for the prefix.
	 */
	/**
	 * The suffix on the input or a spot for the suffix.
	 */
	/**
	 * Whether to validate the input when its value is changed.
	 */
	/**
	 * Whether to use the browser's native validation.
	 */
	/**
	 * Whether a leading icon will be included after instantiation.
	 */
	/**
	 * Whether a trailing icon will be included after instantiation.
	 */
	/**
	 * The input component if setting up manually.
	 */
	/**
	 * The floating label component if setting up manually.
	 */
	/**
	 * The line ripple component if setting up manually.
	 */
	/**
	 * The notched outline component if setting up manually.
	 */
	/**
	 * A spot for the leading icon.
	 */
	/**
	 * A spot for the trailing icon.
	 */
	/**
	 * A spot for the internal character counter component.
	 */
	/**
	 * A spot for the line ripple.
	 *
	 * This used to be the "ripple" slot.
	 */
	/**
	 * A spot for the helper line.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		disabled = $.prop($$props, 'disabled', 3, false),
		required = $.prop($$props, 'required', 3, false),
		textarea = $.prop($$props, 'textarea', 3, false),
		variant = $.prop($$props, 'variant', 19, () => textarea() ? 'outlined' : 'standard'),
		noLabel = $.prop($$props, 'noLabel', 3, false),
		type = $.prop($$props, 'type', 3, 'text'),
		value = $.prop($$props, 'value', 15),
		files = $.prop($$props, 'files', 15, uninitializedValue),
		invalid = $.prop($$props, 'invalid', 15, uninitializedValue),
		updateInvalid = $.prop($$props, 'updateInvalid', 19, () => isUninitializedValue(invalid())),
		propInitialInvalid = $.prop($$props, 'initialInvalid', 3, false),
		dirty = $.prop($$props, 'dirty', 15, false),
		validateOnValueChange = $.prop($$props, 'validateOnValueChange', 19, updateInvalid),
		useNativeValidation = $.prop($$props, 'useNativeValidation', 19, updateInvalid),
		withLeadingIcon = $.prop($$props, 'withLeadingIcon', 3, uninitializedValue),
		withTrailingIcon = $.prop($$props, 'withTrailingIcon', 3, uninitializedValue),
		input = $.prop($$props, 'input', 7),
		floatingLabel = $.prop($$props, 'floatingLabel', 7),
		lineRipple = $.prop($$props, 'lineRipple', 7),
		notchedOutline = $.prop($$props, 'notchedOutline', 7),
		restProps = $.rest_props($$props, rest_excludes);

	// Some trickery to detect uninitialized values but also have the right types.
	const valued = value() !== undefined || value() === undefined && $$props.input$emptyValueUndefined || !isUninitializedValue(files());

	if (isUninitializedValue(files())) {
		files(null);
	}

	if (isUninitializedValue(invalid())) {
		invalid(false);
	}

	// Done with the trickery.
	let element;

	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let helperId = $.state(undefined);
	let focused = $.state(false);
	let initialInvalid = $.state($.proxy(propInitialInvalid()));
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let initPromiseResolve;
	let initPromise = new Promise((resolve) => initPromiseResolve = resolve);

	// These are instances, not accessors.
	let leadingIconInstance = undefined;

	let trailingIconInstance = undefined;
	let helperTextInstance = undefined;
	let characterCounterInstance = undefined;
	const inputElement = $.derived(() => input() && input().getElement());

	$.user_effect(() => {
		if ((dirty() || $.get(initialInvalid) || !updateInvalid()) && $.get(instance) && $.get(instance).isValid() !== !invalid()) {
			if (updateInvalid()) {
				invalid(!$.get(instance).isValid());
			} else {
				$.get(instance).setValid(!invalid());
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getValidateOnValueChange() !== validateOnValueChange()) {
			$.get(instance).setValidateOnValueChange(isUninitializedValue(validateOnValueChange()) ? false : validateOnValueChange());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setUseNativeValidation(isUninitializedValue(useNativeValidation()) ? true : useNativeValidation());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setDisabled(disabled());
		}
	});

	// React to changes of value from outside component.
	let previousValue = value();

	$.user_effect(() => {
		if ($.get(instance) && valued && previousValue !== value()) {
			previousValue = value();

			// Check the data is flowing down.
			const stringValue = `${value() == null ? '' : value()}`;

			if ($.get(instance).getValue() !== stringValue) {
				$.get(instance).setValue(stringValue);
			}
		}
	});

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	setContext('SMUI:textfield:leading-icon:mount', (accessor) => {
		leadingIconInstance = accessor;
	});

	setContext('SMUI:textfield:leading-icon:unmount', () => {
		leadingIconInstance = undefined;
	});

	setContext('SMUI:textfield:trailing-icon:mount', (accessor) => {
		trailingIconInstance = accessor;
	});

	setContext('SMUI:textfield:trailing-icon:unmount', () => {
		trailingIconInstance = undefined;
	});

	setContext('SMUI:textfield:helper-text:id', (id) => {
		$.set(helperId, id, true);
	});

	setContext('SMUI:textfield:helper-text:mount', (accessor) => {
		helperTextInstance = accessor;
	});

	setContext('SMUI:textfield:helper-text:unmount', () => {
		$.set(helperId, undefined);
		helperTextInstance = undefined;
	});

	setContext('SMUI:textfield:character-counter:mount', (accessor) => {
		characterCounterInstance = accessor;
	});

	setContext('SMUI:textfield:character-counter:unmount', () => {
		characterCounterInstance = undefined;
	});

	onMount(() => {
		$.set(
			instance,
			new MDCTextFieldFoundation(
				{
					// getRootAdapterMethods_
					addClass,
					removeClass,
					hasClass,
					registerTextFieldInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
					deregisterTextFieldInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
					registerValidationAttributeChangeHandler: (handler) => {
						const getAttributesList = (mutationsList) => {
							return mutationsList.map((mutation) => mutation.attributeName).filter((attributeName) => attributeName);
						};

						const observer = new MutationObserver((mutationsList) => {
							if (useNativeValidation()) {
								handler(getAttributesList(mutationsList));
							}
						});

						const config = { attributes: true };

						if (input()) {
							observer.observe(input().getElement(), config);
						}

						return observer;
					},

					deregisterValidationAttributeChangeHandler: (observer) => {
						observer.disconnect();
					},

					// getInputAdapterMethods_
					getNativeInput: () => input()?.getElement() ?? null,

					setInputAttr: (name, value) => {
						input()?.addAttr(name, value);
					},

					removeInputAttr: (name) => {
						input()?.removeAttr(name);
					},
					isFocused: () => document.activeElement === input()?.getElement(),
					registerInputInteractionHandler: (evtType, handler) => {
						const el = input()?.getElement();

						if (el) {
							const opts = applyPassive();

							eventManager.on(el, evtType, handler, typeof opts === 'boolean' ? { capture: opts } : opts);
						}
					},

					deregisterInputInteractionHandler: (evtType, handler) => {
						const el = input()?.getElement();

						if (el) {
							eventManager.off(el, evtType, handler);
						}
					},

					// getLabelAdapterMethods_
					floatLabel: (shouldFloat) => floatingLabel() && floatingLabel().float(shouldFloat),
					getLabelWidth: () => floatingLabel() ? floatingLabel().getWidth() : 0,
					hasLabel: () => !!floatingLabel(),
					shakeLabel: (shouldShake) => floatingLabel() && floatingLabel().shake(shouldShake),
					setLabelRequired: (isRequired) => floatingLabel() && floatingLabel().setRequired(isRequired),
					// getLineRippleAdapterMethods_
					activateLineRipple: () => lineRipple() && lineRipple().activate(),
					deactivateLineRipple: () => lineRipple() && lineRipple().deactivate(),
					setLineRippleTransformOrigin: (normalizedX) => lineRipple() && lineRipple().setRippleCenter(normalizedX),
					// getOutlineAdapterMethods_
					closeOutline: () => notchedOutline() && notchedOutline().closeNotch(),
					hasOutline: () => !!notchedOutline(),
					notchOutline: (labelWidth) => notchedOutline() && notchedOutline().notch(labelWidth)
				},
				{
					get helperText() {
						return helperTextInstance;
					},

					get characterCounter() {
						return characterCounterInstance;
					},

					get leadingIcon() {
						return leadingIconInstance;
					},

					get trailingIcon() {
						return trailingIconInstance;
					}
				}
			),
			true
		);

		if (valued) {
			if (input() == null) {
				throw new Error('SMUI Textfield must be initialized with either a non-undefined initial value or an Input component.');
			}

			$.get(instance)?.init();
		} else {
			tick().then(() => {
				if (input() == null) {
					throw new Error('SMUI Textfield must be initialized with either a non-undefined initial value or an Input component.');
				}

				$.get(instance)?.init();
			});
		}

		initPromiseResolve();

		return () => {
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
			? internalClasses[className] ?? null
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

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function focus() {
		input()?.focus();
	}

	function blur() {
		input()?.blur();
	}

	function layout() {
		if ($.get(instance)) {
			const openNotch = $.get(instance).shouldFloat;

			$.get(instance).notchOutline(openNotch);
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { focus, blur, layout, getElement };
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_15 = ($$anchor) => {
			var label_1 = root_4();

			$.attribute_effect(label_1, ($0, $1, $2) => ({ class: $0, style: $1, for: undefined, ...$2 }), [
				() => classMap({
					'mdc-text-field': true,
					'mdc-text-field--disabled': disabled(),
					'mdc-text-field--textarea': textarea(),
					'mdc-text-field--filled': variant() === 'filled',
					'mdc-text-field--outlined': variant() === 'outlined',
					'smui-text-field--standard': variant() === 'standard' && !textarea(),
					'mdc-text-field--no-label': noLabel() || $$props.label == null,
					'mdc-text-field--label-floating': $.get(focused) || value() != null && value() !== '',
					'mdc-text-field--with-leading-icon': isUninitializedValue(withLeadingIcon()) ? $$props.leadingIcon : withLeadingIcon(),
					'mdc-text-field--with-trailing-icon': isUninitializedValue(withTrailingIcon()) ? $$props.trailingIcon : withTrailingIcon(),
					'mdc-text-field--with-internal-counter': textarea() && $$props.internalCounter,
					'mdc-text-field--invalid': invalid(),
					...internalClasses,
					[className()]: true
				}),
				() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
				() => exclude(restProps, ['input$', 'label$', 'ripple$', 'outline$', 'helperLine$'])
			]);

			var node_1 = $.child(label_1);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var span = root();

							$.append($$anchor, span);
						};

						$.if(node_2, ($$render) => {
							if (variant() === 'filled') $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_3 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(focused) || value() != null && value() !== '' && (typeof value() !== 'number' || !isNaN(value())));
								let $1 = $.derived(() => prefixFilter(restProps, 'label$'));

								$.bind_this(
									FloatingLabel($$anchor, $.spread_props(
										{
											get floatAbove() {
												return $.get($0);
											},

											get required() {
												return required();
											},
											wrapped: true
										},
										() => $.get($1),
										{
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_4 = $.first_child(fragment_3);

												{
													var consequent_1 = ($$anchor) => {};

													var consequent_2 = ($$anchor) => {
														var text = $.text();

														$.template_effect(() => $.set_text(text, $$props.label));
														$.append($$anchor, text);
													};

													var alternate = ($$anchor) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.snippet(node_5, () => $$props.label);
														$.append($$anchor, fragment_5);
													};

													$.if(node_4, ($$render) => {
														if ($$props.label == null) $$render(consequent_1); else if (typeof $$props.label === 'string') $$render(consequent_2, 1); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										}
									)),
									($$value) => floatingLabel($$value),
									() => floatingLabel()
								);
							}
						};

						$.if(node_3, ($$render) => {
							if (!noLabel() && $$props.label != null) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (!textarea() && variant() !== 'outlined') $$render(consequent_4);
				});
			}

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent_8 = ($$anchor) => {
					{
						let $0 = $.derived(() => noLabel() || $$props.label == null);
						let $1 = $.derived(() => prefixFilter(restProps, 'outline$'));

						$.bind_this(
							NotchedOutline($$anchor, $.spread_props(
								{
									get noLabel() {
										return $.get($0);
									}
								},
								() => $.get($1),
								{
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_7 = $.first_child(fragment_7);

										{
											var consequent_7 = ($$anchor) => {
												{
													let $0 = $.derived(() => $.get(focused) || value() != null && value() !== '' && (typeof value() !== 'number' || !isNaN(value())));
													let $1 = $.derived(() => prefixFilter(restProps, 'label$'));

													$.bind_this(
														FloatingLabel($$anchor, $.spread_props(
															{
																get floatAbove() {
																	return $.get($0);
																},

																get required() {
																	return required();
																},
																wrapped: true
															},
															() => $.get($1),
															{
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = $.comment();
																	var node_8 = $.first_child(fragment_9);

																	{
																		var consequent_5 = ($$anchor) => {};

																		var consequent_6 = ($$anchor) => {
																			var text_1 = $.text();

																			$.template_effect(() => $.set_text(text_1, $$props.label));
																			$.append($$anchor, text_1);
																		};

																		var alternate_1 = ($$anchor) => {
																			var fragment_11 = $.comment();
																			var node_9 = $.first_child(fragment_11);

																			$.snippet(node_9, () => $$props.label);
																			$.append($$anchor, fragment_11);
																		};

																		$.if(node_8, ($$render) => {
																			if ($$props.label == null) $$render(consequent_5); else if (typeof $$props.label === 'string') $$render(consequent_6, 1); else $$render(alternate_1, -1);
																		});
																	}

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															}
														)),
														($$value) => floatingLabel($$value),
														() => floatingLabel()
													);
												}
											};

											$.if(node_7, ($$render) => {
												if (!noLabel() && $$props.label != null) $$render(consequent_7);
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								}
							)),
							($$value) => notchedOutline($$value),
							() => notchedOutline()
						);
					}
				};

				$.if(node_6, ($$render) => {
					if (textarea() || variant() === 'outlined') $$render(consequent_8);
				});
			}

			var node_10 = $.sibling(node_6, 2);

			ContextFragment(node_10, {
				key: 'SMUI:textfield:icon:leading',
				value: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = $.comment();
					var node_11 = $.first_child(fragment_12);

					$.snippet(node_11, () => $$props.leadingIcon ?? $.noop);
					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_10, 2);

			$.snippet(node_12, () => $$props.children ?? $.noop);

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_9 = ($$anchor) => {
					var span_1 = root_2();
					var node_14 = $.child(span_1);

					{
						let $0 = $.derived(() => prefixFilter(restProps, 'input$'));

						$.bind_this(
							Textarea(node_14, $.spread_props(
								{
									get disabled() {
										return disabled();
									},

									get required() {
										return required();
									},

									get updateInvalid() {
										return updateInvalid();
									},

									get initialInvalid() {
										return $.get(initialInvalid);
									},

									get 'aria-controls'() {
										return $.get(helperId);
									},

									get 'aria-describedby'() {
										return $.get(helperId);
									}
								},
								() => $.get($0),
								{
									onblur: (e) => {
										$.set(focused, false);

										// Set initial invalid, because now the user has interacted with the
										// input.
										$.set(initialInvalid, true);

										dispatch(getElement(), 'blur', e);
										$$props.input$onblur?.(e);
									},

									onfocus: (e) => {
										$.set(focused, true);
										dispatch(getElement(), 'focus', e);
										$$props.input$onfocus?.(e);
									},

									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									},

									get dirty() {
										return dirty();
									},

									set dirty($$value) {
										dirty($$value);
									},

									get invalid() {
										return invalid();
									},

									set invalid($$value) {
										invalid($$value);
									}
								}
							)),
							($$value) => input($$value),
							() => input()
						);
					}

					var node_15 = $.sibling(node_14, 2);

					$.snippet(node_15, () => $$props.internalCounter ?? $.noop);
					$.reset(span_1);

					$.template_effect(($0) => $.set_class(span_1, 1, $0), [
						() => $.clsx(classMap({
							'mdc-text-field__resizer': !('input$resizable' in restProps) || $$props.input$resizable
						}))
					]);

					$.append($$anchor, span_1);
				};

				var alternate_4 = ($$anchor) => {
					var fragment_13 = root_3();
					var node_16 = $.first_child(fragment_13);

					{
						var consequent_11 = ($$anchor) => {
							var fragment_14 = $.comment();
							var node_17 = $.first_child(fragment_14);

							{
								var consequent_10 = ($$anchor) => {
									Prefix($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $$props.prefix));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								};

								var alternate_2 = ($$anchor) => {
									var fragment_17 = $.comment();
									var node_18 = $.first_child(fragment_17);

									$.snippet(node_18, () => $$props.prefix ?? $.noop);
									$.append($$anchor, fragment_17);
								};

								$.if(node_17, ($$render) => {
									if (typeof $$props.prefix === 'string') $$render(consequent_10); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_14);
						};

						$.if(node_16, ($$render) => {
							if ($$props.prefix != null) $$render(consequent_11);
						});
					}

					var node_19 = $.sibling(node_16, 2);

					{
						let $0 = $.derived(() => prefixFilter(restProps, 'input$'));

						$.bind_this(
							Input(node_19, $.spread_props(
								{
									get type() {
										return type();
									},

									get disabled() {
										return disabled();
									},

									get required() {
										return required();
									},

									get updateInvalid() {
										return updateInvalid();
									},

									get initialInvalid() {
										return $.get(initialInvalid);
									},

									get 'aria-controls'() {
										return $.get(helperId);
									},

									get 'aria-describedby'() {
										return $.get(helperId);
									}
								},
								() => noLabel() && $$props.label != null && typeof $$props.label === 'string' ? { placeholder: $$props.label } : {},
								() => $.get($0),
								{
									onblur: (e) => {
										$.set(focused, false);

										// Set initial invalid, because now the user has interacted with the
										// input.
										$.set(initialInvalid, true);

										dispatch(getElement(), 'blur', e);
										$$props.input$onblur?.(e);
									},

									onfocus: (e) => {
										$.set(focused, true);
										dispatch(getElement(), 'focus', e);
										$$props.input$onfocus?.(e);
									},

									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									},

									get files() {
										return files();
									},

									set files($$value) {
										files($$value);
									},

									get dirty() {
										return dirty();
									},

									set dirty($$value) {
										dirty($$value);
									},

									get invalid() {
										return invalid();
									},

									set invalid($$value) {
										invalid($$value);
									}
								}
							)),
							($$value) => input($$value),
							() => input()
						);
					}

					var node_20 = $.sibling(node_19, 2);

					{
						var consequent_13 = ($$anchor) => {
							var fragment_18 = $.comment();
							var node_21 = $.first_child(fragment_18);

							{
								var consequent_12 = ($$anchor) => {
									Suffix($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $$props.suffix));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								};

								var alternate_3 = ($$anchor) => {
									var fragment_21 = $.comment();
									var node_22 = $.first_child(fragment_21);

									$.snippet(node_22, () => $$props.suffix ?? $.noop);
									$.append($$anchor, fragment_21);
								};

								$.if(node_21, ($$render) => {
									if (typeof $$props.suffix === 'string') $$render(consequent_12); else $$render(alternate_3, -1);
								});
							}

							$.append($$anchor, fragment_18);
						};

						$.if(node_20, ($$render) => {
							if ($$props.suffix != null) $$render(consequent_13);
						});
					}

					$.append($$anchor, fragment_13);
				};

				$.if(node_13, ($$render) => {
					if (textarea() && typeof value() === 'string') $$render(consequent_9); else $$render(alternate_4, -1);
				});
			}

			var node_23 = $.sibling(node_13, 2);

			ContextFragment(node_23, {
				key: 'SMUI:textfield:icon:leading',
				value: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_22 = $.comment();
					var node_24 = $.first_child(fragment_22);

					$.snippet(node_24, () => $$props.trailingIcon ?? $.noop);
					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_23, 2);

			{
				var consequent_14 = ($$anchor) => {
					{
						let $0 = $.derived(() => prefixFilter(restProps, 'ripple$'));

						$.bind_this(LineRipple($$anchor, $.spread_props(() => $.get($0))), ($$value) => lineRipple($$value), () => lineRipple());
					}
				};

				$.if(node_25, ($$render) => {
					if (!textarea() && variant() !== 'outlined' && ripple()) $$render(consequent_14);
				});
			}

			$.reset(label_1);
			$.bind_this(label_1, ($$value) => element = $$value, () => element);

			$.action(label_1, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
				ripple: !textarea() && variant() === 'filled',
				unbounded: false,
				addClass,
				removeClass,
				addStyle,
				eventTarget: $.get(inputElement),
				activeTarget: $.get(inputElement),
				initPromise
			}));

			$.action(label_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, label_1);
		};

		var alternate_5 = ($$anchor) => {
			var div = root_5();

			$.attribute_effect(div, ($0, $1, $2) => ({ class: $0, style: $1, ...$2 }), [
				() => classMap({
					'mdc-text-field': true,
					'mdc-text-field--disabled': disabled(),
					'mdc-text-field--textarea': textarea(),
					'mdc-text-field--filled': variant() === 'filled',
					'mdc-text-field--outlined': variant() === 'outlined',
					'smui-text-field--standard': variant() === 'standard' && !textarea(),
					'mdc-text-field--no-label': noLabel() || $$props.label == null,
					'mdc-text-field--with-leading-icon': $$props.leadingIcon,
					'mdc-text-field--with-trailing-icon': $$props.trailingIcon,
					'mdc-text-field--invalid': invalid(),
					...internalClasses,
					[className()]: true
				}),
				() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
				() => exclude(restProps, ['input$', 'label$', 'ripple$', 'outline$', 'helperLine$'])
			]);

			var node_26 = $.child(div);

			{
				var consequent_16 = ($$anchor) => {
					var fragment_24 = $.comment();
					var node_27 = $.first_child(fragment_24);

					$.snippet(node_27, () => $$props.label ?? $.noop);
					$.append($$anchor, fragment_24);
				};

				$.if(node_26, ($$render) => {
					if (typeof $$props.label !== 'string') $$render(consequent_16);
				});
			}

			var node_28 = $.sibling(node_26, 2);

			ContextFragment(node_28, {
				key: 'SMUI:textfield:icon:leading',
				value: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_25 = $.comment();
					var node_29 = $.first_child(fragment_25);

					$.snippet(node_29, () => $$props.leadingIcon ?? $.noop);
					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_28, 2);

			$.snippet(node_30, () => $$props.children ?? $.noop);

			var node_31 = $.sibling(node_30, 2);

			ContextFragment(node_31, {
				key: 'SMUI:textfield:icon:leading',
				value: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_26 = $.comment();
					var node_32 = $.first_child(fragment_26);

					$.snippet(node_32, () => $$props.trailingIcon ?? $.noop);
					$.append($$anchor, fragment_26);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_31, 2);

			$.snippet(node_33, () => $$props.line ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => element = $$value, () => element);

			$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
				ripple: ripple(),
				unbounded: false,
				addClass,
				removeClass,
				addStyle
			}));

			$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (valued) $$render(consequent_15); else $$render(alternate_5, -1);
		});
	}

	var node_34 = $.sibling(node, 2);

	{
		var consequent_17 = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'helperLine$'));

				HelperLine($$anchor, $.spread_props(() => $.get($0), {
					children: ($$anchor, $$slotProps) => {
						var fragment_28 = $.comment();
						var node_35 = $.first_child(fragment_28);

						$.snippet(node_35, () => $$props.helper ?? $.noop);
						$.append($$anchor, fragment_28);
					},
					$$slots: { default: true }
				}));
			}
		};

		$.if(node_34, ($$render) => {
			if ($$props.helper) $$render(consequent_17);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}