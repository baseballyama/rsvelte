import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'variant',
	'square',
	'color',
	'elevation',
	'transition',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Paper($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The visual variant of the Paper.
	 */
	/**
	 * When true, removes the rounded corners.
	 */
	/**
	 * The color styling to apply to the Paper.
	 *
	 * Default, primary, and secondary are provided by SMUI. You can use custom
	 * scss styling to add your own color styling.
	 */
	/**
	 * The elevation styling to apply to the Paper.
	 */
	/**
	 * Whether transition animation styling should be applied to the Paper.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'raised'),
		square = $.prop($$props, 'square', 3, false),
		color = $.prop($$props, 'color', 3, 'default'),
		elevation = $.prop($$props, 'elevation', 3, 1),
		transition = $.prop($$props, 'transition', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'smui-paper': true,
			'smui-paper--raised': variant() === 'raised',
			'smui-paper--unelevated': variant() === 'unelevated',
			'smui-paper--outlined': variant() === 'outlined',
			['smui-paper--elevation-z' + elevation()]: elevation() !== 0 && variant() === 'raised',
			'smui-paper--rounded': !square(),
			['smui-paper--color-' + color()]: color() !== 'default',
			'smui-paper-transition': transition(),
			[className()]: true
		})
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}