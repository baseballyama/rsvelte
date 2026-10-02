import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext, tick } from 'svelte';
import { focusTrap as domFocusTrap } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { CloseReason, MDCBannerFoundation } from './mdc';
import Fixed from './Fixed.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'open',
	'autoClose',
	'centered',
	'fixed',
	'mobileStacked',
	'content$class',
	'textWrapper$class',
	'graphic$class',
	'children',
	'icon',
	'label',
	'actions'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);
var root_2 = $.from_html(`<div class="mdc-banner__actions"><!></div>`);

export default function Banner($$anchor, $$props) {
	$.push($$props, true);

	const { FocusTrap } = domFocusTrap;

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
	 * Whether the banner is open.
	 */
	/**
	 * Whether the banner closes on button click.
	 */
	/**
	 * Whether the banner contents are centered.
	 */
	/**
	 * Fix the banner to the top of the container.
	 */
	/**
	 * Stack the buttons under the content on mobile displays.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		open = $.prop($$props, 'open', 15, false),
		autoClose = $.prop($$props, 'autoClose', 3, true),
		centered = $.prop($$props, 'centered', 3, false),
		fixed = $.prop($$props, 'fixed', 3, false),
		mobileStacked = $.prop($$props, 'mobileStacked', 3, false),
		content$class = $.prop($$props, 'content$class', 3, ''),
		textWrapper$class = $.prop($$props, 'textWrapper$class', 3, ''),
		graphic$class = $.prop($$props, 'graphic$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let content;
	let focusTrap;
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let width = $.state(void 0);

	// This is for a div that uses the role of "img". TS doesn't like it directly
	// on the element.
	const altProp = { alt: '' };

	setContext('SMUI:label:context', 'banner');
	setContext('SMUI:icon:context', 'banner');
	setContext('SMUI:button:context', 'banner');

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isOpen() !== open()) {
			if (open()) {
				$.get(instance).open();
			} else {
				$.get(instance).close(CloseReason.UNSPECIFIED);
			}
		}
	});

	let previousMobileStacked = mobileStacked();

	$.user_effect(() => {
		if (previousMobileStacked !== mobileStacked()) {
			previousMobileStacked = mobileStacked();
			tick().then(layout);
		}
	});

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	onMount(() => {
		let initialFocusEl = getPrimaryActionEl();

		if (initialFocusEl) {
			focusTrap = new FocusTrap(element, { initialFocusEl });
		}

		$.set(
			instance,
			new MDCBannerFoundation({
				addClass,
				getContentHeight: () => {
					let offsetHeight = content.offsetHeight;

					if (offsetHeight === 0) {
						getElement().classList.add('smui-banner--force-show');

						if ($.get(width)) {
							content.style.setProperty('width', `${$.get(width)}px`);
						}

						offsetHeight = content.offsetHeight;
						getElement().classList.remove('smui-banner--force-show');

						if ($.get(width)) {
							content.style.removeProperty('width');
						}
					}

					return offsetHeight;
				},

				notifyClosed: (reason) => {
					open(false);
					dispatch(getElement(), 'SMUIBannerClosed', { reason });
				},
				notifyClosing: (reason) => dispatch(getElement(), 'SMUIBannerClosing', { reason }),
				notifyOpened: () => {
					open(true);
					dispatch(getElement(), 'SMUIBannerOpened', {});
				},
				notifyOpening: () => dispatch(getElement(), 'SMUIBannerOpening', {}),
				notifyActionClicked: (action) => dispatch(getElement(), 'SMUIBannerActionClicked', { action }),
				releaseFocus: () => focusTrap && focusTrap.releaseFocus(),
				removeClass,
				setStyleProperty: addStyle,
				trapFocus: () => focusTrap && focusTrap.trapFocus()
			}),
			true
		);

		$.get(instance).init();
		layout();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	onDestroy(() => {
		if (removeLayoutListener) {
			removeLayoutListener();
		}
	});

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

	function getPrimaryActionEl() {
		return getElement().querySelector('.mdc-banner__primary-action') ?? undefined;
	}

	function handlePrimaryActionClick() {
		$.get(instance)?.handlePrimaryActionClick(!autoClose());
	}

	function handleSecondaryActionClick() {
		$.get(instance)?.handleSecondaryActionClick(!autoClose());
	}

	function isOpen() {
		return open();
	}

	function setOpen(value) {
		open(value);
	}

	function layout() {
		if (fixed()) {
			$.set(width, getElement().offsetWidth, true);

			if ($.get(width) === 0) {
				getElement().classList.add('smui-banner--force-show');
				$.set(width, getElement().offsetWidth, true);
				getElement().classList.remove('smui-banner--force-show');
			}
		}

		if ($.get(instance)) {
			$.get(instance).layout();
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { isOpen, setOpen, layout, getElement };
	var div = root();

	$.event('resize', $.window, layout);

	var event_handler = (e) => {
		handlePrimaryActionClick();
		$$props.onSMUIBannerButtonPrimaryActionClick?.(e);
	};

	var event_handler_1 = (e) => {
		handleSecondaryActionClick();
		$$props.onSMUIBannerButtonSecondaryActionClick?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1, $2) => ({
			class: $0,
			style: $1,
			role: 'banner',
			...$2,
			onSMUIBannerButtonPrimaryActionClick: event_handler,
			onSMUIBannerButtonSecondaryActionClick: event_handler_1
		}),
		[
			() => classMap({
				'mdc-banner': true,
				'mdc-banner--centered': centered(),
				'mdc-banner--mobile-stacked': mobileStacked(),
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
			() => exclude(restProps, ['content$', 'textWrapper$', 'graphic$'])
		]
	);

	var node = $.child(div);

	Fixed(node, {
		get fixed() {
			return fixed();
		},

		get width() {
			return $.get(width);
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.attribute_effect(
				div_1,
				($0, $1) => ({
					class: $0,
					role: 'alertdialog',
					'aria-live': 'assertive',
					...$1
				}),
				[
					() => classMap({ 'mdc-banner__content': true, [content$class()]: true }),
					() => prefixFilter(restProps, 'content$')
				]
			);

			var node_1 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root_1();

					$.attribute_effect(div_2, ($0, $1) => ({ class: $0, ...$1 }), [
						() => classMap({
							'mdc-banner__graphic-text-wrapper': true,
							[textWrapper$class()]: true
						}),
						() => prefixFilter(restProps, 'textWrapper$')
					]);

					var node_2 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root();

							$.attribute_effect(div_3, ($0, $1) => ({ class: $0, role: 'img', ...altProp, ...$1 }), [
								() => classMap({ 'mdc-banner__graphic': true, [graphic$class()]: true }),
								() => prefixFilter(restProps, 'graphic$')
							]);

							var node_3 = $.child(div_3);

							$.snippet(node_3, () => $$props.icon ?? $.noop);
							$.reset(div_3);
							$.append($$anchor, div_3);
						};

						$.if(node_2, ($$render) => {
							if ($$props.icon) $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_2, 2);

					$.snippet(node_4, () => $$props.label ?? $.noop);
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon || $$props.label) $$render(consequent_1);
				});
			}

			var node_5 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_2();
					var node_6 = $.child(div_4);

					$.snippet(node_6, () => $$props.actions ?? $.noop);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_5, ($$render) => {
					if ($$props.actions) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => content = $$value, () => content);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}