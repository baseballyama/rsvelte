import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, setContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import { MDCIconButtonToggleFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'color',
	'toggle',
	'pressed',
	'ariaLabelOn',
	'ariaLabelOff',
	'touch',
	'displayFlex',
	'size',
	'href',
	'action',
	'focusRing',
	'component',
	'tag',
	'children'
]);

var root = $.from_html(`<span class="mdc-icon-button__focus-ring"></span>`);
var root_1 = $.from_html(`<div class="mdc-icon-button__touch"></div>`);
var root_2 = $.from_html(`<div class="mdc-icon-button__ripple"></div> <!> <!><!>`, 1);

export default function IconButton($$anchor, $$props) {
	$.push($$props, true);

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
	 * The color of the button.
	 */
	/**
	 * Whether to act as a toggle button.
	 */
	/**
	 * When acting as a toggle button, whether the button is toggled.
	 */
	/**
	 * The ARIA label for the pressed state.
	 */
	/**
	 * The ARIA label for the unpressed stated.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * Use flex styling.
	 */
	/**
	 * The size of the button.
	 */
	/**
	 * If provided, the button will act as a link.
	 */
	/**
	 * The action the button represents.
	 */
	/**
	 * If false, hides the high contrast mode focus ring element.
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
		toggle = $.prop($$props, 'toggle', 3, false),
		pressed = $.prop($$props, 'pressed', 15, uninitializedValue),
		touch = $.prop($$props, 'touch', 3, false),
		displayFlex = $.prop($$props, 'displayFlex', 3, true),
		size = $.prop($$props, 'size', 3, 'normal'),
		focusRing = $.prop($$props, 'focusRing', 3, true),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 19, () => $$props.href == null ? 'button' : 'a'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance;
	let internalClasses = $.state($.proxy({}));
	let internalStyles = $.proxy({});
	let internalAttrs = $.state($.proxy({}));
	let context = getContext('SMUI:icon-button:context');
	let ariaDescribedby = getContext('SMUI:icon-button:aria-describedby');

	const actionProp = $.derived(() => {
		if (context === 'data-table:pagination') {
			switch ($$props.action) {
				case 'first-page':
					return { 'data-first-page': 'true' };

				case 'prev-page':
					return { 'data-prev-page': 'true' };

				case 'next-page':
					return { 'data-next-page': 'true' };

				case 'last-page':
					return { 'data-last-page': 'true' };

				default:
					return { 'data-action': 'true' };
			}
		} else if (context === 'dialog:header' || context === 'dialog:sheet') {
			return { 'data-mdc-dialog-action': $$props.action };
		} else {
			return { action: $$props.action };
		}
	});

	let previousDisabled = !!$$props.disabled;

	$.user_effect(() => {
		if (previousDisabled != !!$$props.disabled) {
			if (element) {
				const el = getElement();

				if ('blur' in el) {
					el.blur();
				}
			}

			previousDisabled = !!$$props.disabled;
		}
	});

	setContext('SMUI:icon:context', 'icon-button');

	let oldToggle = null;

	$.user_effect(() => {
		if (element && getElement() && toggle() !== oldToggle) {
			if (toggle() && !instance) {
				instance = new MDCIconButtonToggleFoundation({
					addClass,
					hasClass,
					notifyChange: (evtData) => {
						handleChange(evtData);
						dispatch(getElement(), 'SMUIIconButtonToggleChange', evtData);
					},
					removeClass,
					getAttr,
					setAttr: addAttr
				});

				instance.init();
			} else if (!toggle() && instance) {
				instance.destroy();
				instance = undefined;
				$.set(internalClasses, {}, true);
				$.set(internalAttrs, {}, true);
			}

			oldToggle = toggle();
		}
	});

	$.user_effect(() => {
		if (instance && !isUninitializedValue(pressed()) && instance.isOn() !== pressed()) {
			instance.toggle(pressed());
		}
	});

	onMount(() => {
		return () => {
			instance?.destroy();
			instance = undefined;
		};
	});

	function hasClass(className) {
		return className in $.get(internalClasses)
			? $.get(internalClasses)[className]
			: getElement().classList.contains(className);
	}

	function addClass(className) {
		if (!$.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in $.get(internalClasses)) || $.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = false;
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

	function getAttr(name) {
		return name in $.get(internalAttrs)
			? $.get(internalAttrs)[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if ($.get(internalAttrs)[name] !== value) {
			$.get(internalAttrs)[name] = value;
		}
	}

	function handleChange(evtData) {
		pressed(evtData.isOn);
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
					unbounded: true,
					color: $$props.color,
					disabled: !!$$props.disabled,
					addClass,
					removeClass,
					addStyle
				}
			],
			...use()
		]);

		let $1 = $.derived(() => classMap({
			'mdc-icon-button': true,
			'mdc-icon-button--on': !isUninitializedValue(pressed()) && pressed(),
			'mdc-icon-button--touch': touch(),
			'mdc-icon-button--display-flex': displayFlex(),
			'smui-icon-button--size-button': size() === 'button',
			'smui-icon-button--size-mini': size() === 'mini',
			'mdc-icon-button--reduced-size': size() === 'mini' || size() === 'button',
			'mdc-card__action': context === 'card:action',
			'mdc-card__action--icon': context === 'card:action',
			'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',
			'mdc-top-app-bar__action-item': context === 'top-app-bar:action',
			'mdc-snackbar__dismiss': context === 'snackbar:actions',
			'mdc-data-table__pagination-button': context === 'data-table:pagination',
			'mdc-data-table__sort-icon-button': context === 'data-table:sortable-header-cell',
			'mdc-dialog__close': (context === 'dialog:header' || context === 'dialog:sheet') && $$props.action === 'close',
			...$.get(internalClasses),
			[className()]: true
		}));

		let $2 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));
		let $3 = $.derived(() => !isUninitializedValue(pressed()) ? pressed() ? 'true' : 'false' : null);
		let $4 = $.derived(() => pressed() ? $$props.ariaLabelOn : $$props.ariaLabelOff);

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
						},

						get 'aria-pressed'() {
							return $.get($3);
						},

						get 'aria-label'() {
							return $.get($4);
						},

						get 'data-aria-label-on'() {
							return $$props.ariaLabelOn;
						},

						get 'data-aria-label-off'() {
							return $$props.ariaLabelOff;
						},

						get 'aria-describedby'() {
							return ariaDescribedby;
						},

						get href() {
							return $$props.href;
						}
					},
					() => $.get(actionProp),
					() => $.get(internalAttrs),
					() => restProps,
					{
						onclick: (e) => {
							if (instance) {
								instance.handleClick();
							}

							if (context === 'top-app-bar:navigation') {
								dispatch(getElement(), 'SMUITopAppBarIconButtonNav');
							}

							$$props.onclick?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_1 = $.sibling($.first_child(fragment_1), 2);

							{
								var consequent = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								$.if(node_1, ($$render) => {
									if (focusRing()) $$render(consequent);
								});
							}

							var node_2 = $.sibling(node_1, 2);

							$.snippet(node_2, () => $$props.children ?? $.noop);

							var node_3 = $.sibling(node_2);

							{
								var consequent_1 = ($$anchor) => {
									var div = root_1();

									$.append($$anchor, div);
								};

								$.if(node_3, ($$render) => {
									if (touch()) $$render(consequent_1);
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