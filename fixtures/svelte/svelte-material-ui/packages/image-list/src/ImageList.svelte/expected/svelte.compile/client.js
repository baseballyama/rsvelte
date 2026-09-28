import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'masonry',
	'withTextProtection',
	'children'
]);

var root = $.from_html(`<ul><!></ul>`);

export default function ImageList($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether to use masonry layout.
	 */
	/**
	 * Whether to move the text over the image in a caption area at the bottom.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		masonry = $.prop($$props, 'masonry', 3, false),
		withTextProtection = $.prop($$props, 'withTextProtection', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	setContext('SMUI:label:context', 'image-list');

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var ul = root();

	$.attribute_effect(ul, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-image-list': true,
			'mdc-image-list--masonry': masonry(),
			'mdc-image-list--with-text-protection': withTextProtection(),
			[className()]: true
		})
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.bind_this(ul, ($$value) => element = $$value, () => element);
	$.action(ul, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, ul);

	return $.pop($$exports);
}