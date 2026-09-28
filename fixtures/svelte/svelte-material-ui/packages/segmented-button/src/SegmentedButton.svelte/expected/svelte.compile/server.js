import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import { ContextFragment } from '@smui/common';
import { MDCSegmentedButtonFoundation } from './mdc';

export default function SegmentedButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of segment objects.
		 */
		/**
		 * Function that takes segment object and returns a unique string or number.
		 *
		 * If your segments are strings or numbers, you don't need this.
		 */
		/**
		 * Allow only one selection.
		 *
		 * When this is true, `selected` will be one segment object.
		 */
		/**
		 * The segment that is or segments that are currently selected.
		 */
		let {
			use = [],
			class: className = '',
			segments = [],
			key = (segment) => segment,
			singleSelect = false,
			selected = void 0,
			segment,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (singleSelect && typeof selected === 'object' && 'findIndex' in selected) {
			throw new Error('Single-select segmented buttons must not be given multiple selected segments.');
		}

		if (!singleSelect && selected !== undefined && (typeof selected !== 'object' || !('findIndex' in selected))) {
			throw new Error('Multi-select segmented buttons must be given an array of selected segments.');
		}

		let element;
		let instance = void 0;
		let segmentAccessorMap = {};
		let segmentAccessorWeakMap = new WeakMap();
		let initialSelected = segments.map((segmentId) => singleSelect && selected != null && key(selected) === key(segmentId) || !singleSelect && selected != null && selected.findIndex((segment) => key(segment) === key(segmentId)) !== -1);

		setContext('SMUI:icon:context', 'segmented-button');
		setContext('SMUI:label:context', 'segmented-button');

		const singleSelectStore = writable(singleSelect);

		setContext('SMUI:segmented-button:singleSelect', singleSelectStore);

		let previousSelected = singleSelect ? selected : new Set(selected ?? []);

		function setDifference(setA, setB) {
			let _difference = new Set(setA);

			for (let elem of setB) {
				_difference.delete(elem);
			}

			return _difference;
		}

		setContext('SMUI:segmented-button:segment:mount', (accessor) => {
			addAccessor(accessor.segmentId, accessor);
		});

		setContext('SMUI:segmented-button:segment:unmount', (accessor) => {
			removeAccessor(accessor.segmentId);
		});

		onMount(() => {
			instance = new MDCSegmentedButtonFoundation({
				hasClass: (className) => {
					return getElement().classList.contains(className);
				},

				getSegments: () => {
					return segments.map((segmentKey, index) => ({
						index,
						selected: selected == null
							? false
							: singleSelect
								? key(selected) === key(segmentKey)
								: selected.findIndex((segment) => key(segment) === key(segmentKey)) !== -1

						// segmentId: segmentKey, // Not necessarily a string.
					}));
				},
				selectSegment,
				unselectSegment,
				notifySelectedChange: (detail) => {
					if (detail.selected) {
						selectSegment(detail.index);
					} else {
						unselectSegment(detail.index);
					}

					dispatch(getElement(), 'change', detail);
				}
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		function handleSelected(event) {
			if (instance) {
				instance.handleSelected(event.detail);
			}
		}

		function getAccessor(segmentId) {
			return segmentId instanceof Object
				? segmentAccessorWeakMap.get(segmentId)
				: segmentAccessorMap[segmentId];
		}

		function addAccessor(segmentId, accessor) {
			if (segmentId instanceof Object) {
				segmentAccessorWeakMap.set(segmentId, accessor);
			} else {
				segmentAccessorMap[segmentId] = accessor;
			}
		}

		function removeAccessor(segmentId) {
			if (segmentId instanceof Object) {
				segmentAccessorWeakMap.delete(segmentId);
			} else {
				delete segmentAccessorMap[segmentId];
			}
		}

		function selectSegment(indexOrSegmentId) {
			let index = segments.findIndex((segment) => key(segment) === indexOrSegmentId);

			if (index === -1) {
				index = indexOrSegmentId;
			}

			const segmentKey = key(segments[index]);

			if (!singleSelect) {
				if (selected == null) {
					selected = [];
				}

				const selIndex = selected.findIndex((segment) => key(segment) === segmentKey);

				if (selIndex === -1) {
					selected.push(segments[index]);
				}
			} else if (selected == null || key(selected) !== segmentKey) {
				selected = segments[index];
			}

			const accessor = getAccessor(segments[index]);

			if (accessor) {
				accessor.selected = true;
			}
		}

		function unselectSegment(indexOrSegmentId) {
			let index = segments.findIndex((segment) => key(segment) === indexOrSegmentId);

			if (index === -1) {
				index = indexOrSegmentId;
			}

			if (!singleSelect) {
				if (selected != null) {
					const selIndex = selected.findIndex((segment) => key(segment) === key(segments[index]));

					if (selIndex !== -1) {
						selected.splice(selIndex, 1);
					}
				}
			} else if (selected != null && key(selected) === key(segments[index])) {
				selected = undefined;
			}

			const accessor = getAccessor(segments[index]);

			if (accessor) {
				accessor.selected = false;
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-segmented-button': true,
				'mdc-segmented-button--single-select': singleSelect,
				[className]: true
			})),
			role: singleSelect ? 'radiogroup' : 'group',
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(segments);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let segmentKey = each_array[i];

			ContextFragment($$renderer, {
				key: 'SMUI:segmented-button:segment:index',
				value: i,
				children: ($$renderer) => {
					ContextFragment($$renderer, {
						key: 'SMUI:segmented-button:segment:initialSelected',
						value: initialSelected[i],
						children: ($$renderer) => {
							segment($$renderer, segmentKey);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { selected, getElement });
	});
}