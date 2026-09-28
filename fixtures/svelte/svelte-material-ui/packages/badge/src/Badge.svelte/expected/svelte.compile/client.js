import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'square',
	'color',
	'position',
	'align',
	'children'
]);

var root = $.from_html(`<span><!></span>`);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Square off the corners, instead of rounding them.
	 */
	/**
	 * The color of the badge.
	 */
	/**
	 * The position of the badge relative to the edge/corner it is aligned to.
	 */
	/**
	 * The edge or corner to align the badge to.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		square = $.prop($$props, 'square', 3, false),
		color = $.prop($$props, 'color', 3, 'primary'),
		position = $.prop($$props, 'position', 3, 'middle'),
		align = $.prop($$props, 'align', 3, 'top-end'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var span = root();

	$.attribute_effect(span, ($0) => ({ class: $0, role: 'status', ...restProps }), [
		() => classMap({
			'smui-badge': true,
			'smui-badge--rounded': !square(),
			['smui-badge--color-' + color()]: true,
			['smui-badge--position-' + position()]: true,
			['smui-badge--align-' + align()]: true,
			[className()]: true
		})
	]);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.bind_this(span, ($$value) => element = $$value, () => element);
	$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, span);

	return $.pop($$exports);
}