import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'rich',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Wrapper($$anchor, $$props) {
	$.push($$props, true);

	const $tooltip = () => $.store_get(tooltip, '$tooltip', $$stores);
	const $anchor = () => $.store_get(anchor, '$anchor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether this wrapper is for a rich tooltip.
	 *
	 * Rich tooltips can have more than just text content. They are also
	 * automatically wrapped in a div.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		rich = $.prop($$props, 'rich', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const anchor = writable(undefined);
	const tooltip = writable(undefined);

	setContext('SMUI:tooltip:wrapper:anchor', anchor);
	setContext('SMUI:tooltip:wrapper:tooltip', tooltip);
	setContext('SMUI:tooltip:rich', rich());

	$.user_effect(() => {
		if ($tooltip() && !$anchor()) {
			$.store_set(anchor, $tooltip().previousElementSibling);
		}
	});

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
				() => classMap({ 'mdc-tooltip-wrapper--rich': true, [className()]: true })
			]);

			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => element = $$value, () => element);
			$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (rich()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}