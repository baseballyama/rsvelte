import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandRootState } from "../command.svelte.js";
import CommandLabel from "./_command-label.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { computeCommandScore } from "../index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'onValueChange',
	'onStateChange',
	'loop',
	'shouldFilter',
	'filter',
	'label',
	'vimBindings',
	'disablePointerSelection',
	'disableInitialScroll',
	'columns',
	'children',
	'child'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Command($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const // Imperative APIs - DO NOT REMOVE OR RENAME
	/**
	 * Sets selection to item at specified index in valid items array.
	 * If index is out of bounds, does nothing.
	 *
	 * @param index - Zero-based index of item to select
	 * @remarks
	 * Uses `getValidItems()` to get selectable items, filtering out disabled/hidden ones.
	 * Access valid items directly via `getValidItems()` to check bounds before calling.
	 *
	 * @example
	 * // get valid items length for bounds check
	 * const items = getValidItems()
	 * if (index < items.length) {
	 *   updateSelectedToIndex(index)
	 * }
	 */
	/**
	 * Moves selection to the first valid item in the next/previous group.
	 * If no group is found, falls back to selecting the next/previous item globally.
	 *
	 * @param change - Direction to move: 1 for next group, -1 for previous group
	 * @example
	 * // move to first item in next group
	 * updateSelectedByGroup(1)
	 *
	 * // move to first item in previous group
	 * updateSelectedByGroup(-1)
	 */
	/**
	 * Updates selected item by moving up/down relative to current selection.
	 * Handles wrapping when loop option is enabled.
	 *
	 * @param change - Direction to move: 1 for next item, -1 for previous item
	 * @remarks
	 * The loop behavior wraps:
	 * - From last item to first when moving next
	 * - From first item to last when moving previous
	 *
	 * Uses `getValidItems()` to get all selectable items, which filters out disabled/hidden items.
	 * You can call `getValidItems()` directly to get the current valid items array.
	 *
	 * @example
	 * // select next item
	 * updateSelectedByItem(1)
	 *
	 * // get all valid items
	 * const items = getValidItems()
	 */
	/**
	 * Gets all non-disabled, visible command items.
	 *
	 * @returns Array of valid item elements
	 * @remarks Exposed for direct item access and bound checking
	 */
	Label = ($$anchor) => {
		CommandLabel($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, label()));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	};

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		onStateChange = $.prop($$props, 'onStateChange', 3, noop),
		loop = $.prop($$props, 'loop', 3, false),
		shouldFilter = $.prop($$props, 'shouldFilter', 3, true),
		filter = $.prop($$props, 'filter', 3, computeCommandScore),
		label = $.prop($$props, 'label', 3, ""),
		vimBindings = $.prop($$props, 'vimBindings', 3, true),
		disablePointerSelection = $.prop($$props, 'disablePointerSelection', 3, false),
		disableInitialScroll = $.prop($$props, 'disableInitialScroll', 3, false),
		columns = $.prop($$props, 'columns', 3, null),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = CommandRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		filter: boxWith(() => filter()),
		shouldFilter: boxWith(() => shouldFilter()),
		loop: boxWith(() => loop()),
		value: boxWith(() => value(), (v) => {
			if (value() !== v) {
				value(v);
				onValueChange()(v);
			}
		}),
		vimBindings: boxWith(() => vimBindings()),
		disablePointerSelection: boxWith(() => disablePointerSelection()),
		disableInitialScroll: boxWith(() => disableInitialScroll()),
		onStateChange: boxWith(() => onStateChange()),
		columns: boxWith(() => columns())
	});

	// Imperative APIs - DO NOT REMOVE OR RENAME
	/**
	 * Sets selection to item at specified index in valid items array.
	 * If index is out of bounds, does nothing.
	 *
	 * @param index - Zero-based index of item to select
	 * @remarks
	 * Uses `getValidItems()` to get selectable items, filtering out disabled/hidden ones.
	 * Access valid items directly via `getValidItems()` to check bounds before calling.
	 *
	 * @example
	 * // get valid items length for bounds check
	 * const items = getValidItems()
	 * if (index < items.length) {
	 *   updateSelectedToIndex(index)
	 * }
	 */
	const updateSelectedToIndex = (i) => rootState.updateSelectedToIndex(i);

	/**
	 * Moves selection to the first valid item in the next/previous group.
	 * If no group is found, falls back to selecting the next/previous item globally.
	 *
	 * @param change - Direction to move: 1 for next group, -1 for previous group
	 * @example
	 * // move to first item in next group
	 * updateSelectedByGroup(1)
	 *
	 * // move to first item in previous group
	 * updateSelectedByGroup(-1)
	 */
	const updateSelectedByGroup = (c) => rootState.updateSelectedByGroup(c);

	/**
	 * Updates selected item by moving up/down relative to current selection.
	 * Handles wrapping when loop option is enabled.
	 *
	 * @param change - Direction to move: 1 for next item, -1 for previous item
	 * @remarks
	 * The loop behavior wraps:
	 * - From last item to first when moving next
	 * - From first item to last when moving previous
	 *
	 * Uses `getValidItems()` to get all selectable items, which filters out disabled/hidden items.
	 * You can call `getValidItems()` directly to get the current valid items array.
	 *
	 * @example
	 * // select next item
	 * updateSelectedByItem(1)
	 *
	 * // get all valid items
	 * const items = getValidItems()
	 */
	const updateSelectedByItem = (c) => rootState.updateSelectedByItem(c);

	/**
	 * Gets all non-disabled, visible command items.
	 *
	 * @returns Array of valid item elements
	 * @remarks Exposed for direct item access and bound checking
	 */
	const getValidItems = () => rootState.getValidItems();

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

	var $$exports = {
		updateSelectedToIndex,
		updateSelectedByGroup,
		updateSelectedByItem,
		getValidItems
	};

	var fragment_2 = $.comment();
	var node = $.first_child(fragment_2);

	{
		var consequent = ($$anchor) => {
			var fragment_3 = root();
			var node_1 = $.first_child(fragment_3);

			Label(node_1);

			var node_2 = $.sibling(node_1, 2);

			$.snippet(node_2, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_3);
		};

		var alternate = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_3 = $.child(div);

			Label(node_3);

			var node_4 = $.sibling(node_3, 2);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_2);

	return $.pop($$exports);
}