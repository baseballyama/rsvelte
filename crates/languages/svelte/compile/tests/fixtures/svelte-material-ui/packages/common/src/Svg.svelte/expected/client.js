import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useActions } from './internal/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'use', 'children']);
var root = $.from_svg(`<svg><!></svg>`);

export default function Svg($$anchor, $$props) {
	$.push($$props, true);

	if (console && console.warn) {
		console.warn('The @smui/common Svg component is deprecated. You can use `tag="svg"` now.');
	}

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var svg = root();

	$.attribute_effect(svg, () => ({ ...restProps }));

	var node = $.child(svg);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(svg);
	$.bind_this(svg, ($$value) => element = $$value, () => element);
	$.action(svg, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, svg);

	return $.pop($$exports);
}