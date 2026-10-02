import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandRootState } from "../command.svelte.js";
import CommandLabel from "./_command-label.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { computeCommandScore } from "../index.js";

export default function Command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = "",
			onValueChange = noop,
			onStateChange = noop,
			loop = false,
			shouldFilter = true,
			filter = computeCommandScore,
			label = "",
			vimBindings = true,
			disablePointerSelection = false,
			disableInitialScroll = false,
			columns = null,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = CommandRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			filter: boxWith(() => filter),
			shouldFilter: boxWith(() => shouldFilter),
			loop: boxWith(() => loop),
			value: boxWith(() => value, (v) => {
				if (value !== v) {
					value = v;
					onValueChange(v);
				}
			}),
			vimBindings: boxWith(() => vimBindings),
			disablePointerSelection: boxWith(() => disablePointerSelection),
			disableInitialScroll: boxWith(() => disableInitialScroll),
			onStateChange: boxWith(() => onStateChange),
			columns: boxWith(() => columns)
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

		function Label($$renderer) {
			CommandLabel($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(label)}`);
				},
				$$slots: { default: true }
			});
		}

		if (child) {
			$$renderer.push('<!--[0-->');
			Label($$renderer);
			$$renderer.push(`<!----> `);
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			Label($$renderer);
			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);

		$.bind_props($$props, {
			ref,
			value,
			updateSelectedToIndex,
			updateSelectedByGroup,
			updateSelectedByItem,
			getValidItems
		});
	});
}