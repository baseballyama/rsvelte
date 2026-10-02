import * as $ from 'svelte/internal/server';
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

export default function Textfield($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			style = '',
			ripple = true,
			disabled = false,
			required = false,
			textarea = false,
			variant = textarea ? 'outlined' : 'standard',
			noLabel = false,
			label,
			type = 'text',
			value = void 0,
			files = uninitializedValue,
			invalid = uninitializedValue,
			updateInvalid = isUninitializedValue(invalid),
			initialInvalid: propInitialInvalid = false,
			dirty = false,
			prefix,
			suffix,
			validateOnValueChange = updateInvalid,
			useNativeValidation = updateInvalid,
			withLeadingIcon = uninitializedValue,
			withTrailingIcon = uninitializedValue,
			input,
			floatingLabel,
			lineRipple,
			notchedOutline,
			children,
			leadingIcon,
			trailingIcon,
			internalCounter,
			line,
			helper,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Some trickery to detect uninitialized values but also have the right types.
		const valued = value !== undefined || value === undefined && restProps.input$emptyValueUndefined || !isUninitializedValue(files);

		if (isUninitializedValue(files)) {
			files = null;
		}

		if (isUninitializedValue(invalid)) {
			invalid = false;
		}

		// Done with the trickery.
		let element;

		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let internalStyles = {};
		let helperId = undefined;
		let focused = false;
		let initialInvalid = propInitialInvalid;
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;
		let initPromiseResolve;
		let initPromise = new Promise((resolve) => initPromiseResolve = resolve);

		// These are instances, not accessors.
		let leadingIconInstance = undefined;

		let trailingIconInstance = undefined;
		let helperTextInstance = undefined;
		let characterCounterInstance = undefined;
		const inputElement = $.derived(() => input && input.getElement());

		// React to changes of value from outside component.
		let previousValue = value;

		// Check the data is flowing down.
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
			helperId = id;
		});

		setContext('SMUI:textfield:helper-text:mount', (accessor) => {
			helperTextInstance = accessor;
		});

		setContext('SMUI:textfield:helper-text:unmount', () => {
			helperId = undefined;
			helperTextInstance = undefined;
		});

		setContext('SMUI:textfield:character-counter:mount', (accessor) => {
			characterCounterInstance = accessor;
		});

		setContext('SMUI:textfield:character-counter:unmount', () => {
			characterCounterInstance = undefined;
		});

		onMount(() => {
			instance = new MDCTextFieldFoundation(
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
							if (useNativeValidation) {
								handler(getAttributesList(mutationsList));
							}
						});

						const config = { attributes: true };

						if (input) {
							observer.observe(input.getElement(), config);
						}

						return observer;
					},

					deregisterValidationAttributeChangeHandler: (observer) => {
						observer.disconnect();
					},

					// getInputAdapterMethods_
					getNativeInput: () => input?.getElement() ?? null,

					setInputAttr: (name, value) => {
						input?.addAttr(name, value);
					},

					removeInputAttr: (name) => {
						input?.removeAttr(name);
					},
					isFocused: () => document.activeElement === input?.getElement(),
					registerInputInteractionHandler: (evtType, handler) => {
						const el = input?.getElement();

						if (el) {
							const opts = applyPassive();

							eventManager.on(el, evtType, handler, typeof opts === 'boolean' ? { capture: opts } : opts);
						}
					},

					deregisterInputInteractionHandler: (evtType, handler) => {
						const el = input?.getElement();

						if (el) {
							eventManager.off(el, evtType, handler);
						}
					},

					// getLabelAdapterMethods_
					floatLabel: (shouldFloat) => floatingLabel && floatingLabel.float(shouldFloat),
					getLabelWidth: () => floatingLabel ? floatingLabel.getWidth() : 0,
					hasLabel: () => !!floatingLabel,
					shakeLabel: (shouldShake) => floatingLabel && floatingLabel.shake(shouldShake),
					setLabelRequired: (isRequired) => floatingLabel && floatingLabel.setRequired(isRequired),
					// getLineRippleAdapterMethods_
					activateLineRipple: () => lineRipple && lineRipple.activate(),
					deactivateLineRipple: () => lineRipple && lineRipple.deactivate(),
					setLineRippleTransformOrigin: (normalizedX) => lineRipple && lineRipple.setRippleCenter(normalizedX),
					// getOutlineAdapterMethods_
					closeOutline: () => notchedOutline && notchedOutline.closeNotch(),
					hasOutline: () => !!notchedOutline,
					notchOutline: (labelWidth) => notchedOutline && notchedOutline.notch(labelWidth)
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
			);

			if (valued) {
				if (input == null) {
					throw new Error('SMUI Textfield must be initialized with either a non-undefined initial value or an Input component.');
				}

				instance?.init();
			} else {
				tick().then(() => {
					if (input == null) {
						throw new Error('SMUI Textfield must be initialized with either a non-undefined initial value or an Input component.');
					}

					instance?.init();
				});
			}

			initPromiseResolve();

			return () => {
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
			input?.focus();
		}

		function blur() {
			input?.blur();
		}

		function layout() {
			if (instance) {
				const openNotch = instance.shouldFloat;

				instance.notchOutline(openNotch);
			}
		}

		function getElement() {
			return element;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (valued) {
				$$renderer.push(`<!--[0--><label${$.attributes({
					class: $.clsx(classMap({
						'mdc-text-field': true,
						'mdc-text-field--disabled': disabled,
						'mdc-text-field--textarea': textarea,
						'mdc-text-field--filled': variant === 'filled',
						'mdc-text-field--outlined': variant === 'outlined',
						'smui-text-field--standard': variant === 'standard' && !textarea,
						'mdc-text-field--no-label': noLabel || label == null,
						'mdc-text-field--label-floating': focused || value != null && value !== '',
						'mdc-text-field--with-leading-icon': isUninitializedValue(withLeadingIcon) ? leadingIcon : withLeadingIcon,
						'mdc-text-field--with-trailing-icon': isUninitializedValue(withTrailingIcon) ? trailingIcon : withTrailingIcon,
						'mdc-text-field--with-internal-counter': textarea && internalCounter,
						'mdc-text-field--invalid': invalid,
						...internalClasses,
						[className]: true
					})),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
					for: undefined,
					...exclude(restProps, ['input$', 'label$', 'ripple$', 'outline$', 'helperLine$'])
				})}>`);

				if (!textarea && variant !== 'outlined') {
					$$renderer.push('<!--[0-->');

					if (variant === 'filled') {
						$$renderer.push(`<!--[0--><span class="mdc-text-field__ripple"></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (!noLabel && label != null) {
						$$renderer.push('<!--[0-->');

						FloatingLabel($$renderer, $.spread_props([
							{
								floatAbove: focused || value != null && value !== '' && (typeof value !== 'number' || !isNaN(value)),
								required,
								wrapped: true
							},
							prefixFilter(restProps, 'label$'),
							{
								children: ($$renderer) => {
									if (label == null) {
										$$renderer.push('<!--[0-->');
									} else if (typeof label === 'string') {
										$$renderer.push(`<!--[1-->${$.escape(label)}`);
									} else {
										$$renderer.push('<!--[-1-->');
										label($$renderer);
										$$renderer.push(`<!---->`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (textarea || variant === 'outlined') {
					$$renderer.push('<!--[0-->');

					NotchedOutline($$renderer, $.spread_props([
						{ noLabel: noLabel || label == null },
						prefixFilter(restProps, 'outline$'),
						{
							children: ($$renderer) => {
								if (!noLabel && label != null) {
									$$renderer.push('<!--[0-->');

									FloatingLabel($$renderer, $.spread_props([
										{
											floatAbove: focused || value != null && value !== '' && (typeof value !== 'number' || !isNaN(value)),
											required,
											wrapped: true
										},
										prefixFilter(restProps, 'label$'),
										{
											children: ($$renderer) => {
												if (label == null) {
													$$renderer.push('<!--[0-->');
												} else if (typeof label === 'string') {
													$$renderer.push(`<!--[1-->${$.escape(label)}`);
												} else {
													$$renderer.push('<!--[-1-->');
													label($$renderer);
													$$renderer.push(`<!---->`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										}
									]));
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						}
					]));
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				ContextFragment($$renderer, {
					key: 'SMUI:textfield:icon:leading',
					value: true,
					children: ($$renderer) => {
						leadingIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				children?.($$renderer);
				$$renderer.push(`<!----> `);

				if (textarea && typeof value === 'string') {
					$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(classMap({
						'mdc-text-field__resizer': !('input$resizable' in restProps) || restProps.input$resizable
					})))}>`);

					Textarea($$renderer, $.spread_props([
						{
							disabled,
							required,
							updateInvalid,
							initialInvalid,
							'aria-controls': helperId,
							'aria-describedby': helperId
						},
						prefixFilter(restProps, 'input$'),
						{
							onblur: (e) => {
								focused = false;

								// Set initial invalid, because now the user has interacted with the
								// input.
								initialInvalid = true;

								dispatch(getElement(), 'blur', e);
								restProps.input$onblur?.(e);
							},

							onfocus: (e) => {
								focused = true;
								dispatch(getElement(), 'focus', e);
								restProps.input$onfocus?.(e);
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							get dirty() {
								return dirty;
							},

							set dirty($$value) {
								dirty = $$value;
								$$settled = false;
							},

							get invalid() {
								return invalid;
							},

							set invalid($$value) {
								invalid = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push(`<!----> `);
					internalCounter?.($$renderer);
					$$renderer.push(`<!----></span>`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (prefix != null) {
						$$renderer.push('<!--[0-->');

						if (typeof prefix === 'string') {
							$$renderer.push('<!--[0-->');

							Prefix($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(prefix)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
							prefix?.($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Input($$renderer, $.spread_props([
						{
							type,
							disabled,
							required,
							updateInvalid,
							initialInvalid,
							'aria-controls': helperId,
							'aria-describedby': helperId
						},
						noLabel && label != null && typeof label === 'string' ? { placeholder: label } : {},
						prefixFilter(restProps, 'input$'),
						{
							onblur: (e) => {
								focused = false;

								// Set initial invalid, because now the user has interacted with the
								// input.
								initialInvalid = true;

								dispatch(getElement(), 'blur', e);
								restProps.input$onblur?.(e);
							},

							onfocus: (e) => {
								focused = true;
								dispatch(getElement(), 'focus', e);
								restProps.input$onfocus?.(e);
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							get files() {
								return files;
							},

							set files($$value) {
								files = $$value;
								$$settled = false;
							},

							get dirty() {
								return dirty;
							},

							set dirty($$value) {
								dirty = $$value;
								$$settled = false;
							},

							get invalid() {
								return invalid;
							},

							set invalid($$value) {
								invalid = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push(`<!----> `);

					if (suffix != null) {
						$$renderer.push('<!--[0-->');

						if (typeof suffix === 'string') {
							$$renderer.push('<!--[0-->');

							Suffix($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(suffix)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
							suffix?.($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--> `);

				ContextFragment($$renderer, {
					key: 'SMUI:textfield:icon:leading',
					value: false,
					children: ($$renderer) => {
						trailingIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (!textarea && variant !== 'outlined' && ripple) {
					$$renderer.push('<!--[0-->');
					LineRipple($$renderer, $.spread_props([prefixFilter(restProps, 'ripple$')]));
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></label>`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attributes({
					class: $.clsx(classMap({
						'mdc-text-field': true,
						'mdc-text-field--disabled': disabled,
						'mdc-text-field--textarea': textarea,
						'mdc-text-field--filled': variant === 'filled',
						'mdc-text-field--outlined': variant === 'outlined',
						'smui-text-field--standard': variant === 'standard' && !textarea,
						'mdc-text-field--no-label': noLabel || label == null,
						'mdc-text-field--with-leading-icon': leadingIcon,
						'mdc-text-field--with-trailing-icon': trailingIcon,
						'mdc-text-field--invalid': invalid,
						...internalClasses,
						[className]: true
					})),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
					...exclude(restProps, ['input$', 'label$', 'ripple$', 'outline$', 'helperLine$'])
				})}>`);

				if (typeof label !== 'string') {
					$$renderer.push('<!--[0-->');
					label?.($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				ContextFragment($$renderer, {
					key: 'SMUI:textfield:icon:leading',
					value: true,
					children: ($$renderer) => {
						leadingIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				children?.($$renderer);
				$$renderer.push(`<!----> `);

				ContextFragment($$renderer, {
					key: 'SMUI:textfield:icon:leading',
					value: false,
					children: ($$renderer) => {
						trailingIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				line?.($$renderer);
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (helper) {
				$$renderer.push('<!--[0-->');

				HelperLine($$renderer, $.spread_props([
					prefixFilter(restProps, 'helperLine$'),
					{
						children: ($$renderer) => {
							helper?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			value,
			files,
			invalid,
			dirty,
			focus,
			blur,
			layout,
			getElement
		});
	});
}