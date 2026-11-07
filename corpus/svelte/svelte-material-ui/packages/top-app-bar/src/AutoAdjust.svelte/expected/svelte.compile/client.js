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
	'topAppBar',
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
	 * The Top App Bar that this auto adjuster is for.
	 *
	 * This is REQUIRED! The reason you can provide `null` is so that the
	 * Top App Bar has a chance to mount, then you must provide it.
	 */
	/**
	 * The component to use to render the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		topAppBar = $.prop($$props, 'topAppBar', 3, null),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'main'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const propStore = $.derived(() => topAppBar() && topAppBar().getPropStore());

	const adjustClass = $.derived(() => {
		if (!$.get(propStore) || !$propStore() || $propStore().variant === 'static') {
			return '';
		}

		if ($propStore().variant === 'short') {
			return 'mdc-top-app-bar--short-fixed-adjust';
		}

		if ($propStore().prominent && $propStore().dense) {
			return 'mdc-top-app-bar--dense-prominent-fixed-adjust';
		}

		if ($propStore().prominent) {
			return 'mdc-top-app-bar--prominent-fixed-adjust';
		}

		if ($propStore().dense) {
			return 'mdc-top-app-bar--dense-fixed-adjust';
		}

		return 'mdc-top-app-bar--fixed-adjust';
	});

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({ [$.get(adjustClass)]: true, [className()]: true }));

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