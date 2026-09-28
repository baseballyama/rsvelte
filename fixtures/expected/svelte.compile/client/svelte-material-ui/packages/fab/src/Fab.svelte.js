import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap } from '@smui/common/internal';
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
	'focusRing',
	'color',
	'mini',
	'exited',
	'extended',
	'touch',
	'href',
	'component',
	'tag',
	'children'
]);

var root = $.from_html(`<div class="mdc-fab__focus-ring"></div>`);
var root_1 = $.from_html(`<div class="mdc-fab__touch"></div>`);
var root_2 = $.from_html(`<div class="mdc-fab__ripple"></div> <!> <!><!>`, 1);

export default function Fab($$anchor, $$props) {
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
	 * Whether to show a focus fing.
	 */
	/**
	 * The color of the button.
	 */
	/**
	 * Whether to shrink the button to mini size.
	 */
	/**
	 * Change this to true to animate out the button.
	 */
	/**
	 * Whether to use the extended style with a label.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * If provided, the button will act as a link.
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
		focusRing = $.prop($$props, 'focusRing', 3, false),
		color = $.prop($$props, 'color', 3, 'secondary'),
		mini = $.prop($$props, 'mini', 3, false),
		exited = $.prop($$props, 'exited', 3, false),
		extended = $.prop($$props, 'extended', 3, false),
		touch = $.prop($$props, 'touch', 3, false),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 19, () => $$props.href == null ? 'button' : 'a'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});

	setContext('SMUI:label:context', 'fab');
	setContext('SMUI:icon:context', 'fab');

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
			'mdc-fab': true,
			'mdc-fab--mini': mini(),
			'mdc-fab--exited': exited(),
			'mdc-fab--extended': extended(),
			'smui-fab--color-primary': color() === 'primary',
			'mdc-fab--touch': touch(),
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
						},

						get href() {
							return $$props.href;
						}
					},
					() => restProps,
					{
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_1 = $.sibling($.first_child(fragment_1), 2);

							{
								var consequent = ($$anchor) => {
									var div = root();

									$.append($$anchor, div);
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
									var div_1 = root_1();

									$.append($$anchor, div_1);
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