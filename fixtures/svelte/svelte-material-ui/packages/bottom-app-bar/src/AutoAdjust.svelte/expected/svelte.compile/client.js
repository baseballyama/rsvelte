import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'bottomAppBar',
	'component',
	'tag',
	'children'
]);

export default function AutoAdjust($$anchor, $$props) {
	$.push($$props, true);

	const $propStore = () => $.store_get($.get(propStore), '$propStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	 * The Bottom App Bar that this auto adjuster is for.
	 *
	 * This is REQUIRED! The reason you can provide `null` is so that the
	 * Bottom App Bar has a chance to mount, then you must provide it.
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
		bottomAppBar = $.prop($$props, 'bottomAppBar', 3, null),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'main'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalStyles = $.proxy({});
	const propStore = $.derived(() => bottomAppBar() && bottomAppBar().getPropStore());

	const adjustClass = $.derived(() => {
		if (!$.get(propStore) || !$propStore() || $propStore().variant === 'static') {
			return '';
		}

		return `smui-bottom-app-bar--${$propStore().variant}-adjust ${$propStore().withFab ? 'smui-bottom-app-bar--with-fab' : ''}`;
	});

	$.user_effect(() => {
		if (!$.get(propStore) || !$propStore() || $propStore().variant === 'static') {
			addStyle('--smui-bottom-app-bar--fab-offset', '0px');

			return;
		}

		addStyle('--smui-bottom-app-bar--fab-offset', $propStore().adjustOffset + 'px');
	});

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
		let $0 = $.derived(() => classMap({ [$.get(adjustClass)]: true, [className()]: true }));
		let $1 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return use();
						},

						get class() {
							return $.get($0);
						},

						get style() {
							return $.get($1);
						}
					},
					() => restProps,
					{
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_1 = $.first_child(fragment_1);

							$.snippet(node_1, () => $$props.children ?? $.noop);
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

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}