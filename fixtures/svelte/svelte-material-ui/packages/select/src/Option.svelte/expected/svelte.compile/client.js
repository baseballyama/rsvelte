import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { Item } from '@smui/list';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'value',
	'children'
]);

export default function Option($$anchor, $$props) {
	$.push($$props, true);

	const $selectedValue = () => $.store_get(selectedValue, '$selectedValue', $$stores);
	const $selectedText = () => $.store_get(selectedText, '$selectedText', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The value of the input.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		value = $.prop($$props, 'value', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const selectedText = getContext('SMUI:select:selectedText');
	const selectedValue = getContext('SMUI:select:value');

	setContext('SMUI:list:item:role', 'option');

	const selected = $.derived(() => value() != null && value() !== '' && $selectedValue() === value());

	onMount(setSelectedText);
	onDestroy(setSelectedText);

	function setSelectedText() {
		if ($.get(selected) && element) {
			$.store_set(selectedText, element.getPrimaryText());
		}
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };

	$.bind_this(
		Item($$anchor, $.spread_props(
			{
				get use() {
					return use();
				},

				get 'data-value'() {
					return value();
				},

				get value() {
					return value();
				},

				get selected() {
					return $.get(selected);
				}
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					$.snippet(node, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		)),
		($$value) => element = $$value,
		() => element
	);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}