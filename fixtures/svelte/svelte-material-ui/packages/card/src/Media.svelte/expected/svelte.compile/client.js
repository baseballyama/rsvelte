import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'aspectRatio',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Media($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Force an aspect ratio.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-card__media': true,
			'mdc-card__media--square': $$props.aspectRatio === 'square',
			'mdc-card__media--16-9': $$props.aspectRatio === '16x9',
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