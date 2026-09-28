import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, getContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'color',
	'variant',
	'touch',
	'href',
	'action',
	'defaultAction',
	'secondary',
	'component',
	'tag',
	'children'
]);

var root = $.from_html(`<div class="mdc-button__touch"></div>`);
var root_1 = $.from_html(`<div class="mdc-button__ripple"></div> <!><!>`, 1);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

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
	 * The color of the button.
	 */
	/**
	 * The styling variant of the button.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * If provided, the button will act as a link.
	 */
	/**
	 * The action the button represents.
	 */
	/**
	 * Whether the button is the default action for the dialog.
	 */
	/**
	 * Whether the button is the secondary button for the banner.
	 */
	/**
	 * The component to use to render the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		color = $.prop($$props, 'color', 3, 'primary'),
		variant = $.prop($$props, 'variant', 3, 'text'),
		touch = $.prop($$props, 'touch', 3, false),
		action = $.prop($$props, 'action', 3, 'close'),
		defaultAction = $.prop($$props, 'defaultAction', 3, false),
		secondary = $.prop($$props, 'secondary', 3, false),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 19, () => $$props.href == null ? 'button' : 'a'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let context = getContext('SMUI:button:context');

	const actionProp = $.derived(() => context === 'dialog:action' && action() != null
		? { 'data-mdc-dialog-action': action() }
		: { action: action() });

	const defaultProp = $.derived(() => context === 'dialog:action' && defaultAction() ? { 'data-mdc-dialog-button-default': '' } : {});
	const secondaryProp = $.derived(() => context === 'banner' ? {} : { secondary: secondary() });
	let previousDisabled = $$props.disabled;

	$.user_effect(() => {
		if (previousDisabled !== $$props.disabled) {
			if (element) {
				const el = getElement();

				if ('blur' in el) {
					el.blur();
				}
			}

			previousDisabled = restProps.disabled;
		}
	});

	setContext('SMUI:label:context', 'button');
	setContext('SMUI:icon:context', 'button');

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

	function handleClick() {
		if (context === 'banner') {
			dispatch(getElement(), secondary()
				? 'SMUIBannerButtonSecondaryActionClick'
				: 'SMUIBannerButtonPrimaryActionClick');
		}
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [
			[
				Ripple,
				{
					ripple: ripple(),
					unbounded: false,
					color: color(),
					disabled: !!$$props.disabled,
					addClass,
					removeClass,
					addStyle
				}
			],
			...use()
		]);

		let $1 = $.derived(() => classMap({
			'mdc-button': true,
			'mdc-button--raised': variant() === 'raised',
			'mdc-button--unelevated': variant() === 'unelevated',
			'mdc-button--outlined': variant() === 'outlined',
			'smui-button--color-secondary': color() === 'secondary',
			'mdc-button--touch': touch(),
			'mdc-card__action': context === 'card:action',
			'mdc-card__action--button': context === 'card:action',
			'mdc-dialog__button': context === 'dialog:action',
			'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',
			'mdc-top-app-bar__action-item': context === 'top-app-bar:action',
			'mdc-snackbar__action': context === 'snackbar:actions',
			'mdc-banner__secondary-action': context === 'banner' && secondary(),
			'mdc-banner__primary-action': context === 'banner' && !secondary(),
			'mdc-tooltip--rich-action': context === 'tooltip:rich-actions',
			...internalClasses,
			[className()]: true
		}));

		let $2 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return $.get($0);
						},

						get class() {
							return $.get($1);
						},

						get style() {
							return $.get($2);
						}
					},
					() => $.get(actionProp),
					() => $.get(defaultProp),
					() => $.get(secondaryProp),
					{
						get href() {
							return $$props.href;
						}
					},
					() => restProps,
					{
						onclick: (e) => {
							handleClick();
							$$props.onclick?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_1 = $.sibling($.first_child(fragment_1), 2);

							$.snippet(node_1, () => $$props.children ?? $.noop);

							var node_2 = $.sibling(node_1);

							{
								var consequent = ($$anchor) => {
									var div = root();

									$.append($$anchor, div);
								};

								$.if(node_2, ($$render) => {
									if (touch()) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}